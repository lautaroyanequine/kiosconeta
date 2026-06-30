using Application.DTOs.Dashboard;
using Application.Interfaces.Repository;
using Application.Interfaces.Services;
using Domain.Entities;
using Domain.Enums;
using System.Linq;


namespace Application.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IVentaRepository _ventaRepository;
        private readonly IGastoRepository _gastoRepository;
        private readonly IProductoRepository _productoRepository;
        private readonly IProductoVentaRepository _productoVentaRepository;
        private readonly ICierreTurnoRepository _cierreTurnoRepository;
        private readonly IAuditoriaRepository _auditoriaRepository;

        public DashboardService(
            IVentaRepository ventaRepository,
            IGastoRepository gastoRepository,
            IProductoRepository productoRepository,
            IProductoVentaRepository productoVentaRepository,
            ICierreTurnoRepository cierreTurnoRepository,
            IAuditoriaRepository auditoriaRepository)
        {
            _ventaRepository = ventaRepository;
            _gastoRepository = gastoRepository;
            _productoRepository = productoRepository;
            _productoVentaRepository = productoVentaRepository;
            _cierreTurnoRepository = cierreTurnoRepository;
            _auditoriaRepository = auditoriaRepository;
        }

        // ═══════════════════════════════════════════════════
        // DASHBOARD GENERAL
        // ═══════════════════════════════════════════════════

        public async Task<DashboardResponseDTO> GetDashboardAsync(int kioscoId)
        {
            var hoy = DateTime.Today;
            var inicioMes = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);

            var ventasHoy = await _ventaRepository.GetVentasDelDiaAsync(kioscoId);
            var gastosHoy = await _gastoRepository.GetDelDiaAsync(kioscoId);

            var ventasHoyValidas = ventasHoy.Where(v => !v.Anulada).ToList();

            var resumenHoy = new ResumenDelDiaDTO
            {
                Fecha = hoy,
                CantidadVentas = ventasHoyValidas.Count,
                TotalVentas = ventasHoyValidas.Sum(v => v.Total),
                TotalGastos = gastosHoy.Sum(g => g.Monto),
                Ganancia = ventasHoyValidas.Sum(v => v.Total - v.PrecioCosto) - gastosHoy.Sum(g => g.Monto),
                VentaPromedio = ventasHoyValidas.Any()
                    ? ventasHoyValidas.Average(v => v.Total)
                    : 0
            };

            var ventasMes = await _ventaRepository.GetByFechaAsync(inicioMes, DateTime.UtcNow);
            ventasMes = ventasMes.Where(v => v.Empleado.KioscoID == kioscoId && !v.Anulada);

            var gastosMes = await _gastoRepository.GetByFechaAsync(inicioMes, DateTime.UtcNow);
            gastosMes = gastosMes.Where(g => g.KioscoId == kioscoId);

            var ventasMesList = ventasMes.ToList();
            var gastosMesList = gastosMes.ToList();

            var diasOperativos = ventasMesList
                .Select(v => v.Fecha.Date)
                .Distinct()
                .Count();

            var totalVentasMes = ventasMesList.Sum(v => v.Total);
            var totalGastosMes = gastosMesList.Sum(g => g.Monto);
            var gananciaMes = ventasMesList.Sum(v => v.Total - v.PrecioCosto) - totalGastosMes;

            var resumenMes = new ResumenDelMesDTO
            {
                Mes = DateTime.UtcNow.Month,
                Anio = DateTime.UtcNow.Year,
                CantidadVentas = ventasMesList.Count,
                TotalVentas = totalVentasMes,
                TotalGastos = totalGastosMes,
                Ganancia = gananciaMes,
                DiasOperativos = diasOperativos,
                PromedioVentasDiarias = diasOperativos > 0
                    ? totalVentasMes / diasOperativos
                    : 0
            };

            var productosVentaMes =
                await _productoVentaRepository.GetByKioscoYFechaAsync(kioscoId, inicioMes);

            var topProductos = productosVentaMes
                .GroupBy(pv => new
                {
                    pv.ProductoId,
                    pv.Producto.Nombre,
                    Categoria = pv.Producto.Categoria.Nombre
                })
                .Select(g => new ProductoMasVendidoDTO
                {
                    ProductoId = g.Key.ProductoId,
                    Nombre = g.Key.Nombre,
                    CantidadVendida = g.Sum(pv => pv.Cantidad),
                    TotalVentas = g.Sum(pv => pv.Cantidad * pv.PrecioUnitario),
                    Categoria = g.Key.Categoria
                })
                .OrderByDescending(p => p.CantidadVendida)
                .Take(5)
                .ToList();

            var metodosPago = ventasMesList
                .GroupBy(v => v.MetodoPago.Nombre)
                .Select(g => new MetodoPagoEstadisticaDTO
                {
                    MetodoPago = g.Key,
                    CantidadVentas = g.Count(),
                    Total = g.Sum(v => v.Total),
                    Porcentaje = totalVentasMes > 0
                        ? (g.Sum(v => v.Total) / totalVentasMes) * 100
                        : 0
                })
                .OrderByDescending(m => m.Total)
                .ToList();

            var balance = new BalanceDTO
            {
                TotalIngresos = totalVentasMes,
                TotalEgresos = totalGastosMes,
                Ganancia = gananciaMes,
                MargenGanancia = totalVentasMes > 0
                    ? (gananciaMes / totalVentasMes) * 100
                    : 0
            };

            return new DashboardResponseDTO
            {
                ResumenHoy = resumenHoy,
                ResumenMes = resumenMes,
                TopProductos = topProductos,
                MetodosPago = metodosPago,
                Balance = balance
            };
        }


        public async Task<AnalisisProductosResponseDTO> GetAnalisisProductosAsync(int kioscoId, DateTime fechaDesde, DateTime fechaHasta)
        {
            var diasAnalizados = Math.Max(1, (int)(fechaHasta - fechaDesde).TotalDays);

            // 1. Traemos TODOS los productos del kiosco
            var todosLosProductos = await _productoRepository.GetByKioscoIdAsync(kioscoId);

            // 2. Traemos las ventas del período
            var ventas = await _productoVentaRepository.GetByKioscoYPeriodoAsync(kioscoId, fechaDesde, fechaHasta);

            // 3. Optimizamos: Agrupamos ventas en un diccionario por ProductoId para acceso rápido
            var ventasLookup = ventas
                .GroupBy(v => v.ProductoId)
                .ToDictionary(g => g.Key, g => g.ToList());

            // 4. Procesamos todos los productos
            var detalleProductos = todosLosProductos.Select(p =>
            {
                // Obtenemos las ventas del diccionario (si no hay, lista vacía)
                var ventasProducto = ventasLookup.ContainsKey(p.ProductoId)
                    ? ventasLookup[p.ProductoId]
                    : new List<ProductoVenta>(); // Asegúrate de usar el tipo correcto de tu entidad de venta

                var unidades = ventasProducto.Sum(v => v.Cantidad);
                var ingresos = ventasProducto.Sum(v => v.PrecioUnitario * v.Cantidad);
                var costo = ventasProducto.Sum(v => v.Producto.PrecioCosto * v.Cantidad);
                var ganancia = ingresos - costo;

                var promDiario = (decimal)unidades / diasAnalizados;
                var recomendacion = unidades > 0
                    ? (int)Math.Ceiling(promDiario * diasAnalizados * 1.1m)
                    : 0;

                var diasStock = promDiario > 0
                ? Math.Round((decimal)p.StockActual / promDiario, 1)
                : 999;

                var ultimaVenta = ventasProducto.Any()
                    ? ventasProducto.Max(v => v.Venta.Fecha)
                    : (DateTime?)null;


                return new AnalisisProductoDTO
                {
                    ProductoId = p.ProductoId,
                    Nombre = p.Nombre,
                    Categoria = p.Categoria?.Nombre ?? "Sin categoría",
                    UnidadesVendidas = unidades,
                    TotalIngresos = ingresos,
                    TotalCosto = costo,
                    Ganancia = ganancia,
                    MargenGanancia = ingresos > 0 ? Math.Round((ganancia / ingresos) * 100, 1) : 0,
                    StockActual = p.StockActual,
                    StockMinimo = p.StockMinimo,
                    DiasAnalizados = diasAnalizados,
                    PromedioVentasDiarias = Math.Round(promDiario, 2),
                    RecomendacionCompra = recomendacion,
                    CostoTotalRecomendado = recomendacion * p.PrecioCosto,
                    DiasStockRestante = diasStock,  
                    UltimaVenta = ultimaVenta,
                };
            })
            .OrderByDescending(p => p.UnidadesVendidas)
            .ToList();

            return new AnalisisProductosResponseDTO
            {
                DiasAnalizados = diasAnalizados,
                FechaDesde = fechaDesde,
                FechaHasta = fechaHasta,
                TotalProductosVendidos = detalleProductos.Count(p => p.UnidadesVendidas > 0),
                TotalIngresos = detalleProductos.Sum(p => p.TotalIngresos),
                TotalGanancia = detalleProductos.Sum(p => p.Ganancia),
                TotalInversionNecesaria = detalleProductos.Sum(p => p.CostoTotalRecomendado),
                Productos = detalleProductos
            };
        }

        // ═══════════════════════════════════════════════════
        // DETALLE DE PRODUCTO — FRANJAS HORARIAS
        // Agregar este método dentro de DashboardService
        // ═══════════════════════════════════════════════════

        public async Task<ProductoDetalleResponseDTO?> GetDetalleProductoAsync(
            int kioscoId,
            int productoId,
            DateTime fechaDesde,
            DateTime fechaHasta)
        {
            // 1. Validar que el producto pertenece al kiosco
            var producto = await _productoRepository.GetByIdAsync(productoId, kioscoId);
            if (producto == null) return null;

            // 2. Traer todas las líneas de venta del producto en el período
            //    Reutilizamos el mismo repo que ya usás en GetAnalisisProductosAsync
            var todasLasVentas = await _productoVentaRepository
                .GetByKioscoYPeriodoAsync(kioscoId, fechaDesde, fechaHasta);

            var ventasProducto = todasLasVentas
                .Where(pv => pv.ProductoId == productoId && !pv.Venta.Anulada)
                .ToList();

            var diasAnalizados = Math.Max(1, (int)(fechaHasta - fechaDesde).TotalDays);

            // 3. Distribución por hora (array[24])
            //    Contamos UNIDADES vendidas por hora, no cantidad de transacciones
            var distribucionHoraria = new int[24];
            foreach (var pv in ventasProducto)
            {
                var hora = pv.Venta.Fecha.Hour;   // 0–23
                distribucionHoraria[hora] += pv.Cantidad;
            }

            // 4. Top 3 franjas horarias
            var totalUnidades = distribucionHoraria.Sum();
            var franjasHorarias = distribucionHoraria
                .Select((cantidad, hora) => new FranjaHorariaDTO
                {
                    HoraInicio = hora,
                    CantidadVentas = cantidad,
                    Porcentaje = totalUnidades > 0
                        ? Math.Round((decimal)cantidad / totalUnidades * 100, 1)
                        : 0
                })
                .Where(f => f.CantidadVentas > 0)
                .OrderByDescending(f => f.CantidadVentas)
                .Take(3)
                .ToList();

            // 5. Distribución por día de semana (Lunes → Domingo)
            var nombresDias = new[]
            {
        "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"
    };

            var porDia = new int[7];
            foreach (var pv in ventasProducto)
                porDia[(int)pv.Venta.Fecha.DayOfWeek] += pv.Cantidad;

            var totalDias = porDia.Sum();

            // Ordenamos Lunes–Domingo (DayOfWeek: 0=Dom, 1=Lun, … 6=Sáb)
            var ordenLunDom = new[] { 1, 2, 3, 4, 5, 6, 0 };
            var diasSemana = ordenLunDom
                .Select(i => new DiaSemanaDTO
                {
                    Dia = nombresDias[i],
                    CantidadVentas = porDia[i],
                    Porcentaje = totalDias > 0
                        ? Math.Round((decimal)porDia[i] / totalDias * 100, 1)
                        : 0
                })
                .ToList();

            var todosLosQuiebres = await _auditoriaRepository.GetByTipoYPeriodoAsync(
    kioscoId,
    TipoEventoAuditoria.QuiebreDeStock,
    fechaDesde,
    fechaHasta);

            // Filtramos por productoId dentro del DatosJson
            // El JSON guardado es: {"productoId":5,"productoNombre":"...","ventaId":...}
            var quiebresProducto = todosLosQuiebres
                .Where(a =>
                    a.DatosJson != null &&                                    // ← DatosJson, no Datos
                    a.DatosJson.Contains($"\"productoId\":{productoId}"))     // match exacto de número
                .ToList();

            return new ProductoDetalleResponseDTO
            {
                ProductoId = producto.ProductoId,
                Nombre = producto.Nombre,
                Categoria = producto.Categoria?.Nombre ?? "Sin categoría",
                DiasAnalizados = diasAnalizados,
                FranjasHorarias = franjasHorarias,
                DistribucionHoraria = distribucionHoraria,
                DiasSemana = diasSemana,
                 CantidadQuiebresStock = quiebresProducto.Count,
                FechasQuiebresStock = quiebresProducto
                .Select(a => a.Fecha)
                .OrderByDescending(f => f)
                .ToList()
            };
        }

        public async Task<MetricasPeriodoDTO> GetMetricasPeriodoAsync(
    int kioscoId, DateTime fechaDesde, DateTime fechaHasta)
        {
            // Ventas del período — misma query que ya usás en GetReporteVentasAsync
            var ventas = await _ventaRepository.GetByFechaAsync(fechaDesde, fechaHasta);
            var ventasList = ventas
                .Where(v => v.Empleado.KioscoID == kioscoId && !v.Anulada)
                .ToList();

            var totalVendido = ventasList.Sum(v => v.Total);
            var cantidadVentas = ventasList.Count;
            var ticketPromedio = cantidadVentas > 0 ? totalVendido / cantidadVentas : 0;

            // Efectivo vs Virtual — mismo criterio que CierreTurnoService.CerrarTurnoAsync
            var totalEfectivo = ventasList
                .Where(v => v.MetodoPago != null &&
                            v.MetodoPago.Nombre.Trim().ToLower().Contains("efectivo"))
                .Sum(v => v.Total);

            var totalVirtual = ventasList
                .Where(v => v.MetodoPago != null &&
                            !v.MetodoPago.Nombre.Trim().ToLower().Contains("efectivo"))
                .Sum(v => v.Total);

            // Diferencia de caja — solo turnos cerrados del período
            var turnos = await _cierreTurnoRepository.GetPorFechaAsync(kioscoId, fechaDesde, fechaHasta);
            var turnosCerrados = turnos
                .Where(t => t.Estado == EstadoCierre.Cerrado)
                .ToList();

            var diferenciaCaja = turnosCerrados.Sum(t => t.Diferencia);

            return new MetricasPeriodoDTO
            {
                TotalVendido = totalVendido,
                CantidadVentas = cantidadVentas,
                TicketPromedio = ticketPromedio,
                DiferenciaCaja = diferenciaCaja,
                TurnosCerrados = turnosCerrados.Count,
                TotalEfectivo = totalEfectivo,
                TotalVirtual = totalVirtual
            };
        }


        // ═══════════════════════════════════════════════════
        // DASHBOARD DIARIO POR TURNOS
        // ═══════════════════════════════════════════════════

        // Cambiar la firma: DateTime fecha → DateTime fechaDesde, DateTime fechaHasta
        public async Task<DashboardDiarioDTO> GetDashboardDiarioAsync(int kioscoId, DateTime fechaDesde, DateTime fechaHasta)
        {
            var turnos = await _cierreTurnoRepository.GetPorFechaAsync(kioscoId, fechaDesde, fechaHasta);
            var turnosList = turnos.ToList();

            // ✅ Una sola query para TODOS los gastos del rango, en vez de una por turno
            var todosLosGastos = await _gastoRepository.GetByFechaAsync(fechaDesde, fechaHasta);
            var gastosPorTurno = todosLosGastos
                .Where(g => g.KioscoId == kioscoId && g.CierreTurnoId.HasValue)
                .GroupBy(g => g.CierreTurnoId!.Value)
                .ToDictionary(g => g.Key, g => g.ToList());

            var resumenTurnos = new List<ResumenTurnoDTO>();

            foreach (var turno in turnosList)
            {
                var ventas = turno.Ventas?.Where(v => !v.Anulada).ToList() ?? new();

                // ✅ Lookup en memoria en vez de query a la DB
                var gastos = gastosPorTurno.TryGetValue(turno.CierreTurnoId, out var g) ? g : new List<Gasto>();

                var totalVentas = ventas.Sum(v => v.Total);
                var totalGastos = gastos.Sum(g => g.Monto);
                var ganancia = ventas.Sum(v => v.Total - v.PrecioCosto) - totalGastos;

                resumenTurnos.Add(new ResumenTurnoDTO
                {
                    CierreTurnoId = turno.CierreTurnoId,
                    Estado = turno.Estado.ToString(),
                    FechaApertura = turno.FechaApertura,
                    FechaCierre = turno.FechaCierre,
                    EfectivoInicial = turno.EfectivoInicial,
                    TotalVentas = totalVentas,
                    TotalGastos = totalGastos,
                    Ganancia = ganancia,
                    CantidadVentas = ventas.Count,
                    Diferencia = turno.Diferencia,
                    Empleados = turno.CierreTurnoEmpleados?
                        .Select(e => e.Empleado?.Nombre ?? "")
                        .ToList() ?? new()
                });
            }

            return new DashboardDiarioDTO
            {
                Fecha = fechaDesde,
                TotalVentas = resumenTurnos.Sum(t => t.TotalVentas),
                TotalGastos = resumenTurnos.Sum(t => t.TotalGastos),
                Ganancia = resumenTurnos.Sum(t => t.Ganancia),
                CantidadVentas = resumenTurnos.Sum(t => t.CantidadVentas),
                CantidadTurnos = resumenTurnos.Count,
                Turnos = resumenTurnos.OrderBy(t => t.FechaApertura).ToList()
            };
        }

        // ═══════════════════════════════════════════════════
        // REPORTE VENTAS
        // ═══════════════════════════════════════════════════

        public async Task<ReporteVentasDTO> GetReporteVentasAsync(int kioscoId, ReporteFiltrosDTO filtros)
        {
            var ventas = await _ventaRepository
                .GetByFechaAsync(filtros.FechaDesde, filtros.FechaHasta);

            ventas = ventas.Where(v =>
                v.Empleado.KioscoID == kioscoId &&
                !v.Anulada);

            if (filtros.EmpleadoId.HasValue)
                ventas = ventas.Where(v => v.EmpleadoId == filtros.EmpleadoId.Value);

            var ventasList = ventas.ToList();

            var ventasPorDia = ventasList
                .GroupBy(v => v.Fecha.Date)
                .Select(g => new VentaPorDiaDTO
                {
                    Fecha = g.Key,
                    CantidadVentas = g.Count(),
                    Total = g.Sum(v => v.Total)
                })
                .OrderBy(v => v.Fecha)
                .ToList();

            var ventasPorEmpleado = ventasList
                .GroupBy(v => v.Empleado.Nombre)
                .Select(g => new VentaPorEmpleadoDTO
                {
                    Empleado = g.Key,
                    CantidadVentas = g.Count(),
                    Total = g.Sum(v => v.Total)
                })
                .OrderByDescending(v => v.Total)
                .ToList();

            var productosVentaPeriodo =
                await _productoVentaRepository.GetByKioscoYFechaAsync(
                    kioscoId,
                    filtros.FechaDesde,
                    filtros.FechaHasta);

            var topProductos = productosVentaPeriodo
                .GroupBy(pv => new
                {
                    pv.ProductoId,
                    pv.Producto.Nombre,
                    Categoria = pv.Producto.Categoria.Nombre
                })
                .Select(g => new ProductoMasVendidoDTO
                {
                    ProductoId = g.Key.ProductoId,
                    Nombre = g.Key.Nombre,
                    CantidadVendida = g.Sum(pv => pv.Cantidad),
                    TotalVentas = g.Sum(pv => pv.Cantidad * pv.PrecioUnitario),
                    Categoria = g.Key.Categoria
                })
                .OrderByDescending(p => p.CantidadVendida)
                .Take(10)
                .ToList();

            var totalMonto = ventasList.Sum(v => v.Total);
            var costoTotal = ventasList.Sum(v => v.PrecioCosto);

            return new ReporteVentasDTO
            {
                FechaDesde = filtros.FechaDesde,
                FechaHasta = filtros.FechaHasta,
                TotalVentas = ventasList.Count,
                TotalMonto = totalMonto,
                CostoTotal = costoTotal,
                GananciaTotal = totalMonto - costoTotal,
                TicketPromedio = ventasList.Any() ? totalMonto / ventasList.Count : 0,
                VentasPorDia = ventasPorDia,
                VentasPorEmpleado = ventasPorEmpleado,
                ProductosMasVendidos = topProductos
            };
        }

        // ═══════════════════════════════════════════════════
        // REPORTE PRODUCTOS
        // ═══════════════════════════════════════════════════

        public async Task<ReporteProductosDTO> GetReporteProductosAsync(int kioscoId)
        {
            var productos = await _productoRepository.GetByKioscoIdAsync(kioscoId);
            var productosList = productos.ToList();

            var productosActivos = productosList.Count(p => p.Activo);
            var productosBajoStock = productosList.Count(p => p.Activo && p.StockActual <= p.StockMinimo);

            var hoy = DateTime.UtcNow;

            var proximosVencer = productosList.Count(p =>
                p.Activo &&
                p.FechaVencimiento.HasValue &&
                p.FechaVencimiento.Value <= hoy.AddDays(30));

            var valorStock = productosList
                .Where(p => p.Activo)
                .Sum(p => p.PrecioCosto * p.StockActual);

            var bajoStockDetalle = productosList
                .Where(p => p.Activo && p.StockActual <= p.StockMinimo)
                .Select(p => new ProductoStockDTO
                {
                    Nombre = p.Nombre,
                    StockActual = p.StockActual,
                    StockMinimo = p.StockMinimo,
                    Categoria = p.Categoria?.Nombre ?? "Sin categoría"
                })
                .OrderBy(p => p.StockActual)
                .ToList();

            var rotacionData =
                await _productoVentaRepository.GetUltimos30DiasAsync(kioscoId);

            var rotacion = rotacionData
                .GroupBy(pv => new { pv.ProductoId, pv.Producto.Nombre })
                .Select(g => new ProductoRotacionDTO
                {
                    Nombre = g.Key.Nombre,
                    VecesVendido = g.Select(pv => pv.VentaId).Distinct().Count(),
                    UnidadesVendidas = g.Sum(pv => pv.Cantidad),
                    UltimaVenta = g.Max(pv => pv.Venta.Fecha)
                })
                .ToList();

            return new ReporteProductosDTO
            {
                TotalProductos = productosList.Count,
                ProductosActivos = productosActivos,
                ProductosBajoStock = productosBajoStock,
                ProductosProximosVencer = proximosVencer,
                ValorStockTotal = valorStock,
                ProductosBajoStockDetalle = bajoStockDetalle,
                ProductosMayorRotacion = rotacion.OrderByDescending(r => r.UnidadesVendidas).Take(10).ToList(),
                ProductosMenorRotacion = rotacion.OrderBy(r => r.UnidadesVendidas).Take(10).ToList()
            };
        }

        // ═══════════════════════════════════════════════════
        // REPORTE FINANCIERO
        // ═══════════════════════════════════════════════════

        public async Task<ReporteFinancieroDTO> GetReporteFinancieroAsync(int kioscoId, ReporteFiltrosDTO filtros)
        {
            var ventas = await _ventaRepository
                .GetByFechaAsync(filtros.FechaDesde, filtros.FechaHasta);

            ventas = ventas.Where(v =>
                v.Empleado.KioscoID == kioscoId &&
                !v.Anulada);

            var ventasList = ventas.ToList();

            var totalVentas = ventasList.Sum(v => v.Total);
            var costoVentas = ventasList.Sum(v => v.PrecioCosto);
            var gananciaBruta = totalVentas - costoVentas;

            var gastos = await _gastoRepository
                .GetByFechaAsync(filtros.FechaDesde, filtros.FechaHasta);

            gastos = gastos.Where(g => g.KioscoId == kioscoId);

            var gastosList = gastos.ToList();
            var totalGastos = gastosList.Sum(g => g.Monto);

            var gastosPorTipo = gastosList
                .GroupBy(g => g.TipoDeGasto.Nombre)
                .Select(g => new GastoPorTipoDTO
                {
                    TipoGasto = g.Key,
                    Total = g.Sum(x => x.Monto),
                    Cantidad = g.Count(),
                    Porcentaje = totalGastos > 0
                        ? (g.Sum(x => x.Monto) / totalGastos) * 100
                        : 0
                })
                .OrderByDescending(g => g.Total)
                .ToList();

            var gananciaNeta = gananciaBruta - totalGastos;

            return new ReporteFinancieroDTO
            {
                FechaDesde = filtros.FechaDesde,
                FechaHasta = filtros.FechaHasta,
                TotalVentas = totalVentas,
                CostoVentas = costoVentas,
                GananciaBruta = gananciaBruta,
                TotalGastos = totalGastos,
                GastosPorTipo = gastosPorTipo,
                GananciaNeta = gananciaNeta,
                MargenGananciaBruta = totalVentas > 0 ? (gananciaBruta / totalVentas) * 100 : 0,
                MargenGananciaNeta = totalVentas > 0 ? (gananciaNeta / totalVentas) * 100 : 0
            };
        }
    }
}

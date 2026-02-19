using Application.DTOs.Dashboard;
using Application.Interfaces.Repository;
using Application.Interfaces.Services;
using Domain.Entities;

namespace Application.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IVentaRepository _ventaRepository;
        private readonly IGastoRepository _gastoRepository;
        private readonly IProductoRepository _productoRepository;
        private readonly IProductoVentaRepository _productoVentaRepository;

        public DashboardService(
            IVentaRepository ventaRepository,
            IGastoRepository gastoRepository,
            IProductoRepository productoRepository,
            IProductoVentaRepository productoVentaRepository)
        {
            _ventaRepository = ventaRepository;
            _gastoRepository = gastoRepository;
            _productoRepository = productoRepository;
            _productoVentaRepository = productoVentaRepository;
        }

        // ═══════════════════════════════════════════════════
        // DASHBOARD GENERAL
        // ═══════════════════════════════════════════════════

        public async Task<DashboardResponseDTO> GetDashboardAsync(int kioscoId)
        {
            var hoy = DateTime.Today;
            var inicioMes = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);

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

            var ventasMes = await _ventaRepository.GetByFechaAsync(inicioMes, DateTime.Now);
            ventasMes = ventasMes.Where(v => v.Empleado.KioscoID == kioscoId && !v.Anulada);

            var gastosMes = await _gastoRepository.GetByFechaAsync(inicioMes, DateTime.Now);
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
                Mes = DateTime.Now.Month,
                Anio = DateTime.Now.Year,
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

            var hoy = DateTime.Now;

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


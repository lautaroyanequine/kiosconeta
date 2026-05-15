using Application.DTOs.Venta;
using Application.Interfaces.Repository;
using Application.Interfaces.Services;
using Domain.Entities;
using Domain.Enums;

namespace Application.Services
{
    public class VentaService : IVentaService
    {
        private readonly IVentaRepository _ventaRepository;
        private readonly IProductoRepository _productoRepository;
        private readonly IEmpleadoRepository _empleadoRepository;
        private readonly IMetodoDePagoRepository _metodoDePagoRepository;
        private readonly ICierreTurnoRepository _cierreTurnoRepository;
        private readonly INumeradorRepository _numeradorRepository;
        private readonly IAuditoriaService _auditoriaService;

        public VentaService(
            IVentaRepository ventaRepository,
            IProductoRepository productoRepository,
            IEmpleadoRepository empleadoRepository,
            IMetodoDePagoRepository metodoDePagoRepository,
            ICierreTurnoRepository cierreTurnoRepository, INumeradorRepository numeradorRepository, IAuditoriaService auditoriaService)
        {
            _ventaRepository = ventaRepository;
            _productoRepository = productoRepository;
            _empleadoRepository = empleadoRepository;
            _metodoDePagoRepository = metodoDePagoRepository;
            _cierreTurnoRepository = cierreTurnoRepository;
            _numeradorRepository = numeradorRepository;
            _auditoriaService = auditoriaService;
        }

        // ========== CONSULTAS ==========

        public async Task<VentaResponseDTO?> GetByIdAsync(int id)
        {
            var venta = await _ventaRepository.GetByIdAsync(id);
            if (venta == null) return null;

            return MapToResponseDTO(venta);
        }

        public async Task<IEnumerable<VentaResponseDTO>> GetAllAsync()
        {
            var ventas = await _ventaRepository.GetAllAsync();
            return ventas.Select(MapToResponseDTO);
        }

        public async Task<IEnumerable<VentaResponseDTO>> GetByKioscoIdAsync(int kioscoId)
        {
            var ventas = await _ventaRepository.GetByKioscoIdAsync(kioscoId);
            return ventas.Select(MapToResponseDTO);
        }

        public async Task<IEnumerable<VentaResponseDTO>> GetByEmpleadoIdAsync(int empleadoId)
        {
            var ventas = await _ventaRepository.GetByEmpleadoIdAsync(empleadoId);
            return ventas.Select(MapToResponseDTO);
        }

        public async Task<IEnumerable<VentaResponseDTO>> GetByFechaAsync(DateTime fechaDesde, DateTime fechaHasta)
        {
            var ventas = await _ventaRepository.GetByFechaAsync(fechaDesde, fechaHasta);
            return ventas.Select(MapToResponseDTO);
        }

        public async Task<IEnumerable<VentaResponseDTO>> GetVentasDelDiaAsync(int kioscoId)
        {
            var ventas = await _ventaRepository.GetVentasDelDiaAsync(kioscoId);
            return ventas.Select(MapToResponseDTO);
        }

        public async Task<IEnumerable<VentaResponseDTO>> GetConFiltrosAsync(int kioscoId, VentaFiltrosDTO filtros)
        {
            var ventas = await _ventaRepository.GetConFiltrosAsync(kioscoId, filtros);
            return ventas.Select(MapToResponseDTO);
        }

        // ========== COMANDOS ==========

        public async Task<VentaResponseDTO> CreateAsync(CreateVentaDTO dto)
        {
            // ─── VALIDACIONES ───────────────────────────

            if (dto.Productos == null || !dto.Productos.Any())
                throw new InvalidOperationException("La venta debe tener al menos un producto");

            // Validar empleado
            var empleado = await _empleadoRepository.GetByIdAsync(dto.EmpleadoId)
                ?? throw new KeyNotFoundException($"Empleado con ID {dto.EmpleadoId} no encontrado");

            if (!empleado.Activo)
                throw new InvalidOperationException("El empleado está inactivo");

            // Validar método de pago
            var metodoPago = await _metodoDePagoRepository.GetByIdAsync(dto.MetodoPagoId)
                ?? throw new KeyNotFoundException($"Método de pago con ID {dto.MetodoPagoId} no encontrado");

            // ─── TURNO ABIERTO ──────────────────────────

            var turnoAbierto = await _cierreTurnoRepository
                .GetTurnoAbiertoAsync(empleado.KioscoID);

            if (turnoAbierto == null)
                throw new InvalidOperationException(
                    "No hay ningún turno abierto. Por favor, abra un turno antes de registrar ventas.");

            // ─── TRAER PRODUCTOS EN UNA SOLA CONSULTA ──

            var productoIds = dto.Productos
                .Select(p => p.ProductoId)
                .ToList();

            var productos = await _productoRepository
                .GetByIdsAsync(productoIds);

            var productosDict = productos.ToDictionary(p => p.ProductoId);

            // ─── VALIDAR Y PREPARAR PRODUCTOS ──────────

            var productosVenta = new List<ProductoVenta>();

            decimal totalVenta = 0;
            decimal costoTotal = 0;

            foreach (var productoDto in dto.Productos)
            {
                if (productoDto.Cantidad <= 0)
                    throw new InvalidOperationException("La cantidad debe ser mayor a 0");

                if (!productosDict.TryGetValue(productoDto.ProductoId, out var producto))
                    throw new KeyNotFoundException($"Producto con ID {productoDto.ProductoId} no encontrado");
                // Validar que el producto pertenece al kiosco del empleado
                if (producto.KioscoId != empleado.KioscoID)
                    throw new InvalidOperationException(
                        $"El producto '{producto.Nombre}' no pertenece a este kiosco");

                if (!producto.Activo)
                    throw new InvalidOperationException($"El producto '{producto.Nombre}' está inactivo");

                if (producto.StockActual < productoDto.Cantidad)
                    throw new InvalidOperationException(
                        $"Stock insuficiente para '{producto.Nombre}'. " +
                        $"Disponible: {producto.StockActual}, Solicitado: {productoDto.Cantidad}");

                var subtotal = producto.PrecioVenta * productoDto.Cantidad;
                var subtotalCosto = producto.PrecioCosto * productoDto.Cantidad;

                totalVenta += subtotal;
                costoTotal += subtotalCosto;

                productosVenta.Add(new ProductoVenta
                {
                    ProductoId = producto.ProductoId,
                    Cantidad = productoDto.Cantidad,
                    PrecioUnitario = producto.PrecioVenta
                });
            }

            // ─── GENERAR NÚMERO DE VENTA SEGURO ────────

            var numeroVenta = await _numeradorRepository
                .GenerarNumeroVentaAsync(empleado.KioscoID);

            // ─── CREAR VENTA ───────────────────────────

            var venta = new Venta
            {
                EmpleadoId = dto.EmpleadoId,
                MetodoPagoId = dto.MetodoPagoId,
                TurnoId = dto.TurnoId,
                CierreTurnoId = turnoAbierto.CierreTurnoId,
                Detalles = dto.Detalles,
                Subtotal = totalVenta,
                Descuento = Math.Min(dto.Descuento, totalVenta), // nunca mayor al subtotal
                Total = totalVenta - Math.Min(dto.Descuento, totalVenta),
                PrecioCosto = costoTotal,
                NumeroVenta = numeroVenta,
                ProductoVentas = productosVenta,
                Fecha = DateTime.Now,
                Anulada = false
            };

            var creada = await _ventaRepository.CreateAsync(venta);

            return MapToResponseDTO(creada);
        }

        public async Task<bool> AnularVentaAsync(int ventaId, int empleadoId, string motivo)
        {
            var venta = await _ventaRepository.GetByIdAsync(ventaId);

            if (venta == null)
                throw new KeyNotFoundException($"Venta con ID {ventaId} no encontrada");

            if (venta.Anulada)
                throw new InvalidOperationException("La venta ya está anulada");

            var resultado = await _ventaRepository.AnularVentaAsync(ventaId);

            if (resultado)
            {
                await _auditoriaService.RegistrarAsync(
                    empleadoId: empleadoId,
                    kioscoId: venta.Empleado.KioscoID,
                    tipoEvento: TipoEventoAuditoria.VentaAnulada,
                    descripcion: $"Venta #{venta.NumeroVenta} anulada. Total: ${venta.Total}. Motivo: {motivo}",
                    datos: new { ventaId = venta.VentaId, total = venta.Total, motivo },
                    esSospechoso: true,
                    motivoSospecha: "Anulación de venta registrada"
                );
            }

            return resultado;
        }
        // ========== MAPEO ==========

        private VentaResponseDTO MapToResponseDTO(Venta venta)
        {
            var ganancia = venta.Total - venta.PrecioCosto;
            var margenGanancia = venta.Total > 0
                ? (ganancia / venta.Total) * 100
                : 0;

            return new VentaResponseDTO
            {
                VentaId = venta.VentaId,
                Subtotal = venta.Subtotal,
                Descuento = venta.Descuento,
                Fecha = venta.Fecha,
                Total = venta.Total,
                PrecioCosto = venta.PrecioCosto,
                Ganancia = ganancia,
                MargenGanancia = Math.Round(margenGanancia, 2),
                Detalles = venta.Detalles,
                Anulada = venta.Anulada,
                NumeroVenta = venta.NumeroVenta,

                EmpleadoId = venta.EmpleadoId,
                EmpleadoNombre = venta.Empleado?.Nombre ?? "",

                MetodoPagoId = venta.MetodoPagoId,
                MetodoPagoNombre = venta.MetodoPago?.Nombre ?? "",

                TurnoId = venta.TurnoId,
                TurnoNombre = venta.Turno?.Nombre ?? "",

                Productos = venta.ProductoVentas?.Select(pv => new ProductoVentaResponseDTO
                {
                    ProductoVentaId = pv.ProductoVentaId,
                    ProductoId = pv.ProductoId,
                    ProductoNombre = pv.Producto?.Nombre ?? "",
                    Cantidad = pv.Cantidad,
                    PrecioUnitario = pv.PrecioUnitario,
                    Subtotal = pv.Cantidad * pv.PrecioUnitario
                }).ToList() ?? new List<ProductoVentaResponseDTO>()
            };
        }
    }
}
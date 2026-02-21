using Application.DTOs.Venta;
using Application.Interfaces.Repository;
using Application.Interfaces.Services;
using Domain.Entities;

namespace Application.Services
{
    public class VentaService : IVentaService
    {
        private readonly IVentaRepository _ventaRepository;
        private readonly IProductoRepository _productoRepository;
        private readonly IEmpleadoRepository _empleadoRepository;
        private readonly IMetodoDePagoRepository _metodoDePagoRepository;
        private readonly ICierreTurnoRepository _cierreTurnoRepository;  // ← NUEVO

        public VentaService(
            IVentaRepository ventaRepository,
            IProductoRepository productoRepository,
            IEmpleadoRepository empleadoRepository,
            IMetodoDePagoRepository metodoDePagoRepository,
            ICierreTurnoRepository cierreTurnoRepository)  // ← NUEVO
        {
            _ventaRepository = ventaRepository;
            _productoRepository = productoRepository;
            _empleadoRepository = empleadoRepository;
            _metodoDePagoRepository = metodoDePagoRepository;
            _cierreTurnoRepository = cierreTurnoRepository;  // ← NUEVO
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

            // Validar empleado activo
            var empleado = await _empleadoRepository.GetByIdAsync(dto.EmpleadoId);
            if (empleado == null)
                throw new KeyNotFoundException($"Empleado con ID {dto.EmpleadoId} no encontrado");
            if (!empleado.Activo)
                throw new InvalidOperationException("El empleado está inactivo");

            // Validar método de pago
            var metodoPago = await _metodoDePagoRepository.GetByIdAsync(dto.MetodoPagoId);
            if (metodoPago == null)
                throw new KeyNotFoundException($"Método de pago con ID {dto.MetodoPagoId} no encontrado");

            // ─── OBTENER O CREAR TURNO ABIERTO ─────────

            var turnoAbierto = await _cierreTurnoRepository.GetTurnoAbiertoAsync(empleado.KioscoID);

            if (turnoAbierto == null)
            {
                throw new InvalidOperationException(
                    "No hay ningún turno abierto. Por favor, abra un turno antes de registrar ventas.");
            }

            // ─── VALIDAR Y PREPARAR PRODUCTOS ──────────

            var productosVenta = new List<ProductoVenta>();
            decimal totalVenta = 0;
            decimal costoTotal = 0;

            foreach (var productoDto in dto.Productos)
            {
                if (productoDto.Cantidad <= 0)
                    throw new InvalidOperationException("La cantidad debe ser mayor a 0");

                var producto = await _productoRepository.GetByIdAsync(productoDto.ProductoId);
                if (producto == null)
                    throw new KeyNotFoundException($"Producto con ID {productoDto.ProductoId} no encontrado");

                if (!producto.Activo)
                    throw new InvalidOperationException($"El producto '{producto.Nombre}' está inactivo");

                // Validar stock suficiente
                if (producto.StockActual < productoDto.Cantidad)
                    throw new InvalidOperationException(
                        $"Stock insuficiente para '{producto.Nombre}'. " +
                        $"Disponible: {producto.StockActual}, Solicitado: {productoDto.Cantidad}");

                // Calcular subtotal
                var subtotal = producto.PrecioVenta * productoDto.Cantidad;
                var subtotalCosto = producto.PrecioCosto * productoDto.Cantidad;

                totalVenta += subtotal;
                costoTotal += subtotalCosto;

                // Crear ProductoVenta
                productosVenta.Add(new ProductoVenta
                {
                    ProductoId = producto.ProductoId,
                    Cantidad = productoDto.Cantidad,
                    PrecioUnitario = producto.PrecioVenta
                });
            }

            // ─── CREAR VENTA ────────────────────────────

            var numeroVenta = await _ventaRepository.GetSiguienteNumeroVentaAsync(empleado.KioscoID);

            var venta = new Venta
            {
                EmpleadoId = dto.EmpleadoId,
                MetodoPagoId = dto.MetodoPagoId,
                TurnoId = dto.TurnoId,
                CierreTurnoId = turnoAbierto.CierreTurnoId,  // ← USAR TURNO ABIERTO
                Detalles = dto.Detalles,
                Total = totalVenta,
                PrecioCosto = costoTotal,
                NumeroVenta = numeroVenta,
                ProductoVentas = productosVenta,
                Fecha = DateTime.Now,
                Anulada = false
            };

            var creada = await _ventaRepository.CreateAsync(venta);
            return MapToResponseDTO(creada);
        }

        public async Task<bool> AnularVentaAsync(int ventaId)
        {
            var venta = await _ventaRepository.GetByIdAsync(ventaId);
            if (venta == null)
                throw new KeyNotFoundException($"Venta con ID {ventaId} no encontrada");

            if (venta.Anulada)
                throw new InvalidOperationException("La venta ya está anulada");

            return await _ventaRepository.AnularVentaAsync(ventaId);
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
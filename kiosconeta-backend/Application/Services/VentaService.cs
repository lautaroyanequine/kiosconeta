using Application.DTOs.Venta;
using Application.Interfaces.Repository;
using Application.Interfaces.Services;
using Domain.Entities;
using Domain.Enums;
using Domain.Enums.Domain.Enums;

public class VentaService : IVentaService
{
    private readonly IVentaRepository _ventaRepository;
    private readonly IProductoRepository _productoRepository;
    private readonly IEmpleadoRepository _empleadoRepository;
    private readonly IMetodoDePagoRepository _metodoDePagoRepository;
    private readonly ICierreTurnoRepository _cierreTurnoRepository;
    private readonly INumeradorRepository _numeradorRepository;
    private readonly IAuditoriaService _auditoriaService;
    private readonly IPromocionRepository _promocionRepository;

    public VentaService(
        IVentaRepository ventaRepository,
        IProductoRepository productoRepository,
        IEmpleadoRepository empleadoRepository,
        IMetodoDePagoRepository metodoDePagoRepository,
        ICierreTurnoRepository cierreTurnoRepository,
        INumeradorRepository numeradorRepository,
        IAuditoriaService auditoriaService,
        IPromocionRepository promocionRepository )
    {
        _ventaRepository = ventaRepository;
        _productoRepository = productoRepository;
        _empleadoRepository = empleadoRepository;
        _metodoDePagoRepository = metodoDePagoRepository;
        _cierreTurnoRepository = cierreTurnoRepository;
        _numeradorRepository = numeradorRepository;
        _auditoriaService = auditoriaService;
        _promocionRepository = promocionRepository;
    }

    // ================== HELPERS (CLAVE) ==================

    private DateTime ToUtc(DateTime date)
    {
        return date.Kind switch
        {
            DateTimeKind.Utc => date,
            DateTimeKind.Local => date.ToUniversalTime(),
            DateTimeKind.Unspecified => DateTime.SpecifyKind(date, DateTimeKind.Utc),
            _ => date
        };
    }

    private (DateTime desde, DateTime hasta) NormalizeRange(DateTime desde, DateTime hasta)
    {
        return (ToUtc(desde), ToUtc(hasta));
    }

    // ================== CONSULTAS ==================

    public async Task<VentaResponseDTO?> GetByIdAsync(int id)
    {
        var venta = await _ventaRepository.GetByIdAsync(id);
        return venta == null ? null : MapToResponseDTO(venta);
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
        var (desde, hasta) = NormalizeRange(fechaDesde, fechaHasta);

        var ventas = await _ventaRepository.GetByFechaAsync(desde, hasta);
        return ventas.Select(MapToResponseDTO);
    }

    public async Task<IEnumerable<VentaResponseDTO>> GetVentasDelDiaAsync(int kioscoId)
    {
        // Día completo en UTC
        var hoy = DateTime.UtcNow.Date;
        var mañana = hoy.AddDays(1);

        var ventas = await _ventaRepository.GetByFechaAsync(hoy, mañana);
        return ventas.Select(MapToResponseDTO);
    }

    public async Task<IEnumerable<VentaResponseDTO>> GetConFiltrosAsync(int kioscoId, VentaFiltrosDTO filtros)
    {
        if (filtros.FechaDesde.HasValue && filtros.FechaHasta.HasValue)
        {
            var (desde, hasta) = NormalizeRange(filtros.FechaDesde.Value, filtros.FechaHasta.Value);
            filtros.FechaDesde = desde;
            filtros.FechaHasta = hasta;
        }

        var ventas = await _ventaRepository.GetConFiltrosAsync(kioscoId, filtros);
        return ventas.Select(MapToResponseDTO);
    }

    // ================== CREATE ==================

    public async Task<VentaResponseDTO> CreateAsync(CreateVentaDTO dto)
    {
        if (dto.Productos == null || !dto.Productos.Any())
            throw new InvalidOperationException("La venta debe tener al menos un producto");

        var empleado = await _empleadoRepository.GetByIdAsync(dto.EmpleadoId)
            ?? throw new KeyNotFoundException($"Empleado con ID {dto.EmpleadoId} no encontrado");

        if (!empleado.Activo)
            throw new InvalidOperationException("El empleado está inactivo");

        var metodoPago = await _metodoDePagoRepository.GetByIdAsync(dto.MetodoPagoId)
            ?? throw new KeyNotFoundException($"Método de pago con ID {dto.MetodoPagoId} no encontrado");

        var turnoAbierto = await _cierreTurnoRepository.GetTurnoAbiertoAsync(empleado.KioscoID);
        if (turnoAbierto == null)
            throw new InvalidOperationException("No hay ningún turno abierto.");

        var productoIds = dto.Productos.Select(p => p.ProductoId).ToList();
        var productos = await _productoRepository.GetByIdsAsync(productoIds);
        var productosDict = productos.ToDictionary(p => p.ProductoId);

        var productosVenta = new List<ProductoVenta>();
        decimal totalVenta = 0;
        decimal costoTotal = 0;

        foreach (var productoDto in dto.Productos)
        {
            if (productoDto.Cantidad <= 0)
                throw new InvalidOperationException("Cantidad inválida");

            if (!productosDict.TryGetValue(productoDto.ProductoId, out var producto))
                throw new KeyNotFoundException($"Producto {productoDto.ProductoId} no encontrado");

            if (producto.StockActual < productoDto.Cantidad)
                throw new InvalidOperationException($"Stock insuficiente para {producto.Nombre}");

            var subtotal = producto.PrecioVenta * productoDto.Cantidad;
            var subtotalCosto = producto.PrecioCosto * productoDto.Cantidad;

            totalVenta += subtotal;
            costoTotal += subtotalCosto;

            productosVenta.Add(new ProductoVenta
            {
                ProductoId = producto.ProductoId,
                Cantidad = productoDto.Cantidad,
                PrecioUnitario = producto.PrecioVenta,
            });
        }

        // ── Procesar lista de combos (puede haber múltiples) ─────────────────
        decimal ajusteCombos = 0;

        if (dto.Combos != null && dto.Combos.Any())
        {
            foreach (var comboDto in dto.Combos)
            {
                var promo = await _promocionRepository.GetByIdAsync(comboDto.PromocionId);

                if (promo == null)
                    throw new KeyNotFoundException($"Promoción {comboDto.PromocionId} no encontrada");

                if (!promo.Activa)
                    throw new InvalidOperationException($"La promoción '{promo.Nombre}' no está activa");

                if (promo.Tipo != TipoPromocion.Combo || !promo.PrecioCombo.HasValue)
                    continue;

                // Suma de precios unitarios de los componentes de este combo
                var sumaUnitariosCombo = promo.PromocionProductos.Sum(pp =>
                {
                    if (productosDict.TryGetValue(pp.ProductoId, out var prod))
                        return prod.PrecioVenta * pp.Cantidad * comboDto.Cantidad;
                    return 0;
                });

                // Precio real del combo × cantidad
                var precioComboTotal = promo.PrecioCombo.Value * comboDto.Cantidad;

                // Ajuste: positivo = descuento, negativo = el combo vale más que los unitarios
                ajusteCombos += sumaUnitariosCombo - precioComboTotal;
            }
        }

        // Aplicar ajuste al total
        // Si ajuste > 0: combo más barato que unitarios → descuento
        // Si ajuste < 0: combo más caro que unitarios → sube el total
        var totalFinal = totalVenta - ajusteCombos;
        var descuentoFinal = ajusteCombos > 0
            ? Math.Min(ajusteCombos, totalVenta)  // descuento real
            : 0;                                   // sin descuento (combo más caro)

        // Si el combo es más caro, el total ya queda bien en totalFinal
        // Si tiene descuento adicional del carrito, lo sumamos
        if (dto.Descuento > 0 && ajusteCombos <= 0)
            descuentoFinal = Math.Min(dto.Descuento, totalVenta);

        var numeroVenta = await _numeradorRepository.GenerarNumeroVentaAsync(empleado.KioscoID);

        var venta = new Venta
        {
            EmpleadoId = dto.EmpleadoId,
            MetodoPagoId = dto.MetodoPagoId,
            TurnoId = dto.TurnoId,
            CierreTurnoId = turnoAbierto.CierreTurnoId,
            Detalles = dto.Detalles,
            Subtotal = totalVenta,
            Descuento = descuentoFinal,
            Total = totalFinal > 0 ? totalFinal : totalVenta - descuentoFinal,
            PrecioCosto = costoTotal,
            NumeroVenta = numeroVenta,
            ProductoVentas = productosVenta,
            Fecha = DateTime.UtcNow,
            Anulada = false,
        };

        var creada = await _ventaRepository.CreateAsync(venta);
        return MapToResponseDTO(creada);
    }    // ================== ANULAR ==================

    public async Task<bool> AnularVentaAsync(int ventaId, int empleadoId, string motivo)
    {
        var venta = await _ventaRepository.GetByIdAsync(ventaId);

        if (venta == null)
            throw new KeyNotFoundException("Venta no encontrada");

        if (venta.Anulada)
            throw new InvalidOperationException("Ya está anulada");

        var resultado = await _ventaRepository.AnularVentaAsync(ventaId);

        if (resultado)
        {
            await _auditoriaService.RegistrarAsync(
                empleadoId,
                venta.Empleado.KioscoID,
                TipoEventoAuditoria.VentaAnulada,
                $"Venta #{venta.NumeroVenta} anulada. Motivo: {motivo}",
                new { ventaId, motivo },
                true,
                "Anulación de venta"
            );
        }

        return resultado;
    }

    // ================== MAP ==================

    private VentaResponseDTO MapToResponseDTO(Venta venta)
    {
        var ganancia = venta.Total - venta.PrecioCosto;

        return new VentaResponseDTO
        {
            VentaId = venta.VentaId,
            Subtotal = venta.Subtotal > 0 ? venta.Subtotal : venta.Total,
            Descuento = venta.Descuento,
            Fecha = venta.Fecha, // ya viene en UTC
            Total = venta.Total,
            PrecioCosto = venta.PrecioCosto,
            Ganancia = ganancia,
            MargenGanancia = venta.Total > 0 ? Math.Round((ganancia / venta.Total) * 100, 2) : 0,
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
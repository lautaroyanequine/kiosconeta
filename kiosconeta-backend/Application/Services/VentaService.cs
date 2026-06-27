using Application.DTOs.Common;
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

    // REEMPLAZAR GetConFiltrosPaginadosAsync
    public async Task<ResultadoPaginadoDTO<VentaResponseDTO>> GetConFiltrosPaginadosAsync(
    int kioscoId, VentaFiltrosDTO filtros)
    {
        if (filtros.FechaDesde.HasValue && filtros.FechaHasta.HasValue)
        {
            var (desde, hasta) = NormalizeRange(filtros.FechaDesde.Value, filtros.FechaHasta.Value);
            filtros.FechaDesde = desde;
            filtros.FechaHasta = hasta;
        }

        var (ventas, total) = await _ventaRepository.GetConFiltrosAsync(kioscoId, filtros);

        return new ResultadoPaginadoDTO<VentaResponseDTO>
        {
            Items = ventas.Select(MapToResponseDTO),
            TotalItems = total,
            Pagina = filtros.Pagina,
            TamanoPagina = filtros.TamanoPagina,
            TotalPaginas = (int)Math.Ceiling(total / (double)filtros.TamanoPagina)
        };
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

        decimal subtotalVenta = 0;
        decimal costoTotal = 0;

        foreach (var productoDto in dto.Productos)
        {
            if (productoDto.Cantidad <= 0)
                throw new InvalidOperationException("Cantidad inválida");

            if (!productosDict.TryGetValue(productoDto.ProductoId, out var producto))
                throw new KeyNotFoundException($"Producto {productoDto.ProductoId} no encontrado");

            if (producto.StockActual < productoDto.Cantidad)
                throw new InvalidOperationException($"Stock insuficiente para {producto.Nombre}");

            subtotalVenta += producto.PrecioVenta * productoDto.Cantidad;
            costoTotal += producto.PrecioCosto * productoDto.Cantidad;

            productosVenta.Add(new ProductoVenta
            {
                ProductoId = producto.ProductoId,
                Cantidad = productoDto.Cantidad,
                PrecioUnitario = producto.PrecioVenta
            });
        }

        decimal descuentoCombos = 0;
        decimal recargoCombos = 0;

        if (dto.Combos != null && dto.Combos.Any())
        {
            foreach (var comboDto in dto.Combos)
            {
                var promo = await _promocionRepository.GetByIdAsync(comboDto.PromocionId);

                if (promo == null)
                    throw new KeyNotFoundException(
                        $"Promoción {comboDto.PromocionId} no encontrada");

                if (!promo.Activa)
                    throw new InvalidOperationException(
                        $"La promoción '{promo.Nombre}' no está activa");

                if (promo.Tipo != TipoPromocion.Combo || !promo.PrecioCombo.HasValue)
                    continue;

                decimal sumaUnitariosCombo = promo.PromocionProductos.Sum(pp =>
                {
                    if (productosDict.TryGetValue(pp.ProductoId, out var prod))
                    {
                        return prod.PrecioVenta
                               * pp.Cantidad
                               * comboDto.Cantidad;
                    }

                    return 0m;
                });

                decimal precioComboTotal =
                    promo.PrecioCombo.Value * comboDto.Cantidad;

                decimal diferencia =
                    sumaUnitariosCombo - precioComboTotal;

                if (diferencia > 0)
                {
                    // Combo más barato → descuento
                    descuentoCombos += diferencia;
                }
                else if (diferencia < 0)
                {
                    // Combo más caro → recargo
                    recargoCombos += Math.Abs(diferencia);
                }
            }
        }

        // Descuento total:
        // - Descuento por combos
        // - Descuento calculado en carrito/promociones automáticas
        decimal descuentoFinal = descuentoCombos + dto.Descuento;

        if (descuentoFinal > subtotalVenta)
            descuentoFinal = subtotalVenta;

        decimal totalFinal =
            subtotalVenta
            - descuentoFinal
            + recargoCombos;

        if (totalFinal < 0)
            totalFinal = 0;

        var numeroVenta =
            await _numeradorRepository.GenerarNumeroVentaAsync(empleado.KioscoID);

        var venta = new Venta
        {
            EmpleadoId = dto.EmpleadoId,
            MetodoPagoId = dto.MetodoPagoId,
            TurnoId = dto.TurnoId,
            CierreTurnoId = turnoAbierto.CierreTurnoId,
            Detalles = dto.Detalles,

            Subtotal = subtotalVenta,
            Descuento = descuentoFinal,
            Total = totalFinal,

            PrecioCosto = costoTotal,
            NumeroVenta = numeroVenta,
            ProductoVentas = productosVenta,
            Fecha = DateTime.UtcNow,
            Anulada = false
        };

        var creada = await _ventaRepository.CreateAsync(venta);

        foreach (var productoDto in dto.Productos)
        {
            if (!productosDict.TryGetValue(productoDto.ProductoId, out var producto)) continue;

            // Stock ANTES de la venta ya lo tenemos en producto.StockActual
            // (se leyó al principio antes de llamar a CreateAsync)
            var stockResultante = producto.StockActual - productoDto.Cantidad;

            if (stockResultante <= 0)
            {
                await _auditoriaService.RegistrarAsync(
                    empleadoId: dto.EmpleadoId,
                    kioscoId: empleado.KioscoID,
                    tipoEvento: TipoEventoAuditoria.QuiebreDeStock,
                    descripcion: $"'{producto.Nombre}' llegó a stock 0 durante la venta #{creada.NumeroVenta}.",
                    datos: new
                    {
                        productoId = producto.ProductoId,   // ← sin espacios, camelCase exacto
                        productoNombre = producto.Nombre,
                        ventaId = creada.VentaId
                    },
                    esSospechoso: false,
                    motivoSospecha: null
                );
            }
        }

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
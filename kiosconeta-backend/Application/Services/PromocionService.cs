using Application.DTOs.Promocion;
using Application.Interfaces.Repository;
using Application.Interfaces.Services;
using Domain.Entities;
using Domain.Enums.Domain.Enums;

public class PromocionService : IPromocionService
{
    private readonly IPromocionRepository _repo;
    private readonly IProductoRepository _productoRepo;

    public PromocionService(IPromocionRepository repo, IProductoRepository productoRepo)
    {
        _repo = repo;
        _productoRepo = productoRepo;
    }

    public async Task<IEnumerable<PromocionResponseDTO>> GetByKioscoAsync(int kioscoId)
    {
        var promos = await _repo.GetByKioscoAsync(kioscoId);
        return promos.Select(MapToDTO);
    }

    public async Task<PromocionResponseDTO> CreateAsync(int kioscoId, CreatePromocionDTO dto)
    {
        var promo = new Promocion
        {
            Nombre = dto.Nombre.Trim(),
            Descripcion = dto.Descripcion,
            Tipo = dto.Tipo,
            Activa = true,
            FechaDesde = dto.FechaDesde,
            FechaHasta = dto.FechaHasta,
            KioscoId = kioscoId,
            PrecioCombo = dto.PrecioCombo,
            CantidadRequerida = dto.CantidadRequerida,
            CantidadPaga = dto.CantidadPaga,
            ProductoIdCantidad = dto.ProductoIdCantidad,
            PorcentajeDescuento = dto.PorcentajeDescuento,
            ProductoIdPorcentaje = dto.ProductoIdPorcentaje,
            CategoriaIdPorcentaje = dto.CategoriaIdPorcentaje,
            CantidadMinimaDescuento = dto.CantidadMinimaDescuento,   // ← NUEVO
            PromocionProductos = dto.Productos.Select(p => new PromocionProducto
            {
                ProductoId = p.ProductoId,
                Cantidad = p.Cantidad
            }).ToList()
        };
        var creada = await _repo.CreateAsync(promo);
        return MapToDTO(creada);
    }

    public async Task<bool> ToggleActivaAsync(int id)
    {
        var promo = await _repo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Promoción no encontrada");
        promo.Activa = !promo.Activa;
        await _repo.UpdateAsync(promo);
        return promo.Activa;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var promo = await _repo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Promoción no encontrada");
        return await _repo.DeleteAsync(id);
    }

    // ── Detectar promos en un carrito ─────────────────────────────────────

    public async Task<ResultadoPromocionesDTO> DetectarAsync(DetectarPromocionesDTO dto)
    {
        var promos = await _repo.GetActivasByKioscoAsync(dto.KioscoId);
        var carrito = dto.Productos;

        var totalOriginal = carrito.Sum(i => i.PrecioUnitario * i.Cantidad);
        var aplicadas = new List<PromocionAplicadaDTO>();

        foreach (var promo in promos)
        {
            PromocionAplicadaDTO? resultado = promo.Tipo switch
            {
                TipoPromocion.Combo => DetectarCombo(promo, carrito),
                TipoPromocion.Cantidad => DetectarCantidad(promo, carrito),
                _ => null
            };
            // Porcentaje es async porque puede necesitar consultar la BD por categoría
            if (promo.Tipo == TipoPromocion.Porcentaje)
                resultado = await DetectarPorcentajeAsync(promo, carrito);
            if (resultado != null) aplicadas.Add(resultado);
        }

        var totalDescuento = aplicadas.Sum(a => a.Descuento);

        return new ResultadoPromocionesDTO
        {
            PromocionesAplicadas = aplicadas,
            TotalOriginal = totalOriginal,
            TotalDescuento = totalDescuento,
            TotalConDescuento = totalOriginal - totalDescuento
        };
    }

    // ── Detectar COMBO ────────────────────────────────────────────────────

    private PromocionAplicadaDTO? DetectarCombo(Promocion promo, List<ItemCarritoDTO> carrito)
    {
        if (!promo.PromocionProductos.Any() || promo.PrecioCombo == null)
            return null;

        foreach (var pp in promo.PromocionProductos)
        {
            var item = carrito.FirstOrDefault(c => c.ProductoId == pp.ProductoId);
            if (item == null || item.Cantidad < pp.Cantidad)
                return null;
        }

        decimal precioOriginal = promo.PromocionProductos
            .Sum(pp => {
                var item = carrito.First(c => c.ProductoId == pp.ProductoId);
                return item.PrecioUnitario * pp.Cantidad;
            });

        var descuento = precioOriginal - promo.PrecioCombo.Value;
        if (descuento <= 0) return null;

        return new PromocionAplicadaDTO
        {
            PromocionId = promo.PromocionId,
            Nombre = promo.Nombre,
            Tipo = TipoPromocion.Combo,
            Descuento = descuento,
            Descripcion = $"Combo: {promo.Nombre} → ${promo.PrecioCombo:F2}"
        };
    }

    // ── Detectar CANTIDAD (2x1, 3x2) ─────────────────────────────────────

    private PromocionAplicadaDTO? DetectarCantidad(Promocion promo, List<ItemCarritoDTO> carrito)
    {
        if (promo.ProductoIdCantidad == null || promo.CantidadRequerida == null || promo.CantidadPaga == null)
            return null;

        var item = carrito.FirstOrDefault(c => c.ProductoId == promo.ProductoIdCantidad);
        if (item == null || item.Cantidad < promo.CantidadRequerida)
            return null;

        var veces = item.Cantidad / promo.CantidadRequerida.Value;
        var gratis = promo.CantidadRequerida.Value - promo.CantidadPaga.Value;
        var descuento = veces * gratis * item.PrecioUnitario;

        return new PromocionAplicadaDTO
        {
            PromocionId = promo.PromocionId,
            Nombre = promo.Nombre,
            Tipo = TipoPromocion.Cantidad,
            Descuento = descuento,
            Descripcion = $"{promo.CantidadRequerida}x{promo.CantidadPaga}: {promo.Nombre}"
        };
    }

    // ── Detectar PORCENTAJE (con soporte de cantidad mínima) ──────────────
    //
    // Si CantidadMinimaDescuento != null → precio por volumen:
    //   solo aplica cuando el cliente lleva >= N unidades del producto.
    //
    // Para descuento por categoría: resolvemos qué productos del carrito
    // pertenecen a esa categoría usando GetByCategoriaAsync del repo,
    // que ya tenemos inyectado. Así evitamos agregar CategoriaId al DTO
    // del carrito (que solo necesita productoId, cantidad y precioUnitario).

    private async Task<PromocionAplicadaDTO?> DetectarPorcentajeAsync(Promocion promo, List<ItemCarritoDTO> carrito)
    {
        if (promo.PorcentajeDescuento == null) return null;

        decimal baseDescuento = 0;

        if (promo.ProductoIdPorcentaje != null)
        {
            var item = carrito.FirstOrDefault(c => c.ProductoId == promo.ProductoIdPorcentaje);
            if (item == null) return null;

            // Precio por volumen: verificar cantidad mínima
            if (promo.CantidadMinimaDescuento.HasValue && item.Cantidad < promo.CantidadMinimaDescuento.Value)
                return null;

            baseDescuento = item.PrecioUnitario * item.Cantidad;
        }
        else if (promo.CategoriaIdPorcentaje != null)
        {
            // Traer los IDs de productos que pertenecen a esa categoría
            var productosCategoria = await _productoRepo.GetByCategoriaAsync(promo.CategoriaIdPorcentaje.Value);
            var idsCategoria = productosCategoria.Select(p => p.ProductoId).ToHashSet();

            baseDescuento = carrito
                .Where(c => idsCategoria.Contains(c.ProductoId))
                .Sum(c => c.PrecioUnitario * c.Cantidad);

            if (baseDescuento == 0) return null;
        }

        if (baseDescuento == 0) return null;

        var descuento = baseDescuento * (promo.PorcentajeDescuento.Value / 100);

        var descripcion = promo.CantidadMinimaDescuento.HasValue
            ? $"{promo.CantidadMinimaDescuento}+ unidades → {promo.PorcentajeDescuento}% off: {promo.Nombre}"
            : $"{promo.PorcentajeDescuento}% off: {promo.Nombre}";

        return new PromocionAplicadaDTO
        {
            PromocionId = promo.PromocionId,
            Nombre = promo.Nombre,
            Tipo = TipoPromocion.Porcentaje,
            Descuento = descuento,
            Descripcion = descripcion
        };
    }

    // ── MAPEO ─────────────────────────────────────────────────────────────

    private PromocionResponseDTO MapToDTO(Promocion p) => new()
    {
        PromocionId = p.PromocionId,
        Nombre = p.Nombre,
        Descripcion = p.Descripcion,
        Tipo = p.Tipo,
        Activa = p.Activa,
        FechaDesde = p.FechaDesde,
        FechaHasta = p.FechaHasta,
        PrecioCombo = p.PrecioCombo,
        CantidadRequerida = p.CantidadRequerida,
        CantidadPaga = p.CantidadPaga,
        ProductoIdCantidad = p.ProductoIdCantidad,
        ProductoNombreCantidad = p.ProductoCantidad?.Nombre,
        PorcentajeDescuento = p.PorcentajeDescuento,
        ProductoIdPorcentaje = p.ProductoIdPorcentaje,
        ProductoNombrePorcentaje = p.ProductoPorcentaje?.Nombre,
        CategoriaIdPorcentaje = p.CategoriaIdPorcentaje,
        CategoriaNombrePorcentaje = p.CategoriaPorcentaje?.Nombre,
        CantidadMinimaDescuento = p.CantidadMinimaDescuento,   // ← NUEVO
        Productos = p.PromocionProductos.Select(pp => new PromocionProductoDTO
        {
            ProductoId = pp.ProductoId,
            ProductoNombre = pp.Producto?.Nombre ?? "",
            Cantidad = pp.Cantidad,
            PrecioUnitario = pp.Producto?.PrecioVenta ?? 0
        }).ToList()
    };
}
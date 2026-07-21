using Application.DTOs.Promocion;
using Application.Interfaces.Repository;
using Application.Interfaces.Services;
using Domain.Entities;
using Domain.Enums.Domain.Enums;

public class PromocionService : IPromocionService
{
    private readonly IPromocionRepository _repo;
    private readonly IProductoRepository _productoRepo;
    private Dictionary<int, HashSet<int>> _tagProductosCache = new();

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
            TagIdPorcentaje = dto.TagIdPorcentaje,
            PrecioCombo = dto.PrecioCombo,
            CantidadRequerida = dto.CantidadRequerida,
            CantidadPaga = dto.CantidadPaga,
            ProductoIdCantidad = dto.ProductoIdCantidad,
            PorcentajeDescuento = dto.PorcentajeDescuento,
            PrecioFijoDescuento = dto.PrecioFijoDescuento,
            ProductoIdPorcentaje = dto.ProductoIdPorcentaje,
            CategoriaIdPorcentaje = dto.CategoriaIdPorcentaje,
            CantidadMinimaDescuento = dto.CantidadMinimaDescuento,   // ← NUEVO
            PromocionProductos = dto.Productos.Select(p =>
            {
                if (p.ProductoId == null && p.TagId == null)
                    throw new InvalidOperationException("Cada ítem del combo necesita producto o tag");

                return new PromocionProducto
                {
                    ProductoId = p.ProductoId,
                    TagId = p.TagId,
                    Cantidad = p.Cantidad
                };
            }).ToList()
        };
        var creada = await _repo.CreateAsync(promo);
        return MapToDTO(creada);
    }

    public async Task<PromocionResponseDTO> UpdateAsync(int id, CreatePromocionDTO dto)
    {
        var promoExistente = await _repo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Promoción no encontrada");

        promoExistente.Nombre = dto.Nombre.Trim();
        promoExistente.Descripcion = dto.Descripcion;
        promoExistente.Tipo = dto.Tipo;
        promoExistente.TagIdPorcentaje = dto.TagIdPorcentaje;
        promoExistente.FechaDesde = dto.FechaDesde;
        promoExistente.FechaHasta = dto.FechaHasta;
        promoExistente.PrecioCombo = dto.PrecioCombo;
        promoExistente.CantidadRequerida = dto.CantidadRequerida;
        promoExistente.CantidadPaga = dto.CantidadPaga;
        promoExistente.ProductoIdCantidad = dto.ProductoIdCantidad;
        promoExistente.PorcentajeDescuento = dto.PorcentajeDescuento;
        promoExistente.PrecioFijoDescuento = dto.PrecioFijoDescuento;
        promoExistente.ProductoIdPorcentaje = dto.ProductoIdPorcentaje;
        promoExistente.CategoriaIdPorcentaje = dto.CategoriaIdPorcentaje;
        promoExistente.CantidadMinimaDescuento = dto.CantidadMinimaDescuento;

        // Reemplazamos la lista de productos del combo (el repo se encarga de
        // borrar los PromocionProductos anteriores e insertar estos nuevos)
        promoExistente.PromocionProductos = dto.Productos.Select(p =>
        {
            if (p.ProductoId == null && p.TagId == null)
                throw new InvalidOperationException("Cada ítem del combo necesita producto o tag");

            return new PromocionProducto
            {
                ProductoId = p.ProductoId,
                TagId = p.TagId,
                Cantidad = p.Cantidad
            };
        }).ToList();

        var actualizada = await _repo.UpdateAsync(promoExistente, reemplazarProductos: true);
        return MapToDTO(actualizada);
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



        var tagIds = promos
        .SelectMany(p => p.PromocionProductos.Where(pp => pp.TagId != null).Select(pp => pp.TagId!.Value)
            .Concat(p.TagIdCantidad != null ? new[] { p.TagIdCantidad.Value } : Array.Empty<int>()))
        .Distinct()
        .ToList();

        var tagProductosCache = new Dictionary<int, HashSet<int>>();
        foreach (var tagId in tagIds)
        {
            var productosDelTag = await _productoRepo.GetByTagAsync(tagId);
            tagProductosCache[tagId] = productosDelTag.Select(p => p.ProductoId).ToHashSet();
        }
        _tagProductosCache = tagProductosCache;



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

        decimal precioOriginal = 0;

        foreach (var pp in promo.PromocionProductos)
        {
            if (pp.ProductoId != null)
            {
                var item = carrito.FirstOrDefault(c => c.ProductoId == pp.ProductoId);
                if (item == null || item.Cantidad < pp.Cantidad) return null;
                precioOriginal += item.PrecioUnitario * pp.Cantidad;
            }
            else if (pp.TagId != null)
            {
                // Nota: esto requiere resolver productos por tag de forma síncrona;
                // ver comentario abajo sobre precargar el mapa de tags antes del foreach.
                var idsTag = _tagProductosCache.TryGetValue(pp.TagId.Value, out var ids) ? ids : new HashSet<int>();
                var unidades = carrito
                    .Where(c => idsTag.Contains(c.ProductoId))
                    .SelectMany(c => Enumerable.Repeat(c.PrecioUnitario, c.Cantidad))
                    .OrderBy(precio => precio)
                    .ToList();

                if (unidades.Count < pp.Cantidad) return null;
                precioOriginal += unidades.Take(pp.Cantidad).Sum();
            }
            else return null;
        }

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
        if (promo.CantidadRequerida == null || promo.CantidadPaga == null)
            return null;
        if (promo.ProductoIdCantidad == null && promo.TagIdCantidad == null)
            return null;

        List<decimal> unidades;

        if (promo.ProductoIdCantidad != null)
        {
            var item = carrito.FirstOrDefault(c => c.ProductoId == promo.ProductoIdCantidad);
            if (item == null) return null;
            unidades = Enumerable.Repeat(item.PrecioUnitario, item.Cantidad).ToList();
        }
        else
        {
            var idsTag = _tagProductosCache.TryGetValue(promo.TagIdCantidad!.Value, out var ids) ? ids : new HashSet<int>();
            unidades = carrito
                .Where(c => idsTag.Contains(c.ProductoId))
                .SelectMany(c => Enumerable.Repeat(c.PrecioUnitario, c.Cantidad))
                .ToList();
        }

        if (unidades.Count < promo.CantidadRequerida) return null;

        unidades = unidades.OrderBy(p => p).ToList(); // más baratas primero
        var veces = unidades.Count / promo.CantidadRequerida.Value;
        var gratis = promo.CantidadRequerida.Value - promo.CantidadPaga.Value;
        var unidadesGratis = veces * gratis;
        var descuento = unidades.Take(unidadesGratis).Sum();

        if (descuento <= 0) return null;

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
        if (promo.PorcentajeDescuento == null && promo.PrecioFijoDescuento == null) return null;

        List<ItemCarritoDTO> itemsAplicables;

        if (promo.ProductoIdPorcentaje != null)
        {
            var item = carrito.FirstOrDefault(c => c.ProductoId == promo.ProductoIdPorcentaje);
            itemsAplicables = item != null ? new List<ItemCarritoDTO> { item } : new List<ItemCarritoDTO>();
        }
        else if (promo.CategoriaIdPorcentaje != null)
        {
            var productosCategoria = await _productoRepo.GetByCategoriaAsync(promo.CategoriaIdPorcentaje.Value);
            var idsCategoria = productosCategoria.Select(p => p.ProductoId).ToHashSet();
            itemsAplicables = carrito.Where(c => idsCategoria.Contains(c.ProductoId)).ToList();
        }
        else if (promo.TagIdPorcentaje != null)
        {
            var productosTag = await _productoRepo.GetByTagAsync(promo.TagIdPorcentaje.Value);
            var idsTag = productosTag.Select(p => p.ProductoId).ToHashSet();
            itemsAplicables = carrito.Where(c => idsTag.Contains(c.ProductoId)).ToList();
        }
        else
        {
            return null;
        }

        if (!itemsAplicables.Any()) return null;

        // Suma total de unidades y $ de TODOS los productos que matchean (ej: todos los alfajores Mondelez juntos)
        int cantidadAplicable = itemsAplicables.Sum(i => i.Cantidad);
        decimal baseDescuento = itemsAplicables.Sum(i => i.PrecioUnitario * i.Cantidad);

        if (promo.CantidadMinimaDescuento.HasValue && cantidadAplicable < promo.CantidadMinimaDescuento.Value)
            return null;

        if (baseDescuento == 0) return null;

        decimal descuento;
        string descripcion;

        if (promo.PrecioFijoDescuento.HasValue && promo.CantidadMinimaDescuento.HasValue)
        {
            // Agrupar de a N: cada grupo completo sale el precio fijo,
            // las unidades sueltas que sobran se cobran a precio normal (promedio del carrito aplicable)
            var grupos = cantidadAplicable / promo.CantidadMinimaDescuento.Value;
            var resto = cantidadAplicable % promo.CantidadMinimaDescuento.Value;
            var precioPromedioUnitario = baseDescuento / cantidadAplicable;

            var precioConPromo = (grupos * promo.PrecioFijoDescuento.Value) + (resto * precioPromedioUnitario);
            descuento = baseDescuento - precioConPromo;
            descripcion = $"{promo.CantidadMinimaDescuento} x ${promo.PrecioFijoDescuento}: {promo.Nombre}";
        }
        else if (promo.PorcentajeDescuento.HasValue)
        {
            descuento = baseDescuento * (promo.PorcentajeDescuento.Value / 100);
            descripcion = promo.CantidadMinimaDescuento.HasValue
                ? $"{promo.CantidadMinimaDescuento}+ unidades → {promo.PorcentajeDescuento}% off: {promo.Nombre}"
                : $"{promo.PorcentajeDescuento}% off: {promo.Nombre}";
        }
        else return null;

        if (descuento <= 0) return null;

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
        PrecioFijoDescuento = p.PrecioFijoDescuento,
        ProductoIdPorcentaje = p.ProductoIdPorcentaje,
        ProductoNombrePorcentaje = p.ProductoPorcentaje?.Nombre,
        CategoriaIdPorcentaje = p.CategoriaIdPorcentaje,
        CategoriaNombrePorcentaje = p.CategoriaPorcentaje?.Nombre,
        CantidadMinimaDescuento = p.CantidadMinimaDescuento,   // ← NUEVO
        TagIdPorcentaje = p.TagIdPorcentaje,
        TagNombrePorcentaje = p.TagPorcentaje?.Nombre,
        TagIdCantidad = p.TagIdCantidad,
        TagNombreCantidad = p.TagCantidad?.Nombre,
        Productos = p.PromocionProductos.Select(pp => new PromocionProductoDTO
        {
            ProductoId = pp.ProductoId,
            ProductoNombre = pp.Producto?.Nombre ?? "",
            TagId = pp.TagId,
            TagNombre = pp.Tag?.Nombre,
            Cantidad = pp.Cantidad,
            PrecioUnitario = pp.Producto?.PrecioVenta ?? 0
        }).ToList()
    };
}
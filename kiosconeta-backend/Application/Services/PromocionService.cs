using Application.DTOs.Promocion;
using Application.Interfaces.Repository;
using Application.Interfaces.Services;
using Domain.Entities;
using Domain.Enums;
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

    // Mismo criterio que VentaService/DashboardService: para productos por kilo,
    // Cantidad está en GRAMOS y PrecioUnitario es "por kilo".
    private static bool EsKilogramo(UnidadMedida unidadMedida) => unidadMedida == UnidadMedida.Kilogramo;

    private static decimal CalcularImporte(UnidadMedida unidadMedida, int cantidad, decimal precioUnitario)
    {
        return EsKilogramo(unidadMedida)
            ? Math.Round((cantidad / 1000m) * precioUnitario, 2, MidpointRounding.AwayFromZero)
            : cantidad * precioUnitario;
    }

    public async Task<IEnumerable<PromocionResponseDTO>> GetByKioscoAsync(int kioscoId)
    {
        var promos = await _repo.GetByKioscoAsync(kioscoId);
        var resultado = new List<PromocionResponseDTO>();
        foreach (var p in promos)
            resultado.Add(await MapToDTOAsync(p));
        return resultado;
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
        return await MapToDTOAsync(creada);
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
        return await MapToDTOAsync(actualizada);
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



        var totalOriginal = carrito.Sum(i => CalcularImporte(i.UnidadMedida, i.Cantidad, i.PrecioUnitario));
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
                precioOriginal += CalcularImporte(item.UnidadMedida, pp.Cantidad, item.PrecioUnitario);
            }
            else if (pp.TagId != null)
            {
                // Nota: esto requiere resolver productos por tag de forma síncrona;
                // ver comentario abajo sobre precargar el mapa de tags antes del foreach.
                // Los productos por kilo quedan afuera de este pool: "cantidad" para
                // ellos son gramos, y Enumerable.Repeat con miles de gramos generaría
                // listas gigantes además de no tener sentido como "N unidades".
                var idsTag = _tagProductosCache.TryGetValue(pp.TagId.Value, out var ids) ? ids : new HashSet<int>();
                var unidades = carrito
                    .Where(c => idsTag.Contains(c.ProductoId) && !EsKilogramo(c.UnidadMedida))
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
            // Las promos NxM (2x1, 3x2) no aplican a productos por kilo: su "cantidad"
            // es en gramos, no unidades discretas, y no hay traducción sensata a
            // "llevate 3, pagá 2" — además de que repetir por gramo puede generar
            // listas de miles de elementos.
            if (item == null || EsKilogramo(item.UnidadMedida)) return null;
            unidades = Enumerable.Repeat(item.PrecioUnitario, item.Cantidad).ToList();
        }
        else
        {
            var idsTag = _tagProductosCache.TryGetValue(promo.TagIdCantidad!.Value, out var ids) ? ids : new HashSet<int>();
            unidades = carrito
                .Where(c => idsTag.Contains(c.ProductoId) && !EsKilogramo(c.UnidadMedida))
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
        decimal baseDescuento = itemsAplicables.Sum(i => CalcularImporte(i.UnidadMedida, i.Cantidad, i.PrecioUnitario));

        if (promo.CantidadMinimaDescuento.HasValue && cantidadAplicable < promo.CantidadMinimaDescuento.Value)
            return null;

        if (baseDescuento == 0) return null;

        decimal descuento;
        string descripcion;

        if (promo.PrecioFijoDescuento.HasValue && promo.CantidadMinimaDescuento.HasValue)
        {
            // Esta modalidad agrupa de a N UNIDADES DISCRETAS a precio fijo por grupo.
            // No tiene traducción sensata para productos por kilo (gramos) — si algún
            // ítem aplicable es por kilo, no aplicamos esta variante de la promo.
            if (itemsAplicables.Any(i => EsKilogramo(i.UnidadMedida))) return null;

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

    private async Task<PromocionResponseDTO> MapToDTOAsync(Promocion p)
    {
        var (ganancia, margen, esEstimado) = await CalcularMargenAsync(p);

        // ── Costos por producto para mostrar en la card ──────────────────────
        decimal? costoTotal = null;
        decimal? costoUnitarioProducto = null;
        var lineas = new List<PromocionProductoDTO>();

        foreach (var pp in p.PromocionProductos)
        {
            var prod = pp.Producto;
            bool estimadoLinea = false;
            if (prod == null && pp.TagId.HasValue)
            {
                var candidatos = await _productoRepo.GetByTagAsync(pp.TagId.Value);
                prod = candidatos.OrderBy(c => c.PrecioCosto).FirstOrDefault();
                estimadoLinea = true;
            }
            lineas.Add(new PromocionProductoDTO
            {
                ProductoId = pp.ProductoId,
                ProductoNombre = pp.Producto?.Nombre ?? "",
                TagId = pp.TagId,
                TagNombre = pp.Tag?.Nombre,
                Cantidad = pp.Cantidad,
                PrecioUnitario = pp.Producto?.PrecioVenta ?? 0,
                CostoUnitario = prod?.PrecioCosto,
                CostoLinea = prod == null ? null : CalcularImporte(prod.UnidadMedida, pp.Cantidad, prod.PrecioCosto),
                CostoEsEstimado = estimadoLinea
            });
        }

        if (p.Tipo == TipoPromocion.Combo)
        {
            // Si alguna línea no se pudo resolver, no mostramos un total engañoso.
            costoTotal = lineas.Count > 0 && lineas.All(l => l.CostoLinea.HasValue)
                ? lineas.Sum(l => l.CostoLinea!.Value)
                : null;
        }
        else if (p.Tipo == TipoPromocion.Cantidad)
        {
            var prodCant = p.ProductoCantidad;
            if (prodCant == null && p.TagIdCantidad.HasValue)
            {
                var candidatos = await _productoRepo.GetByTagAsync(p.TagIdCantidad.Value);
                prodCant = candidatos.OrderBy(c => c.PrecioCosto).FirstOrDefault();
            }
            if (prodCant != null && p.CantidadRequerida.HasValue)
            {
                costoUnitarioProducto = prodCant.PrecioCosto;
                costoTotal = CalcularImporte(prodCant.UnidadMedida, p.CantidadRequerida.Value, prodCant.PrecioCosto);
            }
        }
        else if (p.Tipo == TipoPromocion.Porcentaje && p.ProductoPorcentaje != null)
        {
            costoUnitarioProducto = p.ProductoPorcentaje.PrecioCosto;
            costoTotal = p.ProductoPorcentaje.PrecioCosto;
        }

        return new PromocionResponseDTO
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
            GananciaEstimada = ganancia,
            MargenEstimadoPorcentaje = margen,
            MargenEsEstimado = esEstimado,
            CostoTotal = costoTotal,
            CostoUnitarioProducto = costoUnitarioProducto,
            Productos = lineas
        };
    }

    // Margen estimado con los costos ACTUALES de los productos — no depende
    // de haber vendido la promo ninguna vez. Devuelve null cuando no se puede
    // calcular con confianza razonable (ej: % sobre una categoría o tag amplio,
    // donde el costo real depende de qué producto puntual se termine vendiendo).
    //
    // Para combos/cantidad con una línea "por tag" (sin producto fijo), se usa
    // el producto de MENOR COSTO del tag como estimación conservadora — mismo
    // criterio que ya usamos para excluir kilo de esas líneas: la venta real
    // puede resolver el tag con un producto más caro, así que esto marca
    // esEstimado=true para dejarlo claro en la UI.
    private async Task<(decimal? ganancia, decimal? margen, bool esEstimado)> CalcularMargenAsync(Promocion p)
    {
        switch (p.Tipo)
        {
            case TipoPromocion.Combo:
                {
                    if (!p.PrecioCombo.HasValue || p.PrecioCombo.Value <= 0)
                        return (null, null, false);

                    decimal costoTotal = 0;
                    bool estimado = false;

                    foreach (var pp in p.PromocionProductos)
                    {
                        var prod = pp.Producto;
                        if (prod == null && pp.TagId.HasValue)
                        {
                            var candidatos = await _productoRepo.GetByTagAsync(pp.TagId.Value);
                            prod = candidatos.OrderBy(c => c.PrecioCosto).FirstOrDefault();
                            estimado = true;
                        }
                        if (prod == null) return (null, null, false); // sin datos suficientes, no arriesgamos un número

                        costoTotal += CalcularImporte(prod.UnidadMedida, pp.Cantidad, prod.PrecioCosto);
                    }

                    var ganancia = p.PrecioCombo.Value - costoTotal;
                    var margen = Math.Round(ganancia / p.PrecioCombo.Value * 100, 1);
                    return (ganancia, margen, estimado);
                }

            case TipoPromocion.Cantidad:
                {
                    var prod = p.ProductoCantidad;
                    bool estimado = false;

                    if (prod == null && p.TagIdCantidad.HasValue)
                    {
                        var candidatos = await _productoRepo.GetByTagAsync(p.TagIdCantidad.Value);
                        prod = candidatos.OrderBy(c => c.PrecioCosto).FirstOrDefault();
                        estimado = true;
                    }
                    if (prod == null || !p.CantidadRequerida.HasValue || !p.CantidadPaga.HasValue)
                        return (null, null, false);

                    var ingreso = CalcularImporte(prod.UnidadMedida, p.CantidadPaga.Value, prod.PrecioVenta);
                    var costo = CalcularImporte(prod.UnidadMedida, p.CantidadRequerida.Value, prod.PrecioCosto);
                    if (ingreso <= 0) return (null, null, false);

                    var ganancia = ingreso - costo;
                    var margen = Math.Round(ganancia / ingreso * 100, 1);
                    return (ganancia, margen, estimado);
                }

            case TipoPromocion.Porcentaje:
                {
                    // Categoría o tag amplio: el costo real varía según qué producto
                    // se venda — no arriesgamos un número que podría ser engañoso.
                    if (p.ProductoIdPorcentaje == null || p.ProductoPorcentaje == null)
                        return (null, null, false);

                    var prod = p.ProductoPorcentaje;
                    decimal precioFinal = p.PrecioFijoDescuento
                        ?? Math.Round(prod.PrecioVenta * (1 - (p.PorcentajeDescuento ?? 0) / 100m), 2, MidpointRounding.AwayFromZero);

                    if (precioFinal <= 0) return (null, null, false);

                    var ganancia = precioFinal - prod.PrecioCosto;
                    var margen = Math.Round(ganancia / precioFinal * 100, 1);
                    return (ganancia, margen, false);
                }

            default:
                return (null, null, false);
        }
    }
}
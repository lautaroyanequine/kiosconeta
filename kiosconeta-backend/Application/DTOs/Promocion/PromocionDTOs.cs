using Domain.Enums;
using Domain.Enums.Domain.Enums;
using System;
using System.Collections.Generic;

namespace Application.DTOs.Promocion
{
    // ── Response ──────────────────────────────────────────
    public class PromocionResponseDTO
    {
        public int PromocionId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public TipoPromocion Tipo { get; set; }
        public string TipoNombre => Tipo.ToString();
        public bool Activa { get; set; }
        public DateTime? FechaDesde { get; set; }
        public DateTime? FechaHasta { get; set; }
        public int? TagIdPorcentaje { get; set; }
        public string? TagNombrePorcentaje { get; set; }

        public int? TagIdCantidad { get; set; }
        public string? TagNombreCantidad { get; set; }


        // Combo
        public decimal? PrecioCombo { get; set; }
        public List<PromocionProductoDTO> Productos { get; set; } = new();

        // Cantidad
        public int? CantidadRequerida { get; set; }
        public int? CantidadPaga { get; set; }
        public int? ProductoIdCantidad { get; set; }
        public string? ProductoNombreCantidad { get; set; }

        // Porcentaje
        public decimal? PorcentajeDescuento { get; set; }
        public decimal? PrecioFijoDescuento { get; set; }
        public int? ProductoIdPorcentaje { get; set; }
        public string? ProductoNombrePorcentaje { get; set; }
        public int? CategoriaIdPorcentaje { get; set; }
        public string? CategoriaNombrePorcentaje { get; set; }

        // Porcentaje con cantidad mínima (precio por volumen)
        public int? CantidadMinimaDescuento { get; set; }

        // ── Margen estimado (calculado con los costos actuales, sin vender) ──
        // null cuando no se puede estimar con confianza (ej: promo por categoría
        // o tag amplio, donde el costo real depende de qué producto se venda).
        public decimal? GananciaEstimada { get; set; }
        public decimal? MargenEstimadoPorcentaje { get; set; }
        // true si para calcularlo tuvimos que asumir el producto más barato de
        // un tag (porque la promo no apunta a un producto específico) — el
        // margen real de una venta puntual puede ser mayor a este estimado.
        public bool MargenEsEstimado { get; set; }

        // ── Costos (con los costos ACTUALES de los productos) ──
        // Costo total de lo que se lleva el cliente con UNA aplicación de la promo
        // (combo completo / N unidades de "cantidad" / 1 unidad con descuento %).
        public decimal? CostoTotal { get; set; }
        // Costo unitario del producto en promos de Cantidad y Porcentaje
        // (en las de Combo está en cada línea de Productos).
        public decimal? CostoUnitarioProducto { get; set; }
    }

    public class PromocionProductoDTO
    {
        public int? ProductoId { get; set; }      // antes era int obligatorio
        public int? TagId { get; set; }           // ← nuevo
        public string? TagNombre { get; set; }    // ← solo en el response
        public int Cantidad { get; set; }
        public string ProductoNombre { get; set; } = string.Empty;
        public decimal PrecioUnitario { get; set; }

        // ── Costo (solo en el response) ──
        // Costo actual del producto (por kilo si se vende al peso). Para una línea
        // "por tag" es el del producto MÁS BARATO del tag (estimación).
        // Importe de la línea a precio de lista (respeta kilos: gramos/1000 × precio por kilo).
        public decimal PrecioLinea { get; set; }
        public decimal? CostoUnitario { get; set; }
        // Costo de la línea completa: CostoUnitario × Cantidad (en gramos/kilo si corresponde).
        public decimal? CostoLinea { get; set; }
        public bool CostoEsEstimado { get; set; }
    }

    // ── Crear ─────────────────────────────────────────────
    public class CreatePromocionDTO
    {
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public TipoPromocion Tipo { get; set; }
        public DateTime? FechaDesde { get; set; }
        public DateTime? FechaHasta { get; set; }
        public int? TagIdPorcentaje { get; set; }
        public int? TagIdCantidad { get; set; }



        // Combo
        public decimal? PrecioCombo { get; set; }
        public List<CreatePromocionProductoDTO> Productos { get; set; } = new();

        // Cantidad
        public int? CantidadRequerida { get; set; }
        public int? CantidadPaga { get; set; }
        public int? ProductoIdCantidad { get; set; }

        // Porcentaje
        public decimal? PorcentajeDescuento { get; set; }
        public decimal? PrecioFijoDescuento { get; set; }
        public int? ProductoIdPorcentaje { get; set; }
        public int? CategoriaIdPorcentaje { get; set; }

        // Porcentaje con cantidad mínima (precio por volumen)
        public int? CantidadMinimaDescuento { get; set; }
    }

    public class CreatePromocionProductoDTO
    {
        public int? ProductoId { get; set; }
        public int? TagId { get; set; }
        public int Cantidad { get; set; } = 1;
    }
    // ── Detectar promos en carrito ────────────────────────
    public class DetectarPromocionesDTO
    {
        public int KioscoId { get; set; }
        public List<ItemCarritoDTO> Productos { get; set; } = new();
    }

    public class ItemCarritoDTO
    {
        public int ProductoId { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        // Si es Kilogramo, Cantidad está en GRAMOS y PrecioUnitario es "por kilo"
        // (misma convención que en toda la venta — ver Domain.Enums.UnidadMedida).
        public UnidadMedida UnidadMedida { get; set; } = UnidadMedida.Unidad;
    }

    // ── Resultado de detección ────────────────────────────
    public class ResultadoPromocionesDTO
    {
        public List<PromocionAplicadaDTO> PromocionesAplicadas { get; set; } = new();
        public decimal TotalOriginal { get; set; }
        public decimal TotalDescuento { get; set; }
        public decimal TotalConDescuento { get; set; }
    }

    public class PromocionAplicadaDTO
    {
        public int PromocionId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public TipoPromocion Tipo { get; set; }
        public decimal Descuento { get; set; }
        public string Descripcion { get; set; } = string.Empty;
    }
}
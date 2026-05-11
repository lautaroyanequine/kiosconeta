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
        public int? ProductoIdPorcentaje { get; set; }
        public string? ProductoNombrePorcentaje { get; set; }
        public int? CategoriaIdPorcentaje { get; set; }
        public string? CategoriaNombrePorcentaje { get; set; }

        // Porcentaje con cantidad mínima (precio por volumen)
        public int? CantidadMinimaDescuento { get; set; }
    }

    public class PromocionProductoDTO
    {
        public int ProductoId { get; set; }
        public string ProductoNombre { get; set; } = string.Empty;
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
    }

    // ── Crear ─────────────────────────────────────────────
    public class CreatePromocionDTO
    {
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public TipoPromocion Tipo { get; set; }
        public DateTime? FechaDesde { get; set; }
        public DateTime? FechaHasta { get; set; }

        // Combo
        public decimal? PrecioCombo { get; set; }
        public List<CreatePromocionProductoDTO> Productos { get; set; } = new();

        // Cantidad
        public int? CantidadRequerida { get; set; }
        public int? CantidadPaga { get; set; }
        public int? ProductoIdCantidad { get; set; }

        // Porcentaje
        public decimal? PorcentajeDescuento { get; set; }
        public int? ProductoIdPorcentaje { get; set; }
        public int? CategoriaIdPorcentaje { get; set; }

        // Porcentaje con cantidad mínima (precio por volumen)
        public int? CantidadMinimaDescuento { get; set; }
    }

    public class CreatePromocionProductoDTO
    {
        public int ProductoId { get; set; }
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
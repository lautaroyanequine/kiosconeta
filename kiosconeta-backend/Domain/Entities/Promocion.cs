using Domain.Enums;
using global::Domain.Enums.Domain.Enums;

namespace Domain.Entities
{
    public class Promocion
    {
        public int PromocionId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public TipoPromocion Tipo { get; set; }
        public bool Activa { get; set; } = true;
        public DateTime? FechaDesde { get; set; }
        public DateTime? FechaHasta { get; set; }
        public int KioscoId { get; set; }
        public Kiosco Kiosco { get; set; } = null!;

        // Para Combo
        public decimal? PrecioCombo { get; set; }

        // Para Cantidad (2x1, 3x2)
        public int? CantidadRequerida { get; set; }
        public int? CantidadPaga { get; set; }
        public int? ProductoIdCantidad { get; set; }
        public Producto? ProductoCantidad { get; set; }
        public int? TagIdCantidad { get; set; }
        public Tag? TagCantidad { get; set; }

        // Para Porcentaje
        public decimal? PorcentajeDescuento { get; set; }
        public decimal? PrecioFijoDescuento { get; set; } 

        public int? ProductoIdPorcentaje { get; set; }
        public Producto? ProductoPorcentaje { get; set; }
        public int? CategoriaIdPorcentaje { get; set; }
        public Categoria? CategoriaPorcentaje { get; set; }

        public int? TagIdPorcentaje { get; set; }
        public Tag? TagPorcentaje { get; set; }


        // Para Porcentaje con cantidad mínima (precio por volumen)
        // Si CantidadMinimaDescuento != null: el descuento solo aplica
        // cuando el cliente lleva >= CantidadMinimaDescuento unidades.
        public int? CantidadMinimaDescuento { get; set; }

    
        // Productos del combo
        public IList<PromocionProducto> PromocionProductos { get; set; } = new List<PromocionProducto>();
    }

    public class PromocionProducto
    {
        public int PromocionProductoId { get; set; }
        public int PromocionId { get; set; }
        public Promocion Promocion { get; set; } = null!;
       
        public int Cantidad { get; set; } = 1;
        public int? ProductoId { get; set; }        // ← ahora nullable
        public Producto? Producto { get; set; }      // ← ahora nullable

        public int? TagId { get; set; }              // ← nuevo
        public Tag? Tag { get; set; }                 // ← nuevo

    }
}
namespace Application.DTOs.Producto
{
    /// <summary>
    /// DTO de respuesta con información completa del producto
    /// </summary>
    public class ProductoResponseDTO
    {
        public int ProductoId { get; set; }
        public string Nombre { get; set; }
        public decimal PrecioCosto { get; set; }
        public decimal PrecioVenta { get; set; }
        public decimal MargenGanancia { get; set; } // Calculado: PrecioVenta - PrecioCosto
        public int CategoriaId { get; set; }
        public string CategoriaNombre { get; set; }
        public string? Distribuidor { get; set; }
        public string? CodigoBarra { get; set; }
        public string? Descripcion { get; set; }
        public string? Imagen { get; set; }
        public int StockActual { get; set; }
        public int StockMinimo { get; set; }
        public bool BajoStock { get; set; } // Calculado: StockActual <= StockMinimo
        public int KioscoId { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaModificacion { get; set; }
        public bool Activo { get; set; }
        public DateTime? FechaVencimiento { get; set; }
        public bool Vencido { get; set; } // Calculado
        public bool ProximoAVencer { get; set; } // Calculado: Vence en menos de 7 días
        public bool Suelto { get; set; }
    }
}
namespace Application.DTOs.Producto
{
    /// <summary>
    /// DTO para crear un nuevo producto
    /// </summary>
    public class CreateProductoDTO
    {
        public string Nombre { get; set; }
        public decimal PrecioCosto { get; set; }
        public decimal PrecioVenta { get; set; }
        public int CategoriaId { get; set; }
        public string? Distribuidor { get; set; }
        public string? CodigoBarra { get; set; }
        public string? Descripcion { get; set; }
        public string? Imagen { get; set; }
        public int StockActual { get; set; }
        public int StockMinimo { get; set; }
        public int KioscoId { get; set; }
        public DateTime? FechaVencimiento { get; set; }
        public bool Suelto { get; set; }
    }
}
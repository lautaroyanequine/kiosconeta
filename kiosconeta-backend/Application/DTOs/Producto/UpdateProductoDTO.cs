namespace Application.DTOs.Producto
{
    /// <summary>
    /// DTO para actualizar un producto existente
    /// </summary>
    public class UpdateProductoDTO
    {
        public int ProductoId { get; set; }
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
        public DateTime? FechaVencimiento { get; set; }
        public bool Suelto { get; set; }
        public bool Activo { get; set; }
    }
}
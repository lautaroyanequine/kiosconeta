namespace Domain.Entities
{
    public class Tag
    {
        public int TagId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public int KioscoId { get; set; }
        public Kiosco Kiosco { get; set; } = null!;
        public bool Activo { get; set; } = true;

        public IList<ProductoTag> ProductoTags { get; set; } = new List<ProductoTag>();
    }

    public class ProductoTag
    {
        public int ProductoTagId { get; set; }   // ← PK por convención, sin Fluent API

        public int ProductoId { get; set; }
        public Producto Producto { get; set; } = null!;

        public int TagId { get; set; }
        public Tag Tag { get; set; } = null!;
    }
}
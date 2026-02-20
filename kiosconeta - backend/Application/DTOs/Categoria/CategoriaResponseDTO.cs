namespace Application.DTOs.Categoria
{
    public class CategoriaResponseDTO
    {
        public int CategoriaID { get; set; }
        public string Nombre { get; set; }
        public int CantidadProductos { get; set; }  // Calculado
    }
}
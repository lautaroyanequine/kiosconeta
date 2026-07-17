namespace Application.DTOs.Tag
{
    public class TagResponseDTO
    {
        public int TagId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public bool Activo { get; set; }
    }

    public class CreateTagDTO
    {
        public string Nombre { get; set; } = string.Empty;
        public int KioscoId { get; set; }
    }
}
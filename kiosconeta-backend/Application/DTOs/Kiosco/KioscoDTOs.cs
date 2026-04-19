namespace Application.DTOs.Kiosco
{
    public class KioscoResponseDTO
    {
        public int KioscoId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Direccion { get; set; }
    }

    public class UpdateKioscoDTO
    {
        public string Nombre { get; set; } = string.Empty;
        public string? Direccion { get; set; }
    }
}
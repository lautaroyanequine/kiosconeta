namespace Application.DTOs.Auditoria
{
    public class AuditoriaLogResponseDTO
    {
        public int AuditoriaLogId { get; set; }

        public DateTime Fecha { get; set; }

        public string FechaFormateada => Fecha.ToString("dd/MM/yyyy HH:mm");

        public int EmpleadoId { get; set; }
        public string EmpleadoNombre { get; set; }

        public string TipoEvento { get; set; }
        public string Descripcion { get; set; }

        public string? DatosJson { get; set; }

        public bool EsSospechoso { get; set; }
        public string? MotivoSospecha { get; set; }

        public int KioscoId { get; set; }
    }
    public class RegistrarAuditoriaDTO
    {
        public int KioscoId { get; set; }
        public string TipoEvento { get; set; }
        public string Descripcion { get; set; }
        public string? Datos { get; set; }
        public bool EsSospechoso { get; set; }
        public string? MotivoSospecha { get; set; }
    }
}
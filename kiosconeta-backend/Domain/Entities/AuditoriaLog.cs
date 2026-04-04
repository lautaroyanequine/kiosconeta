namespace Domain.Entities
{
    public class AuditoriaLog
    {
        public int AuditoriaLogId { get; set; }
        public DateTime Fecha { get; set; }
        public int EmpleadoId { get; set; }
        public Empleado Empleado { get; set; }
        public int KioscoId { get; set; }
        public Kiosco Kiosco { get; set; }
        public string TipoEvento { get; set; }   // "VENTA_ANULADA", "CARRITO_LIMPIADO", etc.
        public string Descripcion { get; set; }
        public string? DatosJson { get; set; }   // datos extra en JSON
        public bool EsSospechoso { get; set; }   // marcado automáticamente
        public string? MotivoSospecha { get; set; }
    }
}
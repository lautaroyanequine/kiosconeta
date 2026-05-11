namespace Domain.Entities
{
    public class Categoria
    {
        public int CategoriaID { get; set; }

        public string Nombre { get; set; }

        // =========================
        // RELACIÓN CON KIOSCO
        // =========================
        public int KioscoId { get; set; }

        // Navigation Property (opcional pero recomendado)
        public Kiosco Kiosco { get; set; }
    }
}
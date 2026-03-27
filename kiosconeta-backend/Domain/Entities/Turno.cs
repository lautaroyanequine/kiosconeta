namespace Domain.Entities
{
    public class Turno
    {
        public int TurnoId { get; set; }
        public string Nombre { get; set; }

        public IList<Venta> Ventas { get; set; }


    }
}

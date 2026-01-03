namespace Domain.Entities
{
    public class Turno
    {
        public int TurnoID { get; set; }
        public string Nombre { get; set; }

        public IList<Venta> Ventas { get; set; }


    }
}

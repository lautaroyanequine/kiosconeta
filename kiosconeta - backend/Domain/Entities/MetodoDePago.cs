namespace Domain.Entities
{
    public class MetodoDePago
    {
        public int MetodoDePagoID { get; set; }
        public string Nombre { get; set; }
        public IList<Venta> Ventas { get; set; }

    }
}

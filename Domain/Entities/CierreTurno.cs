namespace Domain.Entities
{
    public class CierreTurno
    {
        public int CierreTurnoId { get; set; }
        public DateTime Fecha { get; set; }
        public int CantVentas { get; set; }
        public int MontoEsperado { get; set; }
        public int MontoReal { get; set; }
        public int Diferencia { get; set; }
        public int Efectivo { get; set; }
        public int Virtual { get; set; }
        public bool Estado { get; set; }
        public string Observaciones { get; set; }
        public int KioscoId { get; set; }
        public Kiosco Kiosco { get; set; }


    }
}

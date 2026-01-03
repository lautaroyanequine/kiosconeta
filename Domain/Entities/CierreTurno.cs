using Domain.Enums;

namespace Domain.Entities
{
    public class CierreTurno
    {
        public int CierreTurnoId { get; set; }

        public DateTime Fecha { get; set; }

        public int CantidadVentas { get; set; }

        public decimal MontoEsperado { get; set; }

        public decimal MontoReal { get; set; }

        public decimal Diferencia { get; set; }

        public string Observaciones { get; set; }

        public int KioscoId { get; set; }
        public Kiosco Kiosco { get; set; }

        public decimal Efectivo { get; set; }

        public decimal Virtual { get; set; }

        public EstadoCierre Estado { get; set; }

        public IList<Venta> Ventas { get; set; }
        public IList<CierreTurnoEmpleado>  cierreTurnoEmpleados { get; set; }
    }

}

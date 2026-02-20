namespace Domain.Entities
{
    public class Venta
    {
        public int VentaId { get; set; }

        public DateTime Fecha { get; set; }

        public decimal PrecioCosto { get; set; }

        public decimal Total { get; set; }

        public string? Detalles { get; set; }

        // 🔑 Foreign Keys
        public int EmpleadoId { get; set; }
        public Empleado Empleado { get; set; }

        public int CierreTurnoId { get; set; }
        public CierreTurno CierreTurno { get; set; }

        public int MetodoPagoId { get; set; }
        public MetodoDePago MetodoPago { get; set; }

        public int TurnoId { get; set; }
        public Turno Turno { get; set; }
        public int NumeroVenta { get; set; }
        public bool Anulada { get; set; }
        public IList<ProductoVenta> ProductoVentas { get; set; }

    }

}

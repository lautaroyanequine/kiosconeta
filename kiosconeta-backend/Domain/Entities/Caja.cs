using Domain.Enums;

namespace Domain.Entities
{
    // ─── Movimiento manual de caja ────────────────────────────────────────────
    public class MovimientoCaja
    {
        public int MovimientoCajaId { get; set; }
        public DateTime Fecha { get; set; }
        public string Descripcion { get; set; } = string.Empty;
        public decimal Monto { get; set; }
        public TipoMovimiento Tipo { get; set; }   // Ingreso = 1, Egreso = 2

        public int KioscoId { get; set; }
        public Kiosco Kiosco { get; set; }

        public int EmpleadoId { get; set; }
        public Empleado Empleado { get; set; }
    }

    // ─── Saldo inicial configurable por kiosco ────────────────────────────────
    public class SaldoCaja
    {
        public int SaldoCajaId { get; set; }
        public int KioscoId { get; set; }
        public Kiosco Kiosco { get; set; }
        public decimal SaldoInicial { get; set; }
        public DateTime FechaActualizacion { get; set; }
    }
}

namespace Domain.Enums
{
    public enum TipoMovimiento
    {
        Ingreso = 1,
        Egreso = 2
    }
}

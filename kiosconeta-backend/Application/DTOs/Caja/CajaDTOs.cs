using Domain.Enums;

namespace Application.DTOs.Caja
{
    // ─── Resumen completo de caja ─────────────────────────────────────────────
    public class CajaResumenDTO
    {
        public decimal SaldoInicial { get; set; }
        public decimal SaldoActual { get; set; }
        public decimal TotalVentasEfectivo { get; set; }
        public decimal TotalVentasVirtual { get; set; }
        public decimal TotalVentas { get; set; }
        public decimal TotalGastos { get; set; }
        public decimal GananciaTotal { get; set; }
        public int CantidadVentas { get; set; }
        public decimal TotalIngresosManual { get; set; }
        public decimal TotalEgresosManual { get; set; }
        public List<MovimientoCajaResponseDTO> Movimientos { get; set; } = new();
    }

    // ─── Movimiento de caja ───────────────────────────────────────────────────
    public class MovimientoCajaResponseDTO
    {
        public int MovimientoCajaId { get; set; }
        public DateTime Fecha { get; set; }
        public string FechaFormateada => Fecha.ToString("dd/MM/yyyy HH:mm");
        public string Descripcion { get; set; } = string.Empty;
        public decimal Monto { get; set; }
        public TipoMovimiento Tipo { get; set; }
        public string TipoNombre => Tipo == TipoMovimiento.Ingreso ? "Ingreso" : "Egreso";
        public int KioscoId { get; set; }
        public int EmpleadoId { get; set; }
        public string EmpleadoNombre { get; set; } = string.Empty;
    }

    // ─── Crear movimiento ─────────────────────────────────────────────────────
    public class CreateMovimientoCajaDTO
    {
        public string Descripcion { get; set; } = string.Empty;
        public decimal Monto { get; set; }
        public TipoMovimiento Tipo { get; set; }
        public int EmpleadoId { get; set; }
    }

    // ─── Actualizar saldo inicial ─────────────────────────────────────────────
    public class UpdateSaldoInicialDTO
    {
        public decimal SaldoInicial { get; set; }
        public int EmpleadoId { get; set; }
    }
}
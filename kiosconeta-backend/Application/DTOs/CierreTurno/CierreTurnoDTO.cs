using Domain.Enums;

namespace Application.DTOs.CierreTurno
{
    // ─── ABRIR TURNO ─────────────────────────────────
    public class AbrirTurnoDTO
    {
        public int KioscoId { get; set; }
        public int EmpleadoId { get; set; }
        public decimal EfectivoInicial { get; set; }
        public string? Observaciones { get; set; }
    }

    // ─── CERRAR TURNO ────────────────────────────────
    public class CerrarTurnoDTO
    {
     //   public int CierreTurnoId { get; set; }

        /// <summary>
        /// Efectivo físico que el empleado contó en la caja
        /// </summary>
        public decimal EfectivoContado { get; set; }

        /// <summary>
        /// Monto que realmente se acreditó en cuenta (tarjeta, MercadoPago, etc.)
        /// </summary>
        public decimal VirtualAcreditado { get; set; }

        public string? Observaciones { get; set; }
    }

    // ─── RESPUESTA DE CIERRE TURNO ───────────────────
    public class CierreTurnoResponseDTO
    {
        public int CierreTurnoId { get; set; }
        public DateTime Fecha { get; set; }
        public EstadoCierre Estado { get; set; }
        public string EstadoNombre { get; set; }

        // Montos
        public decimal EfectivoInicial { get; set; }
        public decimal EfectivoFinal { get; set; }
        public decimal VirtualFinal { get; set; }
        public decimal MontoEsperado { get; set; }
        public decimal MontoReal { get; set; }
        public decimal Diferencia { get; set; }

        // Estadísticas
        public int CantidadVentas { get; set; }
        public decimal TotalVentas { get; set; }
        public decimal TotalEfectivo { get; set; }
        public decimal TotalVirtual { get; set; }
        public decimal TotalGastos { get; set; }

        // Observaciones
        public string? Observaciones { get; set; }

        // Relaciones
        public int KioscoId { get; set; }
        public string KioscoNombre { get; set; }
        public List<EmpleadoTurnoDTO> Empleados { get; set; } = new();
    }

    // ─── EMPLEADO EN EL TURNO ────────────────────────
    public class EmpleadoTurnoDTO
    {
        public int EmpleadoId { get; set; }
        public string EmpleadoNombre { get; set; }
    }

    // ─── RESUMEN DEL TURNO ACTUAL ────────────────────
    public class TurnoActualDTO
    {
        public int CierreTurnoId { get; set; }
        public DateTime FechaApertura { get; set; }

        // Efectivo
        public decimal EfectivoInicial { get; set; }
        public decimal EfectivoEsperado { get; set; }  // ← NUEVO: Calculado automáticamente

        // Ventas
        public int CantidadVentas { get; set; }
        public decimal TotalVentas { get; set; }
        public decimal TotalEfectivo { get; set; }
        public decimal TotalVirtual { get; set; }

        // Gastos
        public decimal TotalGastos { get; set; }  // ← NUEVO: Calculado automáticamente

        public List<string> Empleados { get; set; } = new();
    }
}
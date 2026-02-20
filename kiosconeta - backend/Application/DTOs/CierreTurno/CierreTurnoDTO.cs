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
        public int CierreTurnoId { get; set; }
        public decimal EfectivoFinal { get; set; }
        public decimal VirtualFinal { get; set; }
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
        public decimal EfectivoInicial { get; set; }
        public int CantidadVentas { get; set; }
        public decimal TotalVentas { get; set; }
        public decimal TotalEfectivo { get; set; }
        public decimal TotalVirtual { get; set; }
        public List<string> Empleados { get; set; } = new();
    }
}
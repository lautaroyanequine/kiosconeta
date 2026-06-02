using Domain.Enums;

namespace Application.DTOs.CierreTurno
{
    // ─── ABRIR TURNO ─────────────────────────────────
    public class AbrirTurnoDTO
    {
        public int KioscoId { get; set; }
        public int EmpleadoId { get; set; }
        public int TurnoId { get; set; }
        public decimal EfectivoInicial { get; set; }
        public decimal VirtualInicial { get; set; }  // ← agregar
        public DateTime? FechaDispositivo { get; set; }
        public string? Observaciones { get; set; }
    }

    // ─── CERRAR TURNO ────────────────────────────────
    public class CerrarTurnoDTO
    {
        public int EmpleadoId { get; set; }
        public int TurnoId { get; set; }
        public string TurnoNombre { get; set; }
        public decimal EfectivoContado { get; set; }      // efectivo de ventas (sin fondo)
        public decimal VirtualAcreditado { get; set; }    // virtual de ventas (sin fondo)
        public decimal EfectivoFinalFondo { get; set; }   // ← NUEVO: fondo que dejan al cerrar
        public decimal VirtualFinalFondo { get; set; }    // ← NUEVO: virtual que dejan al cerrar
        public DateTime? FechaDispositivo { get; set; }
        public string? Observaciones { get; set; }
    }

    // ─── RESPUESTA DE CIERRE TURNO ───────────────────
    public class CierreTurnoResponseDTO
    {
        public int CierreTurnoId { get; set; }
        public DateTime Fecha { get; set; }
        public string FechaFormateada => Fecha.ToString("dd/MM/yyyy HH:mm");
        public EstadoCierre Estado { get; set; }
        public string EstadoNombre { get; set; }

        public DateTime? FechaCierre { get; set; }   
        public string? FechaCierreFormateada => FechaCierre?.ToString("HH:mm");
        // Montos
        public decimal EfectivoInicial { get; set; }
        public decimal EfectivoFinal { get; set; }
        public decimal VirtualInicial { get; set; }
        public decimal EfectivoFinalFondo { get; set; }   // ← NUEVO
        public decimal VirtualFinalFondo { get; set; }    // ← NUEVO
        public decimal DiferenciaEfectivo { get; set; }   // ← NUEVO (solo ventas)
        public decimal DiferenciaVirtual { get; set; }
        public decimal VirtualFinal { get; set; }
        public decimal MontoEsperado { get; set; }
        public decimal MontoReal { get; set; }
        public decimal Diferencia { get; set; }

        public int TurnoId { get; set; }
        public string TurnoNombre { get; set; } = string.Empty;
        public decimal GananciaTotal { get; set; }

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
        public string FechaAperturaFormateada => FechaApertura.ToString("dd/MM/yyyy HH:mm");

        // Efectivo
        public decimal EfectivoInicial { get; set; }
        public decimal VirtualInicial { get; set; }
        public decimal EfectivoEsperado { get; set; } 

        // Ventas
        public int CantidadVentas { get; set; }
        public decimal TotalVentas { get; set; }
        public decimal TotalEfectivo { get; set; }
        public decimal TotalVirtual { get; set; }

        public int TurnoId { get; set; }
        public string TurnoNombre { get; set; } = string.Empty;

        // Gastos
        public decimal TotalGastos { get; set; } 

        public List<string> Empleados { get; set; } = new();
    }
}
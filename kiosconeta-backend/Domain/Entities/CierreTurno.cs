using Domain.Enums;

namespace Domain.Entities
{
    public class CierreTurno
    {
        public int CierreTurnoId { get; private set; }

        // ───────────── CICLO DE VIDA ─────────────

        public DateTime FechaApertura { get; private set; }
        public DateTime? FechaCierre { get; private set; }

        public EstadoCierre Estado { get; private set; }

        // ───────────── IDENTIDAD ─────────────

        public int KioscoId { get; private set; }
        public Kiosco Kiosco { get; private set; }

        // ───────────── MONTOS ─────────────

        public decimal EfectivoInicial { get; private set; }
        public decimal EfectivoFinal { get; private set; }
        public decimal VirtualFinal { get; private set; }
        public decimal VirtualInicial { get; private set; }

        public decimal EfectivoFinalFondo { get; set; } = 0;  // ← NUEVO
        public decimal VirtualFinalFondo { get; set; } = 0;   // ← NUEVO

        // MontoEsperado = Suma neta de lo vendido en el turno (fijo para el panel superior)
        public decimal MontoEsperado { get; private set; }

        // MontoReal = Lo que realmente ingresó (Efectivo Contado Neto + Virtual Acreditado Neto)
        public decimal MontoReal { get; private set; }

        // Diferencia = El sobrante (+) o faltante (-) real de la caja
        public decimal Diferencia { get; private set; }

        public int CantidadVentas { get; private set; }

        public string Observaciones { get; private set; } = string.Empty;

        // ───────────── RELACIONES ─────────────
        public int TurnoId { get; private set; }
        public Turno Turno { get; private set; }
        public IList<Venta> Ventas { get; private set; } = new List<Venta>();
        public IList<CierreTurnoEmpleado> CierreTurnoEmpleados { get; private set; } = new List<CierreTurnoEmpleado>();

        // Constructor vacío para EF
        protected CierreTurno() { }

        // ───────────── MODIFICACIÓN AL CONSTRUCTOR PRIVADO (Línea ~52) ─────────────
        private CierreTurno(int kioscoId, decimal efectivoInicial, decimal virtualInicial, string observaciones, int turnoId, DateTime? fechaAperturaCliente = null)
        {
            if (efectivoInicial < 0)
                throw new InvalidOperationException("El efectivo inicial no puede ser negativo");

            KioscoId = kioscoId;

            // 🌟 Si viene la fecha del dispositivo cliente, usamos esa; si no, cae en UtcNow
            FechaApertura = fechaAperturaCliente ?? DateTime.UtcNow;
            Estado = EstadoCierre.Abierto;
            TurnoId = turnoId;

            EfectivoInicial = efectivoInicial;
            EfectivoFinal = 0;
            VirtualInicial = virtualInicial;
            VirtualFinal = 0;

            MontoEsperado = 0;
            MontoReal = 0;
            Diferencia = 0;
            CantidadVentas = 0;

            Observaciones = observaciones ?? string.Empty;
        }

        // ───────────── MODIFICACIÓN AL FACTORY METHOD (Línea ~76) ─────────────
        public static CierreTurno Abrir(int kioscoId, decimal efectivoInicial, decimal virtualInicial, string observaciones, int turnoId, DateTime? fechaAperturaCliente = null)
        {
            return new CierreTurno(kioscoId, efectivoInicial, virtualInicial, observaciones, turnoId, fechaAperturaCliente);
        }

        // ───────────── MODIFICACIÓN AL MÉTODO CERRAR (Línea ~83) ─────────────
        public void Cerrar(
            decimal totalEfectivoVentas,
            decimal totalVirtualVentas,
            decimal totalGastos,
            decimal efectivoContado,      // ventas sin fondo
            decimal virtualAcreditado,    // ventas sin fondo
            decimal efectivoFinalFondo,   // ← NUEVO
            decimal virtualFinalFondo,    // ← NUEVO
            int cantidadVentas,
            string observacionesExtra,
            DateTime? fechaCierreCliente = null)
        {
            if (Estado != EstadoCierre.Abierto)
                throw new InvalidOperationException("El turno ya está cerrado");

            // Diferencias solo de ventas (sin fondo)
            var efectivoEsperadoVentas = totalEfectivoVentas - totalGastos;
            var diferenciaEfectivo = efectivoContado - efectivoEsperadoVentas;
            var diferenciaVirtual = virtualAcreditado - totalVirtualVentas;

            // MontoReal = lo que generó el turno (sin fondo)
            MontoReal = efectivoContado + virtualAcreditado;
            MontoEsperado = totalEfectivoVentas + totalVirtualVentas - totalGastos;
            Diferencia = diferenciaEfectivo + diferenciaVirtual;

            EfectivoFinal = efectivoContado;
            VirtualFinal = virtualAcreditado;
            EfectivoFinalFondo = efectivoFinalFondo;  // ← NUEVO
            VirtualFinalFondo = virtualFinalFondo;   // ← NUEVO
            CantidadVentas = cantidadVentas;
            Estado = EstadoCierre.Cerrado;
            FechaCierre = fechaCierreCliente ?? DateTime.UtcNow;

            if (!string.IsNullOrWhiteSpace(observacionesExtra))
                Observaciones += "\n" + observacionesExtra;
        }
    }
}
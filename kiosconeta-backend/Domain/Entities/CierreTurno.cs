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
            decimal efectivoContado,
            decimal virtualAcreditado,
            int cantidadVentas,
            string observacionesExtra,
            DateTime? fechaCierreCliente = null) // 🌟 Agregamos parámetro opcional
        {
            if (Estado != EstadoCierre.Abierto)
                throw new InvalidOperationException("El turno ya está cerrado");

            if (efectivoContado < 0)
                throw new InvalidOperationException("El efectivo contado no puede ser negativo");

            var efectivoEsperadoEnCaja = EfectivoInicial + totalEfectivoVentas - totalGastos;
            var virtualEsperadoEnCuenta = VirtualInicial + totalVirtualVentas;

            var diferenciaEfectivo = efectivoContado - efectivoEsperadoEnCaja;
            var diferenciaVirtual = virtualAcreditado - virtualEsperadoEnCuenta;

            MontoEsperado = totalEfectivoVentas + totalVirtualVentas;
            Diferencia = diferenciaEfectivo + diferenciaVirtual;
            MontoReal = (efectivoContado - EfectivoInicial + totalGastos) + (virtualAcreditado - VirtualInicial);

            EfectivoFinal = efectivoContado;
            VirtualFinal = virtualAcreditado;
            CantidadVentas = cantidadVentas;
            Estado = EstadoCierre.Cerrado;

            // 🌟 Asignamos la fecha exacta capturada en el dispositivo de origen
            FechaCierre = fechaCierreCliente ?? DateTime.UtcNow;

            if (!string.IsNullOrWhiteSpace(observacionesExtra))
                Observaciones += "\n" + observacionesExtra;
        }
    }
}
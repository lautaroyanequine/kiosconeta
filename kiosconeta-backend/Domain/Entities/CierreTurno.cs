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

        public decimal MontoEsperado { get; private set; }
        public decimal MontoReal { get; private set; }
        public decimal Diferencia { get; private set; }

        public int CantidadVentas { get; private set; }

        public string Observaciones { get; private set; } = string.Empty;

        // ───────────── RELACIONES ─────────────

        public IList<Venta> Ventas { get; private set; } = new List<Venta>();
        public IList<CierreTurnoEmpleado> CierreTurnoEmpleados { get; private set; } = new List<CierreTurnoEmpleado>();

        // Constructor vacío para EF
        protected CierreTurno() { }

        private CierreTurno(int kioscoId, decimal efectivoInicial, string observaciones)
        {
            if (efectivoInicial < 0)
                throw new InvalidOperationException("El efectivo inicial no puede ser negativo");

            KioscoId = kioscoId;

            FechaApertura = DateTime.Now;
            Estado = EstadoCierre.Abierto;

            EfectivoInicial = efectivoInicial;
            EfectivoFinal = 0;
            VirtualFinal = 0;

            MontoEsperado = 0;
            MontoReal = 0;
            Diferencia = 0;
            CantidadVentas = 0;

            Observaciones = observaciones ?? string.Empty;
        }

        // ───────────── FACTORY METHOD ─────────────

        public static CierreTurno Abrir(int kioscoId, decimal efectivoInicial, string observaciones)
        {
            return new CierreTurno(kioscoId, efectivoInicial, observaciones);
        }

        // ───────────── LÓGICA DE CIERRE ─────────────

        public void Cerrar(
            decimal totalEfectivoVentas,
            decimal totalVirtualVentas,
            decimal totalGastos,
            decimal efectivoContado,
            decimal virtualAcreditado,
            int cantidadVentas,
            string observacionesExtra)
        {
            if (Estado != EstadoCierre.Abierto)
                throw new InvalidOperationException("El turno ya está cerrado");

            if (efectivoContado < 0)
                throw new InvalidOperationException("El efectivo contado no puede ser negativo");

            var efectivoEsperado = EfectivoInicial + totalEfectivoVentas - totalGastos;
            var virtualEsperado = totalVirtualVentas;

            var diferenciaEfectivo = efectivoContado - efectivoEsperado;
            var diferenciaVirtual = virtualAcreditado - virtualEsperado;

            MontoEsperado = efectivoEsperado + virtualEsperado;
            MontoReal = efectivoContado + virtualAcreditado;

            Diferencia = diferenciaEfectivo + diferenciaVirtual;

            EfectivoFinal = efectivoContado;
            VirtualFinal = virtualAcreditado;

            CantidadVentas = cantidadVentas;

            Estado = EstadoCierre.Cerrado;
            FechaCierre = DateTime.Now;

            if (!string.IsNullOrWhiteSpace(observacionesExtra))
                Observaciones += "\n" + observacionesExtra;
        }
    }
}
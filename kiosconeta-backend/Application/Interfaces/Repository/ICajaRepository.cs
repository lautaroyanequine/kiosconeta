using Application.DTOs.Caja;
using Domain.Entities;

namespace Application.Interfaces.Repository
{
        public interface ICajaRepository
        {
            // Movimientos
            Task<IEnumerable<MovimientoCaja>> GetMovimientosByKioscoAsync(int kioscoId);
            Task<MovimientoCaja?> GetMovimientoByIdAsync(int id);
            Task<MovimientoCaja> CreateMovimientoAsync(MovimientoCaja movimiento);
            Task<bool> DeleteMovimientoAsync(int id);

            // Saldo inicial
            Task<SaldoCaja?> GetSaldoByKioscoAsync(int kioscoId);
            Task<SaldoCaja> UpsertSaldoAsync(int kioscoId, decimal saldoInicial);

            // Totales para calcular saldo actual / totales del período
            // desde/hasta = null → sin filtro de fecha (histórico completo)
            Task<decimal> GetTotalVentasEfectivoAsync(int kioscoId, DateTime? desde = null, DateTime? hasta = null);
            Task<decimal> GetTotalVentasVirtualAsync(int kioscoId, DateTime? desde = null, DateTime? hasta = null);
            Task<decimal> GetTotalGastosAsync(int kioscoId, DateTime? desde = null, DateTime? hasta = null);
            Task<decimal> GetTotalIngresosManualAsync(int kioscoId, DateTime? desde = null, DateTime? hasta = null);
            Task<decimal> GetTotalEgresosManualAsync(int kioscoId, DateTime? desde = null, DateTime? hasta = null);
            Task<int> GetCantidadVentasAsync(int kioscoId, DateTime? desde = null, DateTime? hasta = null);
            Task<decimal> GetGananciaTotalAsync(int kioscoId, DateTime? desde = null, DateTime? hasta = null);
            Task<List<MovimientoExtractoDTO>> GetExtractoAsync(int kioscoId, DateTime? desde = null, DateTime? hasta = null);
        }
}

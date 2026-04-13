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

        // Totales para calcular saldo actual
        Task<decimal> GetTotalVentasEfectivoAsync(int kioscoId);
        Task<decimal> GetTotalVentasVirtualAsync(int kioscoId);
        Task<decimal> GetTotalGastosAsync(int kioscoId);
        Task<decimal> GetTotalIngresosManualAsync(int kioscoId);
        Task<decimal> GetTotalEgresosManualAsync(int kioscoId);
        Task<int> GetCantidadVentasAsync(int kioscoId);
        Task<decimal> GetGananciaTotalAsync(int kioscoId);
    }
}
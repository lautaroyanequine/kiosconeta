using Application.Interfaces.Repository;
using Domain.Entities;
using Domain.Enums;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infraestructure.Repository
{
    public class CajaRepository : ICajaRepository
    {
        private readonly AppDbContext _context;

        public CajaRepository(AppDbContext context)
        {
            _context = context;
        }

        // ═══════════════════════════════════════════════════
        // MOVIMIENTOS
        // ═══════════════════════════════════════════════════

        public async Task<IEnumerable<MovimientoCaja>> GetMovimientosByKioscoAsync(int kioscoId)
        {
            return await _context.MovimientosCaja
                .Include(m => m.Empleado)
                .Include(m => m.Kiosco)
                .Where(m => m.KioscoId == kioscoId)
                .OrderByDescending(m => m.Fecha)
                .ToListAsync();
        }

        public async Task<MovimientoCaja?> GetMovimientoByIdAsync(int id)
        {
            return await _context.MovimientosCaja
                .Include(m => m.Empleado)
                .Include(m => m.Kiosco)
                .FirstOrDefaultAsync(m => m.MovimientoCajaId == id);
        }

        public async Task<MovimientoCaja> CreateMovimientoAsync(MovimientoCaja movimiento)
        {
            movimiento.Fecha = DateTime.UtcNow;
            _context.MovimientosCaja.Add(movimiento);
            await _context.SaveChangesAsync();
            return await GetMovimientoByIdAsync(movimiento.MovimientoCajaId)
                ?? throw new Exception("Error al recargar movimiento de caja");
        }

        public async Task<bool> DeleteMovimientoAsync(int id)
        {
            var movimiento = await _context.MovimientosCaja.FindAsync(id);
            if (movimiento == null) return false;

            _context.MovimientosCaja.Remove(movimiento);
            await _context.SaveChangesAsync();
            return true;
        }

        // ═══════════════════════════════════════════════════
        // SALDO INICIAL
        // ═══════════════════════════════════════════════════

        public async Task<SaldoCaja?> GetSaldoByKioscoAsync(int kioscoId)
        {
            return await _context.SaldosCaja
                .FirstOrDefaultAsync(s => s.KioscoId == kioscoId);
        }

        public async Task<SaldoCaja> UpsertSaldoAsync(int kioscoId, decimal saldoInicial)
        {
            var saldo = await _context.SaldosCaja
                .FirstOrDefaultAsync(s => s.KioscoId == kioscoId);

            if (saldo == null)
            {
                saldo = new SaldoCaja
                {
                    KioscoId = kioscoId,
                    SaldoInicial = saldoInicial,
                    FechaActualizacion = DateTime.UtcNow
                };
                _context.SaldosCaja.Add(saldo);
            }
            else
            {
                saldo.SaldoInicial = saldoInicial;
                saldo.FechaActualizacion = DateTime.UtcNow;
                _context.SaldosCaja.Update(saldo);
            }

            await _context.SaveChangesAsync();
            return saldo;
        }

        // ═══════════════════════════════════════════════════
        // TOTALES PARA CALCULAR SALDO ACTUAL
        // ═══════════════════════════════════════════════════

        public async Task<decimal> GetTotalVentasEfectivoAsync(int kioscoId)
        {
            // Solo sumamos el MontoReal (lo que el cajero entregó por ventas).
            // NO restamos el efectivo inicial aquí.
            return await _context.CierresTurno
                .Where(ct => ct.KioscoId == kioscoId && ct.Estado == EstadoCierre.Cerrado)
                .SumAsync(ct => (decimal?)ct.MontoReal) ?? 0;
        }

        public async Task<decimal> GetTotalVentasVirtualAsync(int kioscoId)
        {
            return await _context.CierresTurno
                .Where(ct => ct.KioscoId == kioscoId
                    && ct.Estado == EstadoCierre.Cerrado)
                .SumAsync(ct => (decimal?)ct.VirtualFinal) ?? 0;
        }

        public async Task<decimal> GetTotalGastosAsync(int kioscoId)
        {
            return await _context.Gastos
                .Where(g => g.KioscoId == kioscoId
                    && g.CierreTurnoId == null)  // ← solo gastos admin
                .SumAsync(g => (decimal?)g.Monto) ?? 0;
        }

        public async Task<decimal> GetTotalIngresosManualAsync(int kioscoId)
        {
            return await _context.MovimientosCaja
                .Where(m => m.KioscoId == kioscoId && m.Tipo == TipoMovimiento.Ingreso)
                .SumAsync(m => (decimal?)m.Monto) ?? 0;
        }

        public async Task<decimal> GetTotalEgresosManualAsync(int kioscoId)
        {
            return await _context.MovimientosCaja
                .Where(m => m.KioscoId == kioscoId && m.Tipo == TipoMovimiento.Egreso)
                .SumAsync(m => (decimal?)m.Monto) ?? 0;
        }

        public async Task<int> GetCantidadVentasAsync(int kioscoId)
        {
            return await _context.CierresTurno
                .Where(ct => ct.KioscoId == kioscoId
                    && ct.Estado == EstadoCierre.Cerrado)
                .SumAsync(ct => (int?)ct.CantidadVentas) ?? 0;
        }

        public async Task<decimal> GetGananciaTotalAsync(int kioscoId)
        {
            return await _context.ProductosVenta
                .Where(pv =>
                    pv.Venta.CierreTurno.KioscoId == kioscoId &&
                    pv.Venta.CierreTurno.Estado == EstadoCierre.Cerrado && // 👈 Aseguramos que el turno ya rindió cuentas
                    pv.Venta.Anulada == false // 👈 Filtramos las anuladas explícitamente
                )
                .SumAsync(pv => (decimal?)((pv.PrecioUnitario - pv.Producto.PrecioCosto) * pv.Cantidad)) ?? 0;
        }
    }
}
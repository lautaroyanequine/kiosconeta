using Application.DTOs.Caja;
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
        // TOTALES PARA CALCULAR SALDO ACTUAL / TOTALES DEL PERÍODO
        // desde/hasta = null → sin filtro (histórico completo)
        // ═══════════════════════════════════════════════════

        public async Task<decimal> GetTotalVentasEfectivoAsync(int kioscoId, DateTime? desde = null, DateTime? hasta = null)
        {
            // Usa MontoReal que refleja lo físicamente contado
            // Restamos la parte virtual para quedarnos solo con efectivo
            return await _context.CierresTurno
                .Where(ct => ct.KioscoId == kioscoId && ct.Estado == EstadoCierre.Cerrado)
                .Where(ct => !desde.HasValue || (ct.FechaCierre ?? ct.FechaApertura) >= desde.Value)
                .Where(ct => !hasta.HasValue || (ct.FechaCierre ?? ct.FechaApertura) < hasta.Value)
                .SumAsync(ct => (decimal?)(ct.MontoReal - (ct.VirtualFinal - ct.VirtualInicial))) ?? 0;
        }

        public async Task<decimal> GetTotalVentasVirtualAsync(int kioscoId, DateTime? desde = null, DateTime? hasta = null)
        {
            // VirtualFinal - VirtualInicial = lo realmente acreditado en el período
            // Incluye sobrantes virtuales
            return await _context.CierresTurno
                .Where(ct => ct.KioscoId == kioscoId && ct.Estado == EstadoCierre.Cerrado)
                .Where(ct => !desde.HasValue || (ct.FechaCierre ?? ct.FechaApertura) >= desde.Value)
                .Where(ct => !hasta.HasValue || (ct.FechaCierre ?? ct.FechaApertura) < hasta.Value)
                .SumAsync(ct => (decimal?)(ct.VirtualFinal - ct.VirtualInicial)) ?? 0;
        }

        public async Task<decimal> GetTotalGastosAsync(int kioscoId, DateTime? desde = null, DateTime? hasta = null)
        {
            return await _context.Gastos
                .Where(g => g.KioscoId == kioscoId
                    && g.CierreTurnoId == null)  // ← solo gastos admin
                .Where(g => !desde.HasValue || g.Fecha >= desde.Value)
                .Where(g => !hasta.HasValue || g.Fecha < hasta.Value)
                .SumAsync(g => (decimal?)g.Monto) ?? 0;
        }

        public async Task<decimal> GetTotalIngresosManualAsync(int kioscoId, DateTime? desde = null, DateTime? hasta = null)
        {
            return await _context.MovimientosCaja
                .Where(m => m.KioscoId == kioscoId && m.Tipo == TipoMovimiento.Ingreso)
                .Where(m => !desde.HasValue || m.Fecha >= desde.Value)
                .Where(m => !hasta.HasValue || m.Fecha < hasta.Value)
                .SumAsync(m => (decimal?)m.Monto) ?? 0;
        }

        public async Task<decimal> GetTotalEgresosManualAsync(int kioscoId, DateTime? desde = null, DateTime? hasta = null)
        {
            return await _context.MovimientosCaja
                .Where(m => m.KioscoId == kioscoId && m.Tipo == TipoMovimiento.Egreso)
                .Where(m => !desde.HasValue || m.Fecha >= desde.Value)
                .Where(m => !hasta.HasValue || m.Fecha < hasta.Value)
                .SumAsync(m => (decimal?)m.Monto) ?? 0;
        }

        public async Task<int> GetCantidadVentasAsync(int kioscoId, DateTime? desde = null, DateTime? hasta = null)
        {
            return await _context.CierresTurno
                .Where(ct => ct.KioscoId == kioscoId
                    && ct.Estado == EstadoCierre.Cerrado)
                .Where(ct => !desde.HasValue || (ct.FechaCierre ?? ct.FechaApertura) >= desde.Value)
                .Where(ct => !hasta.HasValue || (ct.FechaCierre ?? ct.FechaApertura) < hasta.Value)
                .SumAsync(ct => (int?)ct.CantidadVentas) ?? 0;
        }

        public async Task<decimal> GetGananciaTotalAsync(int kioscoId, DateTime? desde = null, DateTime? hasta = null)
        {
            return await _context.ProductosVenta
                .Where(pv =>
                    pv.Venta.CierreTurno.KioscoId == kioscoId &&
                    pv.Venta.CierreTurno.Estado == EstadoCierre.Cerrado && // 👈 Aseguramos que el turno ya rindió cuentas
                    pv.Venta.Anulada == false // 👈 Filtramos las anuladas explícitamente
                )
                .Where(pv => !desde.HasValue || (pv.Venta.CierreTurno.FechaCierre ?? pv.Venta.CierreTurno.FechaApertura) >= desde.Value)
                .Where(pv => !hasta.HasValue || (pv.Venta.CierreTurno.FechaCierre ?? pv.Venta.CierreTurno.FechaApertura) < hasta.Value)
                .SumAsync(pv => (decimal?)((pv.PrecioUnitario - pv.Producto.PrecioCosto) * pv.Cantidad)) ?? 0;
        }

        public async Task<List<MovimientoExtractoDTO>> GetExtractoAsync(int kioscoId, DateTime? desde = null, DateTime? hasta = null)
        {
            var extracto = new List<MovimientoExtractoDTO>();

            // ── Cierres de turno cerrados → suman a la caja ──────────────────────
            var cierres = await _context.CierresTurno
                .Where(c => c.KioscoId == kioscoId && c.Estado == EstadoCierre.Cerrado)
                .Where(c => !desde.HasValue || (c.FechaCierre ?? c.FechaApertura) >= desde.Value)
                .Where(c => !hasta.HasValue || (c.FechaCierre ?? c.FechaApertura) < hasta.Value)
                .ToListAsync();

            extracto.AddRange(cierres.Select(c => new MovimientoExtractoDTO
            {
                Id = $"cierre-{c.CierreTurnoId}",
                Fecha = c.FechaCierre ?? c.FechaApertura,
                Descripcion = $"Cierre de turno #{c.CierreTurnoId} ({c.CantidadVentas} ventas)",
                Monto = c.MontoReal,
                EsIngreso = true,
                Origen = OrigenMovimiento.CierreTurno,
                PuedeEliminar = false
            }));

            // ── Gastos administrativos → restan de la caja ───────────────────────
            var gastos = await _context.Gastos
                .Include(g => g.Empleado)
                .Where(g => g.KioscoId == kioscoId && g.CierreTurnoId == null)
                .Where(g => !desde.HasValue || g.Fecha >= desde.Value)
                .Where(g => !hasta.HasValue || g.Fecha < hasta.Value)
                .ToListAsync();

            extracto.AddRange(gastos.Select(g => new MovimientoExtractoDTO
            {
                Id = $"gasto-{g.GastoId}",
                Fecha = g.Fecha,
                Descripcion = !string.IsNullOrWhiteSpace(g.Nombre) ? g.Nombre : g.Descripcion,
                Monto = g.Monto,
                EsIngreso = false,
                Origen = OrigenMovimiento.Gasto,
                EmpleadoNombre = g.Empleado?.Nombre,
                PuedeEliminar = false
            }));

            // ── Movimientos manuales (ya existentes) ─────────────────────────────
            var movimientos = await _context.MovimientosCaja
                .Include(m => m.Empleado)
                .Where(m => m.KioscoId == kioscoId)
                .Where(m => !desde.HasValue || m.Fecha >= desde.Value)
                .Where(m => !hasta.HasValue || m.Fecha < hasta.Value)
                .ToListAsync();

            extracto.AddRange(movimientos.Select(m => new MovimientoExtractoDTO
            {
                Id = $"mov-{m.MovimientoCajaId}",
                Fecha = m.Fecha,
                Descripcion = m.Descripcion,
                Monto = m.Monto,
                EsIngreso = m.Tipo == TipoMovimiento.Ingreso,
                Origen = m.Tipo == TipoMovimiento.Ingreso
                    ? OrigenMovimiento.IngresoManual
                    : OrigenMovimiento.EgresoManual,
                EmpleadoNombre = m.Empleado?.Nombre,
                PuedeEliminar = true,
                MovimientoCajaId = m.MovimientoCajaId
            }));

            return extracto.OrderByDescending(m => m.Fecha).ToList();
        }
    }
}
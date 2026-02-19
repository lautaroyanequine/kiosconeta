using Application.DTOs.Gasto;
using Application.Interfaces.Repository;
using Domain.Entities;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infraestructure.Repository
{
    // ═══════════════════════════════════════════════════
    // GASTO REPOSITORY
    // ═══════════════════════════════════════════════════

    public class GastoRepository : IGastoRepository
    {
        private readonly AppDbContext _context;

        public GastoRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Gasto?> GetByIdAsync(int id)
        {
            return await _context.Gastos
                .Include(g => g.Empleado)
                .Include(g => g.Kiosco)
                .Include(g => g.TipoDeGasto)
                .FirstOrDefaultAsync(g => g.GastoId == id);
        }

        public async Task<IEnumerable<Gasto>> GetAllAsync()
        {
            return await _context.Gastos
                .Include(g => g.Empleado)
                .Include(g => g.Kiosco)
                .Include(g => g.TipoDeGasto)
                .OrderByDescending(g => g.Fecha)
                .ToListAsync();
        }

        public async Task<IEnumerable<Gasto>> GetByKioscoIdAsync(int kioscoId)
        {
            return await _context.Gastos
                .Include(g => g.Empleado)
                .Include(g => g.Kiosco)
                .Include(g => g.TipoDeGasto)
                .Where(g => g.KioscoId == kioscoId)
                .OrderByDescending(g => g.Fecha)
                .ToListAsync();
        }

        public async Task<IEnumerable<Gasto>> GetByEmpleadoIdAsync(int empleadoId)
        {
            return await _context.Gastos
                .Include(g => g.Empleado)
                .Include(g => g.Kiosco)
                .Include(g => g.TipoDeGasto)
                .Where(g => g.EmpleadoId == empleadoId)
                .OrderByDescending(g => g.Fecha)
                .ToListAsync();
        }

        public async Task<IEnumerable<Gasto>> GetByFechaAsync(DateTime fechaDesde, DateTime fechaHasta)
        {
            return await _context.Gastos
                .Include(g => g.Empleado)
                .Include(g => g.Kiosco)
                .Include(g => g.TipoDeGasto)
                .Where(g => g.Fecha >= fechaDesde && g.Fecha <= fechaHasta)
                .OrderByDescending(g => g.Fecha)
                .ToListAsync();
        }

        public async Task<IEnumerable<Gasto>> GetDelDiaAsync(int kioscoId)
        {
            var hoy = DateTime.Today;
            var manana = hoy.AddDays(1);

            return await _context.Gastos
                .Include(g => g.Empleado)
                .Include(g => g.Kiosco)
                .Include(g => g.TipoDeGasto)
                .Where(g => g.KioscoId == kioscoId
                         && g.Fecha >= hoy
                         && g.Fecha < manana)
                .OrderByDescending(g => g.Fecha)
                .ToListAsync();
        }

        public async Task<IEnumerable<Gasto>> GetConFiltrosAsync(int kioscoId, GastoFiltrosDTO filtros)
        {
            var query = _context.Gastos
                .Include(g => g.Empleado)
                .Include(g => g.Kiosco)
                .Include(g => g.TipoDeGasto)
                .Where(g => g.KioscoId == kioscoId);

            if (filtros.FechaDesde.HasValue)
                query = query.Where(g => g.Fecha >= filtros.FechaDesde.Value);

            if (filtros.FechaHasta.HasValue)
                query = query.Where(g => g.Fecha <= filtros.FechaHasta.Value);

            if (filtros.EmpleadoId.HasValue)
                query = query.Where(g => g.EmpleadoId == filtros.EmpleadoId.Value);

            if (filtros.TipoDeGastoId.HasValue)
                query = query.Where(g => g.TipoDeGastoId == filtros.TipoDeGastoId.Value);

            if (filtros.MontoMinimo.HasValue)
                query = query.Where(g => g.Monto >= filtros.MontoMinimo.Value);

            if (filtros.MontoMaximo.HasValue)
                query = query.Where(g => g.Monto <= filtros.MontoMaximo.Value);

            return await query.OrderByDescending(g => g.Fecha).ToListAsync();
        }

        public async Task<Gasto> CreateAsync(Gasto gasto)
        {
            gasto.Fecha = DateTime.Now;
            _context.Gastos.Add(gasto);
            await _context.SaveChangesAsync();
            return await GetByIdAsync(gasto.GastoId)
                ?? throw new Exception("Error al recargar gasto");
        }

        public async Task<Gasto> UpdateAsync(Gasto gasto)
        {
            _context.Gastos.Update(gasto);
            await _context.SaveChangesAsync();
            return await GetByIdAsync(gasto.GastoId)
                ?? throw new Exception("Error al recargar gasto");
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var gasto = await _context.Gastos.FindAsync(id);
            if (gasto == null) return false;

            _context.Gastos.Remove(gasto);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Gastos.AnyAsync(g => g.GastoId == id);
        }

        public async Task<decimal> GetTotalPorTipoAsync(int tipoDeGastoId)
        {
            return await _context.Gastos
                .Where(g => g.TipoDeGastoId == tipoDeGastoId)
                .SumAsync(g => g.Monto);
        }

        public async Task<int> ContarPorTipoAsync(int tipoDeGastoId)
        {
            return await _context.Gastos
                .CountAsync(g => g.TipoDeGastoId == tipoDeGastoId);
        }
    }

    // ═══════════════════════════════════════════════════
    // TIPO DE GASTO REPOSITORY
    // ═══════════════════════════════════════════════════

    public class TipoDeGastoRepository : ITipoDeGastoRepository
    {
        private readonly AppDbContext _context;

        public TipoDeGastoRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<TipoDeGasto?> GetByIdAsync(int id)
        {
            return await _context.TiposDeGasto
                .FirstOrDefaultAsync(t => t.TipoDeGastoId == id);
        }

        public async Task<IEnumerable<TipoDeGasto>> GetAllAsync()
        {
            return await _context.TiposDeGasto
                .OrderBy(t => t.Nombre)
                .ToListAsync();
        }

        public async Task<IEnumerable<TipoDeGasto>> GetActivosAsync()
        {
            return await _context.TiposDeGasto
                .Where(t => t.Activo)
                .OrderBy(t => t.Nombre)
                .ToListAsync();
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.TiposDeGasto
                .AnyAsync(t => t.TipoDeGastoId == id);
        }

        public async Task<bool> ExistsNombreAsync(string nombre)
        {
            return await _context.TiposDeGasto
                .AnyAsync(t => t.Nombre.ToLower() == nombre.ToLower());
        }

        public async Task<TipoDeGasto> CreateAsync(TipoDeGasto tipo)
        {
            tipo.Activo = true;
            _context.TiposDeGasto.Add(tipo);
            await _context.SaveChangesAsync();
            return tipo;
        }

        public async Task<TipoDeGasto> UpdateAsync(TipoDeGasto tipo)
        {
            _context.TiposDeGasto.Update(tipo);
            await _context.SaveChangesAsync();
            return tipo;
        }

        public async Task<bool> ActivarDesactivarAsync(int id, bool activo)
        {
            var tipo = await _context.TiposDeGasto.FindAsync(id);
            if (tipo == null) return false;

            tipo.Activo = activo;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> TieneGastosAsync(int id)
        {
            return await _context.Gastos
                .AnyAsync(g => g.TipoDeGastoId == id);
        }
    }
}
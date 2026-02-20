using Application.Interfaces.Repository;
using Domain.Entities;
using Domain.Enums;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infraestructure.Repository
{
    public class CierreTurnoRepository : ICierreTurnoRepository
    {
        private readonly AppDbContext _context;

        public CierreTurnoRepository(AppDbContext context)
        {
            _context = context;
        }

        // ========== CONSULTAS ==========

        public async Task<CierreTurno?> GetByIdAsync(int id)
        {
            return await _context.CierresTurno
                .Include(ct => ct.Kiosco)
                .Include(ct => ct.cierreTurnoEmpleados)
                    .ThenInclude(cte => cte.Empleado)
                .Include(ct => ct.Ventas)
                .FirstOrDefaultAsync(ct => ct.CierreTurnoId == id);
        }

        public async Task<IEnumerable<CierreTurno>> GetAllAsync()
        {
            return await _context.CierresTurno
                .Include(ct => ct.Kiosco)
                .Include(ct => ct.cierreTurnoEmpleados)
                    .ThenInclude(cte => cte.Empleado)
                .OrderByDescending(ct => ct.Fecha)
                .ToListAsync();
        }

        public async Task<IEnumerable<CierreTurno>> GetByKioscoIdAsync(int kioscoId)
        {
            return await _context.CierresTurno
                .Include(ct => ct.Kiosco)
                .Include(ct => ct.cierreTurnoEmpleados)
                    .ThenInclude(cte => cte.Empleado)
                .Where(ct => ct.KioscoId == kioscoId)
                .OrderByDescending(ct => ct.Fecha)
                .ToListAsync();
        }

        public async Task<CierreTurno?> GetTurnoAbiertoAsync(int kioscoId)
        {
            return await _context.CierresTurno
                .Include(ct => ct.Kiosco)
                .Include(ct => ct.cierreTurnoEmpleados)
                    .ThenInclude(cte => cte.Empleado)
                .Include(ct => ct.Ventas)
                .FirstOrDefaultAsync(ct => ct.KioscoId == kioscoId
                                        && ct.Estado == EstadoCierre.Abierto);
        }

        public async Task<IEnumerable<CierreTurno>> GetPorFechaAsync(int kioscoId, DateTime fechaDesde, DateTime fechaHasta)
        {
            return await _context.CierresTurno
                .Include(ct => ct.Kiosco)
                .Include(ct => ct.cierreTurnoEmpleados)
                    .ThenInclude(cte => cte.Empleado)
                .Where(ct => ct.KioscoId == kioscoId
                          && ct.Fecha >= fechaDesde
                          && ct.Fecha <= fechaHasta)
                .OrderByDescending(ct => ct.Fecha)
                .ToListAsync();
        }

        // ========== COMANDOS ==========

        public async Task<CierreTurno> CreateAsync(CierreTurno cierreTurno)
        {
            _context.CierresTurno.Add(cierreTurno);
            await _context.SaveChangesAsync();
            return await GetByIdAsync(cierreTurno.CierreTurnoId)
                ?? throw new Exception("Error al recargar cierre de turno");
        }

        public async Task<CierreTurno> UpdateAsync(CierreTurno cierreTurno)
        {
            _context.CierresTurno.Update(cierreTurno);
            await _context.SaveChangesAsync();
            return await GetByIdAsync(cierreTurno.CierreTurnoId)
                ?? throw new Exception("Error al recargar cierre de turno");
        }

        // ========== VALIDACIONES ==========

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.CierresTurno
                .AnyAsync(ct => ct.CierreTurnoId == id);
        }

        public async Task<bool> TieneTurnoAbiertoAsync(int kioscoId)
        {
            return await _context.CierresTurno
                .AnyAsync(ct => ct.KioscoId == kioscoId
                             && ct.Estado == EstadoCierre.Abierto);
        }

        // ========== EMPLEADOS ==========

        public async Task AddEmpleadoAsync(int cierreTurnoId, int empleadoId)
        {
            var existe = await _context.CierreTurnoEmpleados
                .AnyAsync(cte => cte.CierreTurnoId == cierreTurnoId
                              && cte.EmpleadoId == empleadoId);

            if (!existe)
            {
                _context.CierreTurnoEmpleados.Add(new CierreTurnoEmpleado
                {
                    CierreTurnoId = cierreTurnoId,
                    EmpleadoId = empleadoId
                });
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<CierreTurnoEmpleado>> GetEmpleadosAsync(int cierreTurnoId)
        {
            return await _context.CierreTurnoEmpleados
                .Include(cte => cte.Empleado)
                .Where(cte => cte.CierreTurnoId == cierreTurnoId)
                .ToListAsync();
        }
    }
}  
using Application.Interfaces.Repository;
using Domain.Entities;
using Infraestructure.Persistence;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repository
{
    public class AuditoriaRepository : IAuditoriaRepository
    {
        private readonly AppDbContext _context;

        public AuditoriaRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task RegistrarAsync(AuditoriaLog log)
        {
            _context.AuditoriaLogs.Add(log);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<AuditoriaLog>> GetByKioscoAsync(
            int kioscoId, DateTime? desde, DateTime? hasta)
        {
            var query = _context.AuditoriaLogs
                .Include(a => a.Empleado)
                .Where(a => a.KioscoId == kioscoId);

            if (desde.HasValue) query = query.Where(a => a.Fecha >= desde.Value);
            if (hasta.HasValue) query = query.Where(a => a.Fecha <= hasta.Value);

            return await query.OrderByDescending(a => a.Fecha).ToListAsync();
        }

        public async Task<IEnumerable<AuditoriaLog>> GetSospechososByKioscoAsync(int kioscoId)
        {
            return await _context.AuditoriaLogs
                .Include(a => a.Empleado)
                .Where(a => a.KioscoId == kioscoId && a.EsSospechoso)
                .OrderByDescending(a => a.Fecha)
                .ToListAsync();
        }

        public async Task<IEnumerable<AuditoriaLog>> GetByEmpleadoAsync(
            int empleadoId, DateTime? desde, DateTime? hasta)
        {
            var query = _context.AuditoriaLogs
                .Include(a => a.Empleado)
                .Where(a => a.EmpleadoId == empleadoId);

            if (desde.HasValue) query = query.Where(a => a.Fecha >= desde.Value);
            if (hasta.HasValue) query = query.Where(a => a.Fecha <= hasta.Value);

            return await query.OrderByDescending(a => a.Fecha).ToListAsync();
        }
    }
}
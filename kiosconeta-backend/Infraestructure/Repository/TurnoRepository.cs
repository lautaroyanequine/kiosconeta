using Application.Interfaces.Repository;
using Domain.Entities;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infraestructure.Repository
{
    public class TurnoRepository : ITurnoRepository
    {
        private readonly AppDbContext _context;

        public TurnoRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Turno>> GetAllAsync()
        {
            return await _context.Turnos
                .OrderBy(t => t.TurnoId)
                .ToListAsync();
        }

        public async Task<Turno?> GetByIdAsync(int id)
        {
            return await _context.Turnos
                .FirstOrDefaultAsync(t => t.TurnoId == id);
        }
    }
}
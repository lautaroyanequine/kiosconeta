using Application.Interfaces.Repository;
using Domain.Entities;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infraestructure.Repository
{
    public class KioscoRepository : IKioscoRepository
    {
        private readonly AppDbContext _context;

        public KioscoRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Kiosco?> GetByIdAsync(int kioscoId)
        {
            return await _context.Kioscos
                .FirstOrDefaultAsync(k => k.KioscoID == kioscoId);
        }

        public async Task<Kiosco> UpdateAsync(int kioscoId, string nombre, string? direccion)
        {
            var kiosco = await _context.Kioscos.FindAsync(kioscoId)
                ?? throw new KeyNotFoundException($"Kiosco con ID {kioscoId} no encontrado");

            kiosco.Nombre = nombre.Trim();
            kiosco.Direccion = direccion?.Trim();

            await _context.SaveChangesAsync();
            return kiosco;
        }
    }
}
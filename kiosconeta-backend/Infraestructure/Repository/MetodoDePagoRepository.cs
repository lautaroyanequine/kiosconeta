using Application.Interfaces.Repository;
using Domain.Entities;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infraestructure.Repository
{
    public class MetodoDePagoRepository : IMetodoDePagoRepository
    {
        private readonly AppDbContext _context;

        public MetodoDePagoRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<MetodoDePago?> GetByIdAsync(int id)
        {
            return await _context.MetodosDePago
                .FirstOrDefaultAsync(m => m.MetodoDePagoID == id);
        }

        public async Task<IEnumerable<MetodoDePago>> GetAllAsync()
        {
            return await _context.MetodosDePago
                .OrderBy(m => m.Nombre)
                .ToListAsync();
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.MetodosDePago
                .AnyAsync(m => m.MetodoDePagoID == id);
        }

        public async Task<bool> ExistsNombreAsync(string nombre)
        {
            return await _context.MetodosDePago
                .AnyAsync(m => m.Nombre.ToLower() == nombre.ToLower());
        }

        public async Task<MetodoDePago> CreateAsync(MetodoDePago metodoDePago)
        {
            _context.MetodosDePago.Add(metodoDePago);
            await _context.SaveChangesAsync();
            return metodoDePago;
        }

        public async Task<MetodoDePago> UpdateAsync(MetodoDePago metodoDePago)
        {
            _context.MetodosDePago.Update(metodoDePago);
            await _context.SaveChangesAsync();
            return metodoDePago;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var metodo = await _context.MetodosDePago.FindAsync(id);
            if (metodo == null) return false;

            _context.MetodosDePago.Remove(metodo);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> TieneVentasAsync(int id)
        {
            return await _context.Ventas
                .AnyAsync(v => v.MetodoPagoId == id);
        }

        public async Task<int> ContarVentasAsync(int id)
        {
            return await _context.Ventas
                .CountAsync(v => v.MetodoPagoId == id);
        }
    }
}
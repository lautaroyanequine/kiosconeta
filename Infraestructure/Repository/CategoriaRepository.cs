using Application.Interfaces.Repository;
using Domain.Entities;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infraestructure.Repository
{
    public class CategoriaRepository : ICategoriaRepository
    {
        private readonly AppDbContext _context;

        public CategoriaRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Categoria?> GetByIdAsync(int id)
        {
            return await _context.Categorias
                .FirstOrDefaultAsync(c => c.CategoriaID == id);
        }

        public async Task<IEnumerable<Categoria>> GetAllAsync()
        {
            return await _context.Categorias
                .OrderBy(c => c.Nombre)
                .ToListAsync();
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Categorias
                .AnyAsync(c => c.CategoriaID == id);
        }

        public async Task<bool> ExistsNombreAsync(string nombre)
        {
            return await _context.Categorias
                .AnyAsync(c => c.Nombre.ToLower() == nombre.ToLower());
        }

        public async Task<Categoria> CreateAsync(Categoria categoria)
        {
            _context.Categorias.Add(categoria);
            await _context.SaveChangesAsync();
            return categoria;
        }

        public async Task<Categoria> UpdateAsync(Categoria categoria)
        {
            _context.Categorias.Update(categoria);
            await _context.SaveChangesAsync();
            return categoria;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var categoria = await _context.Categorias.FindAsync(id);
            if (categoria == null) return false;

            _context.Categorias.Remove(categoria);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> TieneProductosAsync(int id)
        {
            return await _context.Productos
                .AnyAsync(p => p.CategoriaId == id && p.Activo);
        }

        public async Task<int> ContarProductosAsync(int id)
        {
            return await _context.Productos
                .CountAsync(p => p.CategoriaId == id && p.Activo);
        }
    }
}
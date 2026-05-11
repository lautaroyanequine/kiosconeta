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

        // =========================
        // GET BY ID
        // =========================
        public async Task<Categoria?> GetByIdAsync(int id)
        {
            return await _context.Categorias
                .FirstOrDefaultAsync(c => c.CategoriaID == id);
        }

        // =========================
        // GET BY ID + KIOSCO
        // =========================
        public async Task<Categoria?> GetByIdAndKioscoAsync(int categoriaId, int kioscoId)
        {
            return await _context.Categorias
                .FirstOrDefaultAsync(c =>
                    c.CategoriaID == categoriaId &&
                    c.KioscoId == kioscoId
                );
        }

        // =========================
        // GET ALL
        // =========================
        public async Task<IEnumerable<Categoria>> GetAllAsync()
        {
            return await _context.Categorias
                .OrderBy(c => c.Nombre)
                .ToListAsync();
        }

        // =========================
        // GET ALL BY KIOSCO
        // =========================
        public async Task<IEnumerable<Categoria>> GetAllByKioscoAsync(int kioscoId)
        {
            return await _context.Categorias
                .Where(c => c.KioscoId == kioscoId)
                .OrderBy(c => c.Nombre)
                .ToListAsync();
        }

        // =========================
        // EXISTS
        // =========================
        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Categorias
                .AnyAsync(c => c.CategoriaID == id);
        }

        // =========================
        // EXISTS BY KIOSCO
        // =========================
        public async Task<bool> ExistsByKioscoAsync(int categoriaId, int kioscoId)
        {
            return await _context.Categorias
                .AnyAsync(c =>
                    c.CategoriaID == categoriaId &&
                    c.KioscoId == kioscoId
                );
        }

        // =========================
        // EXISTS NOMBRE
        // =========================
        public async Task<bool> ExistsNombreAsync(string nombre)
        {
            return await _context.Categorias
                .AnyAsync(c => c.Nombre.ToLower() == nombre.ToLower());
        }

        // =========================
        // EXISTS NOMBRE + KIOSCO
        // =========================
        public async Task<bool> ExistsNombreByKioscoAsync(string nombre, int kioscoId)
        {
            return await _context.Categorias
                .AnyAsync(c =>
                    c.KioscoId == kioscoId &&
                    c.Nombre.ToLower() == nombre.ToLower()
                );
        }

        // =========================
        // CREATE
        // =========================
        public async Task<Categoria> CreateAsync(Categoria categoria)
        {
            // ============================================
            // VALIDAR QUE EL KIOSCO EXISTA
            // ============================================
            var kioscoExiste = await _context.Kioscos
                .AnyAsync(k => k.KioscoID == categoria.KioscoId);

            if (!kioscoExiste)
            {
                throw new Exception("El kiosco no existe");
            }

            // ============================================
            // CREAR CATEGORÍA
            // ============================================
            _context.Categorias.Add(categoria);

            await _context.SaveChangesAsync();

            return categoria;
        }

        // =========================
        // UPDATE
        // =========================
        public async Task<Categoria> UpdateAsync(Categoria categoria)
        {
            _context.Categorias.Update(categoria);

            await _context.SaveChangesAsync();

            return categoria;
        }

        // =========================
        // DELETE
        // =========================
        public async Task<bool> DeleteAsync(int id)
        {
            var categoria = await _context.Categorias.FindAsync(id);

            if (categoria == null)
                return false;

            _context.Categorias.Remove(categoria);

            await _context.SaveChangesAsync();

            return true;
        }

        // =========================
        // TIENE PRODUCTOS
        // =========================
        public async Task<bool> TieneProductosAsync(int id)
        {
            return await _context.Productos
                .AnyAsync(p =>
                    p.CategoriaId == id &&
                    p.Activo
                );
        }

        // =========================
        // CONTAR PRODUCTOS
        // =========================
        public async Task<int> ContarProductosAsync(int id)
        {
            return await _context.Productos
                .CountAsync(p =>
                    p.CategoriaId == id &&
                    p.Activo
                );
        }
    }
}
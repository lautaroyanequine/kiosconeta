using Application.Interfaces.Repository;
using Domain.Entities;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infraestructure.Repository
{
    /// <summary>
    /// Implementación del repositorio de Productos
    /// Maneja todas las operaciones de base de datos
    /// </summary>
    public class ProductoRepository : IProductoRepository
    {
        private readonly AppDbContext _context;

        public ProductoRepository(AppDbContext context)
        {
            _context = context;
        }

        // ========== QUERIES - CONSULTAS ==========

        public async Task<Producto?> GetByIdAsync(int id)
        {
            return await _context.Productos
                .Include(p => p.Categoria)
                .Include(p => p.Kiosco)
                .FirstOrDefaultAsync(p => p.ProductoId == id);
        }

        public async Task<IEnumerable<Producto>> GetAllAsync()
        {
            return await _context.Productos
                .Include(p => p.Categoria)
                .Include(p => p.Kiosco)
                .OrderBy(p => p.Nombre)
                .ToListAsync();
        }

        public async Task<IEnumerable<Producto>> GetByKioscoIdAsync(int kioscoId)
        {
            return await _context.Productos
                .Include(p => p.Categoria)
                .Where(p => p.KioscoId == kioscoId)
                .OrderBy(p => p.Nombre)
                .ToListAsync();
        }

        public async Task<IEnumerable<Producto>> GetActivosAsync(int kioscoId)
        {
            return await _context.Productos
                .Include(p => p.Categoria)
                .Where(p => p.KioscoId == kioscoId && p.Activo)
                .OrderBy(p => p.Nombre)
                .ToListAsync();
        }

        public async Task<IEnumerable<Producto>> GetByCategoriaAsync(int categoriaId)
        {
            return await _context.Productos
                .Include(p => p.Categoria)
                .Where(p => p.CategoriaId == categoriaId && p.Activo)
                .OrderBy(p => p.Nombre)
                .ToListAsync();
        }

        public async Task<IEnumerable<Producto>> GetBajoStockAsync(int kioscoId)
        {
            return await _context.Productos
                .Include(p => p.Categoria)
                .Where(p => p.KioscoId == kioscoId
                         && p.Activo
                         && p.StockActual <= p.StockMinimo)
                .OrderBy(p => p.StockActual)
                .ToListAsync();
        }

        public async Task<IEnumerable<Producto>> GetProximosAVencerAsync(int kioscoId, int dias = 7)
        {
            var fechaLimite = DateTime.Now.AddDays(dias);

            return await _context.Productos
                .Include(p => p.Categoria)
                .Where(p => p.KioscoId == kioscoId
                         && p.Activo
                         && p.FechaVencimiento != null
                         && p.FechaVencimiento <= fechaLimite
                         && p.FechaVencimiento >= DateTime.Now)
                .OrderBy(p => p.FechaVencimiento)
                .ToListAsync();
        }

        public async Task<Producto?> GetByCodigoBarraAsync(string codigoBarra)
        {
            return await _context.Productos
                .Include(p => p.Categoria)
                .FirstOrDefaultAsync(p => p.CodigoBarra == codigoBarra && p.Activo);
        }

        public async Task<IEnumerable<Producto>> SearchAsync(string searchTerm, int kioscoId)
        {
            searchTerm = searchTerm.ToLower();

            return await _context.Productos
                .Include(p => p.Categoria)
                .Where(p => p.KioscoId == kioscoId
                         && p.Activo
                         && (p.Nombre.ToLower().Contains(searchTerm)
                             || (p.CodigoBarra != null && p.CodigoBarra.Contains(searchTerm))
                             || (p.Descripcion != null && p.Descripcion.ToLower().Contains(searchTerm))))
                .OrderBy(p => p.Nombre)
                .ToListAsync();
        }

        // ========== COMMANDS - MODIFICACIONES ==========

        public async Task<Producto> CreateAsync(Producto producto)
        {
            producto.FechaCreacion = DateTime.Now;
            producto.Activo = true;

            _context.Productos.Add(producto);
            await _context.SaveChangesAsync();

            return producto;
        }

        public async Task<Producto> UpdateAsync(Producto producto)
        {
            producto.FechaModificacion = DateTime.Now;

            _context.Productos.Update(producto);
            await _context.SaveChangesAsync();

            return producto;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto == null) return false;

            // Soft delete - solo desactivamos
            producto.Activo = false;
            producto.FechaModificacion = DateTime.Now;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ActivarDesactivarAsync(int id, bool activo)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto == null) return false;

            producto.Activo = activo;
            producto.FechaModificacion = DateTime.Now;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ActualizarStockAsync(int id, int cantidad)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto == null) return false;

            producto.StockActual += cantidad;
            producto.FechaModificacion = DateTime.Now;

            await _context.SaveChangesAsync();
            return true;
        }

        // ========== VALIDACIONES ==========

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Productos.AnyAsync(p => p.ProductoId == id);
        }

        public async Task<bool> ExistsCodigoBarraAsync(string codigoBarra)
        {
            return await _context.Productos
                .AnyAsync(p => p.CodigoBarra == codigoBarra && p.Activo);
        }
    }
}
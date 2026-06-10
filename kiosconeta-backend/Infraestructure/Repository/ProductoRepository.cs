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

        public async Task<Producto?> GetByIdAsync(int id, int kioscoId)
        {
            return await _context.Productos
                .Include(p => p.Categoria)
                .Include(p => p.Kiosco)
                .FirstOrDefaultAsync(p => p.ProductoId == id && p.KioscoId == kioscoId);
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
        public async Task<List<Producto>> GetByIdsAsync(List<int> ids)
        {
            return await _context.Productos
                .Where(p => ids.Contains(p.ProductoId))
                .ToListAsync();
        }

        public async Task<IEnumerable<Producto>> GetSinStockAsync(int kioscoId)
        {
            return await _context.Productos
                .Include(p => p.Categoria) // Por si necesitás el nombre de la categoría en el DTO
                .Where(p => p.KioscoId == kioscoId && p.StockActual <= 0 && p.Activo)
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
            var fechaLimite = DateTime.UtcNow.AddDays(dias);

            return await _context.Productos
                .Include(p => p.Categoria)
                .Where(p => p.KioscoId == kioscoId
                         && p.Activo
                         && p.FechaVencimiento != null
                         && p.FechaVencimiento <= fechaLimite
                         && p.FechaVencimiento >= DateTime.UtcNow)
                .OrderBy(p => p.FechaVencimiento)
                .ToListAsync();
        }

        public async Task<Producto?> GetByCodigoBarraAsync(string codigoBarra ,int kioscoId )
        {

            return await _context.Productos
                .Include(p => p.Categoria)
                .FirstOrDefaultAsync(p =>
                    p.CodigoBarra == codigoBarra &&
                    p.KioscoId == kioscoId &&
                    p.Activo);

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
            producto.FechaCreacion = DateTime.UtcNow;
            producto.Activo = true;

            _context.Productos.Add(producto);
            await _context.SaveChangesAsync();

            return producto;
        }

        public async Task<Producto> UpdateAsync(Producto producto)
        {
            producto.FechaModificacion = DateTime.UtcNow;

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
            producto.FechaModificacion = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ActivarDesactivarAsync(int id, bool activo)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto == null) return false;

            producto.Activo = activo;
            producto.FechaModificacion = DateTime.UtcNow;
           
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ActualizarStockAsync(int id, int cantidad)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto == null) return false;

            producto.StockActual += cantidad;
            producto.FechaModificacion = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        // ========== VALIDACIONES ==========

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Productos.AnyAsync(p => p.ProductoId == id);
        }

        public async Task<bool> ExistsCodigoBarraAsync(string codigoBarra, int kioscoId)
        {
    
            return await _context.Productos
                .AnyAsync(p => p.CodigoBarra == codigoBarra && p.Activo && p.KioscoId == kioscoId);
        }
        public async Task<(IEnumerable<Producto> Items, int Total)> GetByKioscoIdPaginadoAsync(
     int kioscoId,
     int pagina,
     int tamanoPagina,
     string? busqueda = null,
     int? categoriaId = null,
     bool? soloStockBajo = null,
     bool soloActivos = true)
        {
            var query = _context.Productos
                .Include(p => p.Categoria)
                .Where(p => p.KioscoId == kioscoId)
                .AsQueryable();

            if (soloActivos)
                query = query.Where(p => p.Activo);

            if (!string.IsNullOrWhiteSpace(busqueda))
            {
                var b = busqueda.ToLower();
                query = query.Where(p =>
                    p.Nombre.ToLower().Contains(b) ||
                    (p.CodigoBarra != null && p.CodigoBarra.Contains(b)));
            }

            if (categoriaId.HasValue)
                query = query.Where(p => p.CategoriaId == categoriaId.Value);

            if (soloStockBajo == true)
                query = query.Where(p => p.StockActual <= p.StockMinimo);

            var total = await query.CountAsync();

            var items = await query
                .OrderBy(p => p.Nombre)
                .Skip((pagina - 1) * tamanoPagina)
                .Take(tamanoPagina)
                .ToListAsync();

            return (items, total);
        }
        public async Task<IEnumerable<Producto>> GetSinMovimientoAsync(int kioscoId, int dias)
        {
            var fechaLimite = DateTime.UtcNow.AddDays(-dias);

            // Obtener IDs de productos que SÍ tuvieron ventas en los últimos X días
            var productosConMovimiento = await _context.ProductosVenta
                .Where(pv => pv.Venta.Empleado.KioscoID == kioscoId
                          && !pv.Venta.Anulada
                          && pv.Venta.Fecha >= fechaLimite)
                .Select(pv => pv.ProductoId)
                .Distinct()
                .ToListAsync();

            // Devolver productos activos que NO están en esa lista
            return await _context.Productos
                .Include(p => p.Categoria)
                .Where(p => p.KioscoId == kioscoId
                         && p.Activo
                         && !productosConMovimiento.Contains(p.ProductoId))
                .OrderBy(p => p.Nombre)
                .ToListAsync();
        }
    }
}
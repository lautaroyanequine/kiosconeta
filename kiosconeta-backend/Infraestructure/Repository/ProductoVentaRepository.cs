using Application.Interfaces.Repository;
using Domain.Entities;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories
{
    public class ProductoVentaRepository : IProductoVentaRepository
    {
        private readonly AppDbContext _context;

        public ProductoVentaRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ProductoVenta>> GetByKioscoYFechaAsync(int kioscoId, DateTime desde)
        {
            return await _context.ProductosVenta
                .Include(pv => pv.Producto)
                    .ThenInclude(p => p.Categoria)
                .Include(pv => pv.Venta)
                    .ThenInclude(v => v.Empleado)
                .Where(pv => pv.Venta.Empleado.KioscoID == kioscoId
                          && !pv.Venta.Anulada
                          && pv.Venta.Fecha >= desde)
                .ToListAsync();
        }

        public async Task<List<ProductoVenta>> GetByKioscoYFechaAsync(int kioscoId, DateTime desde, DateTime hasta)
        {
            return await _context.ProductosVenta
                .Include(pv => pv.Producto)
                    .ThenInclude(p => p.Categoria)
                .Include(pv => pv.Venta)
                    .ThenInclude(v => v.Empleado)
                .Where(pv => pv.Venta.Empleado.KioscoID == kioscoId
                          && !pv.Venta.Anulada
                          && pv.Venta.Fecha >= desde
                          && pv.Venta.Fecha <= hasta)
                .ToListAsync();
        }

        public async Task<List<ProductoVenta>> GetUltimos30DiasAsync(int kioscoId)
        {
            var hace30Dias = DateTime.UtcNow.AddDays(-30);

            return await _context.ProductosVenta
                .Include(pv => pv.Producto)
                .Include(pv => pv.Venta)
                    .ThenInclude(v => v.Empleado)
                .Where(pv => pv.Venta.Empleado.KioscoID == kioscoId
                          && !pv.Venta.Anulada
                          && pv.Venta.Fecha >= hace30Dias)
                .ToListAsync();
        }

        public async Task<IEnumerable<ProductoVenta>> GetByKioscoYPeriodoAsync(int kioscoId, DateTime desde, DateTime hasta)
        {
            return await _context.ProductosVenta
                .Include(pv => pv.Producto).ThenInclude(p => p.Categoria)
                .Include(pv => pv.Venta).ThenInclude(v => v.CierreTurno)
                .Where(pv =>
                    pv.Venta.CierreTurno.KioscoId == kioscoId &&
                    !pv.Venta.Anulada &&
                    pv.Venta.Fecha >= desde &&
                    pv.Venta.Fecha <= hasta)
                .ToListAsync();
        }


        public IQueryable<ProductoVenta> GetQueryableVentasPorKiosco(int kioscoId, DateTime desde, DateTime hasta)
        {
            return _context.ProductosVenta
                .Include(pv => pv.Producto).ThenInclude(p => p.Categoria)
                .Include(pv => pv.Venta)
                .Where(pv => pv.Venta.CierreTurno.KioscoId == kioscoId
                          && !pv.Venta.Anulada
                          && pv.Venta.Fecha >= desde
                          && pv.Venta.Fecha <= hasta);
        }
    }
}

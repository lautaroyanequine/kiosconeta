using Application.DTOs.Venta;
using Application.Interfaces.Repository;
using Domain.Entities;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infraestructure.Repository
{
    public class VentaRepository : IVentaRepository
    {
        private readonly AppDbContext _context;

        public VentaRepository(AppDbContext context)
        {
            _context = context;
        }

        // ========== CONSULTAS ==========

        public async Task<Venta?> GetByIdAsync(int id)
        {
            return await _context.Ventas
                .Include(v => v.Empleado)
                .Include(v => v.MetodoPago)
                .Include(v => v.Turno)
                .Include(v => v.ProductoVentas)
                    .ThenInclude(pv => pv.Producto)
                .FirstOrDefaultAsync(v => v.VentaId == id);
        }

        public async Task<IEnumerable<Venta>> GetAllAsync()
        {
            return await _context.Ventas
                .Include(v => v.Empleado)
                .Include(v => v.MetodoPago)
                .Include(v => v.Turno)
                .Include(v => v.ProductoVentas)
                    .ThenInclude(pv => pv.Producto)
                .OrderByDescending(v => v.Fecha)
                .ToListAsync();
        }

        public async Task<IEnumerable<Venta>> GetByKioscoIdAsync(int kioscoId)
        {
            return await _context.Ventas
                .Include(v => v.Empleado)
                .Include(v => v.MetodoPago)
                .Include(v => v.Turno)
                .Include(v => v.ProductoVentas)
                    .ThenInclude(pv => pv.Producto)
                .Where(v => v.Empleado.KioscoID == kioscoId)
                .OrderByDescending(v => v.Fecha)
                .ToListAsync();
        }

        public async Task<IEnumerable<Venta>> GetByEmpleadoIdAsync(int empleadoId)
        {
            return await _context.Ventas
                .Include(v => v.Empleado)
                .Include(v => v.MetodoPago)
                .Include(v => v.Turno)
                .Include(v => v.ProductoVentas)
                    .ThenInclude(pv => pv.Producto)
                .Where(v => v.EmpleadoId == empleadoId)
                .OrderByDescending(v => v.Fecha)
                .ToListAsync();
        }

        public async Task<IEnumerable<Venta>> GetByFechaAsync(DateTime fechaDesde, DateTime fechaHasta)
        {
            return await _context.Ventas
                .Include(v => v.Empleado)
                .Include(v => v.MetodoPago)
                .Include(v => v.Turno)
                .Include(v => v.ProductoVentas)
                    .ThenInclude(pv => pv.Producto)
                .Where(v => v.Fecha >= fechaDesde && v.Fecha <= fechaHasta)
                .OrderByDescending(v => v.Fecha)
                .ToListAsync();
        }

        public async Task<IEnumerable<Venta>> GetVentasDelDiaAsync(int kioscoId)
        {
            var hoy = DateTime.Today;
            var manana = hoy.AddDays(1);

            return await _context.Ventas
                .Include(v => v.Empleado)
                .Include(v => v.MetodoPago)
                .Include(v => v.Turno)
                .Include(v => v.ProductoVentas)
                    .ThenInclude(pv => pv.Producto)
                .Where(v => v.Empleado.KioscoID == kioscoId
                         && v.Fecha >= hoy
                         && v.Fecha < manana)
                .OrderByDescending(v => v.Fecha)
                .ToListAsync();
        }

        public async Task<IEnumerable<Venta>> GetConFiltrosAsync(int kioscoId, VentaFiltrosDTO filtros)
        {
            var query = _context.Ventas
                .Include(v => v.Empleado)
                .Include(v => v.MetodoPago)
                .Include(v => v.Turno)
                .Include(v => v.ProductoVentas)
                    .ThenInclude(pv => pv.Producto)
                .Where(v => v.Empleado.KioscoID == kioscoId);

            if (filtros.FechaDesde.HasValue)
                query = query.Where(v => v.Fecha >= filtros.FechaDesde.Value);

            if (filtros.FechaHasta.HasValue)
                query = query.Where(v => v.Fecha <= filtros.FechaHasta.Value);

            if (filtros.EmpleadoId.HasValue)
                query = query.Where(v => v.EmpleadoId == filtros.EmpleadoId.Value);

            if (filtros.MetodoPagoId.HasValue)
                query = query.Where(v => v.MetodoPagoId == filtros.MetodoPagoId.Value);

            if (filtros.TurnoId.HasValue)
                query = query.Where(v => v.TurnoId == filtros.TurnoId.Value);

            if (filtros.SoloAnuladas.HasValue)
                query = query.Where(v => v.Anulada == filtros.SoloAnuladas.Value);

            return await query.OrderByDescending(v => v.Fecha).ToListAsync();
        }

        // ========== COMANDOS ==========

        public async Task<Venta> CreateAsync(Venta venta)
        {
            // Usar transacción para asegurar atomicidad
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1. Crear la venta
                venta.Fecha = DateTime.Now;
                venta.Anulada = false;
                _context.Ventas.Add(venta);
                await _context.SaveChangesAsync();

                // 2. Descontar stock de cada producto
                foreach (var productoVenta in venta.ProductoVentas)
                {
                    var producto = await _context.Productos.FindAsync(productoVenta.ProductoId);
                    if (producto != null)
                    {
                        producto.StockActual -= productoVenta.Cantidad;
                        _context.Productos.Update(producto);
                    }
                }
                await _context.SaveChangesAsync();

                // 3. Commit de la transacción
                await transaction.CommitAsync();

                // 4. Recargar con relaciones
                return await GetByIdAsync(venta.VentaId)
                    ?? throw new Exception("Error al recargar la venta");
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> AnularVentaAsync(int ventaId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var venta = await GetByIdAsync(ventaId);
                if (venta == null || venta.Anulada)
                    return false;

                // 1. Marcar como anulada
                venta.Anulada = true;
                _context.Ventas.Update(venta);

                // 2. Devolver stock de cada producto
                foreach (var productoVenta in venta.ProductoVentas)
                {
                    var producto = await _context.Productos.FindAsync(productoVenta.ProductoId);
                    if (producto != null)
                    {
                        producto.StockActual += productoVenta.Cantidad;
                        _context.Productos.Update(producto);
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // ========== VALIDACIONES ==========

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Ventas.AnyAsync(v => v.VentaId == id);
        }

        public async Task<int> GetSiguienteNumeroVentaAsync(int kioscoId)
        {
            var ultimoNumero = await _context.Ventas
                .Where(v => v.Empleado.KioscoID == kioscoId)
                .MaxAsync(v => (int?)v.NumeroVenta) ?? 0;

            return ultimoNumero + 1;
        }

        public async Task<IEnumerable<ProductoVenta>> GetProductosVentaAsync(int ventaId)
        {
            return await _context.ProductosVenta
                .Include(pv => pv.Producto)
                .Where(pv => pv.VentaId == ventaId)
                .ToListAsync();
        }
    }
}
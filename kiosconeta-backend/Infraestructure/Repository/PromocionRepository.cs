using Application.Interfaces.Repository;
using Domain.Entities;
using Domain.Enums;
using Infraestructure.Persistence;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

public class PromocionRepository : IPromocionRepository
{
    private readonly AppDbContext _context;
    public PromocionRepository(AppDbContext context) => _context = context;

    public async Task<IEnumerable<Promocion>> GetByKioscoAsync(int kioscoId) =>
        await _context.Promociones
            .Include(p => p.PromocionProductos).ThenInclude(pp => pp.Producto)
            .Include(p => p.ProductoCantidad)
            .Include(p => p.ProductoPorcentaje)
            .Include(p => p.CategoriaPorcentaje)
            .Where(p => p.KioscoId == kioscoId)
            .OrderBy(p => p.Nombre)
            .ToListAsync();

    public async Task<IEnumerable<Promocion>> GetActivasByKioscoAsync(int kioscoId)
    {
        var hoy = DateTime.Now;
        return await _context.Promociones
            .Include(p => p.PromocionProductos).ThenInclude(pp => pp.Producto)
                .ThenInclude(prod => prod.Categoria)
            .Include(p => p.ProductoCantidad)
            .Include(p => p.ProductoPorcentaje)
            .Include(p => p.CategoriaPorcentaje)
            .Where(p => p.KioscoId == kioscoId
                     && p.Activa
                     && (p.FechaDesde == null || p.FechaDesde <= hoy)
                     && (p.FechaHasta == null || p.FechaHasta >= hoy))
            .ToListAsync();
    }

    public async Task<Promocion?> GetByIdAsync(int id) =>
        await _context.Promociones
            .Include(p => p.PromocionProductos).ThenInclude(pp => pp.Producto)
            .FirstOrDefaultAsync(p => p.PromocionId == id);

    public async Task<Promocion> CreateAsync(Promocion promocion)
    {
        _context.Promociones.Add(promocion);
        await _context.SaveChangesAsync();
        return await GetByIdAsync(promocion.PromocionId)!;
    }

    public async Task<Promocion> UpdateAsync(Promocion promocion)
    {
        // Eliminar productos anteriores y reemplazar
        var productosAnteriores = await _context.PromocionProductos
            .Where(pp => pp.PromocionId == promocion.PromocionId)
            .ToListAsync();
        _context.PromocionProductos.RemoveRange(productosAnteriores);
        _context.Promociones.Update(promocion);
        await _context.SaveChangesAsync();
        return await GetByIdAsync(promocion.PromocionId)!;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var promo = await _context.Promociones.FindAsync(id);
        if (promo == null) return false;
        _context.Promociones.Remove(promo);
        await _context.SaveChangesAsync();
        return true;
    }
}
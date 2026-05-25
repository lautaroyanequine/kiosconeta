using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;

public class DistribuidorRepository : IDistribuidorRepository
{
    private readonly AppDbContext _context;
    public DistribuidorRepository(AppDbContext context) => _context = context;

    public async Task<IEnumerable<Distribuidor>> GetByKioscoAsync(int kioscoId) =>
        await _context.Distribuidores
            .Include(d => d.Productos)
            .Where(d => d.KioscoId == kioscoId)
            .OrderBy(d => d.Nombre)
            .ToListAsync();

    public async Task<Distribuidor?> GetByIdAsync(int id) =>
        await _context.Distribuidores
            .Include(d => d.Productos)
            .FirstOrDefaultAsync(d => d.DistribuidorId == id);

    public async Task<Distribuidor> CreateAsync(Distribuidor d)
    {
        _context.Distribuidores.Add(d);
        await _context.SaveChangesAsync();
        return d;
    }

    public async Task<Distribuidor> UpdateAsync(Distribuidor d)
    {
        _context.Distribuidores.Update(d);
        await _context.SaveChangesAsync();
        return d;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var d = await _context.Distribuidores.FindAsync(id);
        if (d == null) return false;
        // No eliminar si tiene productos asociados
        var tieneProductos = await _context.Productos
            .AnyAsync(p => p.DistribuidorId == id);
        if (tieneProductos)
            throw new InvalidOperationException(
                "No se puede eliminar un distribuidor con productos asociados. Desactivalo en su lugar.");
        _context.Distribuidores.Remove(d);
        await _context.SaveChangesAsync();
        return true;
    }
}
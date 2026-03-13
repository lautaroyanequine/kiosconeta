using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;

public class NumeradorRepository : INumeradorRepository
{
    private readonly AppDbContext _context;

    public NumeradorRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<int> GenerarNumeroVentaAsync(int kioscoId)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();

        var numerador = await _context.NumeradorVentas
            .FirstOrDefaultAsync(n => n.KioscoId == kioscoId);

        if (numerador == null)
        {
            numerador = new NumeradorVenta
            {
                KioscoId = kioscoId,
                UltimoNumero = 1,
                UltimaActualizacion = DateTime.Now
            };

            _context.NumeradorVentas.Add(numerador);
        }
        else
        {
            numerador.UltimoNumero++;
            numerador.UltimaActualizacion = DateTime.Now;
        }

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return numerador.UltimoNumero;
    }
}
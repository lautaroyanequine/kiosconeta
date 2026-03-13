public interface INumeradorRepository
{
    Task<int> GenerarNumeroVentaAsync(int kioscoId);
}
using Application.DTOs.Gasto;
using Domain.Entities;

namespace Application.Interfaces.Repository
{
    // ═══════════════════════════════════════════════════
    // GASTO REPOSITORY
    // ═══════════════════════════════════════════════════

    public interface IGastoRepository
    {
        // Consultas
        Task<Gasto?> GetByIdAsync(int id);
        Task<IEnumerable<Gasto>> GetAllAsync();
        Task<IEnumerable<Gasto>> GetByKioscoIdAsync(int kioscoId);
        Task<IEnumerable<Gasto>> GetByEmpleadoIdAsync(int empleadoId);
        Task<IEnumerable<Gasto>> GetByFechaAsync(DateTime fechaDesde, DateTime fechaHasta);
        Task<IEnumerable<Gasto>> GetDelDiaAsync(int kioscoId);
        Task<IEnumerable<Gasto>> GetConFiltrosAsync(int kioscoId, GastoFiltrosDTO filtros);

        // Comandos
        Task<Gasto> CreateAsync(Gasto gasto);
        Task<Gasto> UpdateAsync(Gasto gasto);
        Task<bool> DeleteAsync(int id);

        // Validaciones
        Task<bool> ExistsAsync(int id);

        // Estadísticas
        Task<decimal> GetTotalPorTipoAsync(int tipoDeGastoId);
        Task<int> ContarPorTipoAsync(int tipoDeGastoId);
    }

    // ═══════════════════════════════════════════════════
    // TIPO DE GASTO REPOSITORY
    // ═══════════════════════════════════════════════════

    public interface ITipoDeGastoRepository
    {
        // Consultas
        Task<TipoDeGasto?> GetByIdAsync(int id);
        Task<IEnumerable<TipoDeGasto>> GetAllAsync();
        Task<IEnumerable<TipoDeGasto>> GetActivosAsync();
        Task<bool> ExistsAsync(int id);
        Task<bool> ExistsNombreAsync(string nombre);

        // Comandos
        Task<TipoDeGasto> CreateAsync(TipoDeGasto tipo);
        Task<TipoDeGasto> UpdateAsync(TipoDeGasto tipo);
        Task<bool> ActivarDesactivarAsync(int id, bool activo);

        // Validaciones
        Task<bool> TieneGastosAsync(int id);
    }
}
using Application.DTOs.Gasto;

namespace Application.Interfaces.Services
{
    // ═══════════════════════════════════════════════════
    // GASTO SERVICE
    // ═══════════════════════════════════════════════════

    public interface IGastoService
    {
        // Consultas
        Task<GastoResponseDTO?> GetByIdAsync(int id);
        Task<IEnumerable<GastoResponseDTO>> GetAllAsync();
        Task<IEnumerable<GastoResponseDTO>> GetByKioscoIdAsync(int kioscoId);
        Task<IEnumerable<GastoResponseDTO>> GetByEmpleadoIdAsync(int empleadoId);
        Task<IEnumerable<GastoResponseDTO>> GetByFechaAsync(DateTime fechaDesde, DateTime fechaHasta);
        Task<IEnumerable<GastoResponseDTO>> GetDelDiaAsync(int kioscoId);
        Task<IEnumerable<GastoResponseDTO>> GetConFiltrosAsync(int kioscoId, GastoFiltrosDTO filtros);
        Task<IEnumerable<GastoResponseDTO>> GetByCierreTurnoIdAsync(int cierreTurnoId);

        // Comandos
        Task<GastoResponseDTO> CreateAsync(CreateGastoDTO dto);
        Task<GastoResponseDTO> UpdateAsync(UpdateGastoDTO dto);
        Task<bool> DeleteAsync(int id);
    }

    // ═══════════════════════════════════════════════════
    // TIPO DE GASTO SERVICE
    // ═══════════════════════════════════════════════════

    public interface ITipoDeGastoService
    {
        // Consultas
        Task<TipoDeGastoResponseDTO?> GetByIdAsync(int id);
        Task<IEnumerable<TipoDeGastoResponseDTO>> GetAllAsync();
        Task<IEnumerable<TipoDeGastoResponseDTO>> GetActivosAsync();
        Task<IEnumerable<TipoDeGastoResponseDTO>> GetByKioscoIdAsync(int kioscoId);
        // Comandos
        Task<TipoDeGastoResponseDTO> CreateAsync(CreateTipoDeGastoDTO dto);
        Task<TipoDeGastoResponseDTO> UpdateAsync(UpdateTipoDeGastoDTO dto);
        Task<bool> ActivarDesactivarAsync(int id, bool activo);
    }
}
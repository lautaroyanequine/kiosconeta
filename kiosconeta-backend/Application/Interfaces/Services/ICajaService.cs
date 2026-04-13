using Application.DTOs.Caja;

namespace Application.Interfaces.Services
{
    public interface ICajaService
    {
        Task<CajaResumenDTO> GetResumenAsync(int kioscoId);
        Task<IEnumerable<MovimientoCajaResponseDTO>> GetMovimientosAsync(int kioscoId);
        Task<MovimientoCajaResponseDTO> CreateMovimientoAsync(int kioscoId, CreateMovimientoCajaDTO dto);
        Task<bool> DeleteMovimientoAsync(int id);
        Task<CajaResumenDTO> UpdateSaldoInicialAsync(int kioscoId, UpdateSaldoInicialDTO dto);
    }
}
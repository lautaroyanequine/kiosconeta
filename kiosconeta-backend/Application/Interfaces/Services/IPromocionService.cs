using Application.DTOs.Promocion;

namespace Application.Interfaces.Services
{
    public interface IPromocionService
    {
        Task<IEnumerable<PromocionResponseDTO>> GetByKioscoAsync(int kioscoId);
        Task<PromocionResponseDTO> CreateAsync(int kioscoId, CreatePromocionDTO dto);
        Task<bool> ToggleActivaAsync(int id);
        Task<bool> DeleteAsync(int id);
        Task<ResultadoPromocionesDTO> DetectarAsync(DetectarPromocionesDTO dto);
    }
}
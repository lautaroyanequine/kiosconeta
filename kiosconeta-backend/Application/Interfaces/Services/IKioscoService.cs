using Application.DTOs.Kiosco;

namespace Application.Interfaces.Services
{
    public interface IKioscoService
    {
        Task<KioscoResponseDTO> GetByIdAsync(int kioscoId);
        Task<KioscoResponseDTO> UpdateAsync(int kioscoId, UpdateKioscoDTO dto);
    }
}
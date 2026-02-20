using Application.DTOs.MetodoDePago;

namespace Application.Interfaces.Services
{
    public interface IMetodoDePagoService
    {
        Task<MetodoDePagoResponseDTO?> GetByIdAsync(int id);
        Task<IEnumerable<MetodoDePagoResponseDTO>> GetAllAsync();
        Task<MetodoDePagoResponseDTO> CreateAsync(CreateMetodoDePagoDTO dto);
        Task<MetodoDePagoResponseDTO> UpdateAsync(UpdateMetodoDePagoDTO dto);
        Task<bool> DeleteAsync(int id);
    }
}
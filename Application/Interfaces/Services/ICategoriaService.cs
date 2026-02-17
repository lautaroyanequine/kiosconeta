using Application.DTOs.Categoria;

namespace Application.Interfaces.Services
{
    public interface ICategoriaService
    {
        Task<CategoriaResponseDTO?> GetByIdAsync(int id);
        Task<IEnumerable<CategoriaResponseDTO>> GetAllAsync();
        Task<CategoriaResponseDTO> CreateAsync(CreateCategoriaDTO dto);
        Task<CategoriaResponseDTO> UpdateAsync(UpdateCategoriaDTO dto);
        Task<bool> DeleteAsync(int id);
    }
}
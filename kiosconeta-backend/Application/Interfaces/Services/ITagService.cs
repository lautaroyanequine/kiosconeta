using Application.DTOs.Tag;

public interface ITagService
{
    Task<IEnumerable<TagResponseDTO>> GetByKioscoIdAsync(int kioscoId);
    Task<TagResponseDTO> CreateAsync(CreateTagDTO dto);
    Task<bool> DeleteAsync(int id);
}
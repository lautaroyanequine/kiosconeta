
using Application.DTOs.Tag;
using Application.Interfaces.Repository;
using Application.Interfaces.Services;
using Domain.Entities;

public class TagService : ITagService
{
    private readonly ITagRepository _tagRepository;
    public TagService(ITagRepository tagRepository) => _tagRepository = tagRepository;

    public async Task<IEnumerable<TagResponseDTO>> GetByKioscoIdAsync(int kioscoId)
    {
        var tags = await _tagRepository.GetByKioscoIdAsync(kioscoId);
        return tags.Select(t => new TagResponseDTO
        {
            TagId = t.TagId,
            Nombre = t.Nombre,
            Activo = t.Activo
        });
    }

    public async Task<TagResponseDTO> CreateAsync(CreateTagDTO dto)
    {
        var tag = new Tag { Nombre = dto.Nombre.Trim(), KioscoId = dto.KioscoId, Activo = true };
        var creado = await _tagRepository.CreateAsync(tag);
        return new TagResponseDTO { TagId = creado.TagId, Nombre = creado.Nombre, Activo = creado.Activo };
    }

    public async Task<bool> DeleteAsync(int id) => await _tagRepository.DeleteAsync(id);
}
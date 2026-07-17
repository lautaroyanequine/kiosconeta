using Domain.Entities;

namespace Application.Interfaces.Repository
{
    public interface ITagRepository
    {
        Task<IEnumerable<Tag>> GetByKioscoIdAsync(int kioscoId);
        Task<Tag?> GetByIdAsync(int id);
        Task<Tag> CreateAsync(Tag tag);
        Task<bool> DeleteAsync(int id);
    }
}
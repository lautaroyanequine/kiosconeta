using Domain.Entities;

namespace Application.Interfaces.Repository
{
    public interface IPromocionRepository
    {
        Task<IEnumerable<Promocion>> GetByKioscoAsync(int kioscoId);
        Task<IEnumerable<Promocion>> GetActivasByKioscoAsync(int kioscoId);
        Task<Promocion?> GetByIdAsync(int id);
        Task<Promocion> CreateAsync(Promocion promocion);
        Task<Promocion> UpdateAsync(Promocion promocion);
        Task<bool> DeleteAsync(int id);
    }
}
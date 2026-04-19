using Domain.Entities;

namespace Application.Interfaces.Repository
{
    public interface IKioscoRepository
    {
        Task<Kiosco?> GetByIdAsync(int kioscoId);
        Task<Kiosco> UpdateAsync(int kioscoId, string nombre, string? direccion);
    }
}
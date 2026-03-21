using Domain.Entities;

namespace Application.Interfaces.Repository
{
    public interface ITurnoRepository
    {
        Task<IEnumerable<Turno>> GetAllAsync();
        Task<Turno?> GetByIdAsync(int id);
    }
}
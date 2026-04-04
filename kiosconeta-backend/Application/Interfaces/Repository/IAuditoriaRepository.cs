using Domain.Entities;

namespace Application.Interfaces.Repository
{
    public interface IAuditoriaRepository
    {
        Task RegistrarAsync(AuditoriaLog log);
        Task<IEnumerable<AuditoriaLog>> GetByKioscoAsync(int kioscoId, DateTime? desde, DateTime? hasta);
        Task<IEnumerable<AuditoriaLog>> GetSospechososByKioscoAsync(int kioscoId);
        Task<IEnumerable<AuditoriaLog>> GetByEmpleadoAsync(int empleadoId, DateTime? desde, DateTime? hasta);
    }
}
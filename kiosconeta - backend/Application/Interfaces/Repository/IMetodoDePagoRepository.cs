using Domain.Entities;

namespace Application.Interfaces.Repository
{
    public interface IMetodoDePagoRepository
    {
        // Consultas
        Task<MetodoDePago?> GetByIdAsync(int id);
        Task<IEnumerable<MetodoDePago>> GetAllAsync();
        Task<bool> ExistsAsync(int id);
        Task<bool> ExistsNombreAsync(string nombre);

        // Comandos
        Task<MetodoDePago> CreateAsync(MetodoDePago metodoDePago);
        Task<MetodoDePago> UpdateAsync(MetodoDePago metodoDePago);
        Task<bool> DeleteAsync(int id);

        // Validaciones
        Task<bool> TieneVentasAsync(int id);
        Task<int> ContarVentasAsync(int id);
    }
}
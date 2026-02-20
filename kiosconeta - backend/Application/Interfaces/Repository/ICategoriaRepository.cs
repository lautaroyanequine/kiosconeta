using Domain.Entities;

namespace Application.Interfaces.Repository
{
    public interface ICategoriaRepository
    {
        // Consultas
        Task<Categoria?> GetByIdAsync(int id);
        Task<IEnumerable<Categoria>> GetAllAsync();
        Task<bool> ExistsAsync(int id);
        Task<bool> ExistsNombreAsync(string nombre);

        // Comandos
        Task<Categoria> CreateAsync(Categoria categoria);
        Task<Categoria> UpdateAsync(Categoria categoria);
        Task<bool> DeleteAsync(int id);

        // Validaciones
        Task<bool> TieneProductosAsync(int id);
        Task<int> ContarProductosAsync(int id);
    }
}
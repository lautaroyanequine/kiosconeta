using Domain.Entities;

namespace Application.Interfaces.Repository
{
    /// <summary>
    /// Interfaz para el repositorio de Productos
    /// Define las operaciones de acceso a datos
    /// </summary>
    public interface IProductoRepository
    {
        // Queries - Consultas
        Task<Producto?> GetByIdAsync(int id);
        Task<IEnumerable<Producto>> GetAllAsync();
        Task<IEnumerable<Producto>> GetByKioscoIdAsync(int kioscoId);
        Task<IEnumerable<Producto>> GetActivosAsync(int kioscoId);
        Task<IEnumerable<Producto>> GetByCategoriaAsync(int categoriaId);
        Task<IEnumerable<Producto>> GetBajoStockAsync(int kioscoId);
        Task<IEnumerable<Producto>> GetProximosAVencerAsync(int kioscoId, int dias = 7);
        Task<Producto?> GetByCodigoBarraAsync(string codigoBarra);
        Task<IEnumerable<Producto>> SearchAsync(string searchTerm, int kioscoId);

        // Commands - Modificaciones
        Task<Producto> CreateAsync(Producto producto);
        Task<Producto> UpdateAsync(Producto producto);
        Task<bool> DeleteAsync(int id);
        Task<bool> ActivarDesactivarAsync(int id, bool activo);
        Task<bool> ActualizarStockAsync(int id, int cantidad);

        // Validaciones
        Task<bool> ExistsAsync(int id);
        Task<bool> ExistsCodigoBarraAsync(string codigoBarra);
    }
}
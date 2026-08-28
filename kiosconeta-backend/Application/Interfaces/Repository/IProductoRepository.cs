using Domain.Entities;

namespace Application.Interfaces.Repository
{
    public interface IProductoRepository
    {
        Task<Producto?> GetByIdAsync(int id, int kioscoId);
        Task<IEnumerable<Producto>> GetAllAsync();
        Task AsignarTagsAsync(int productoId, List<int> tagIds);
        Task<IEnumerable<Producto>> GetByTagAsync(int tagId);
        Task<IEnumerable<Producto>> GetByKioscoIdAsync(int kioscoId);
        Task<List<Producto>> GetByIdsAsync(List<int> ids);
        Task<IEnumerable<Producto>> GetSinStockAsync(int kioscoId);
        Task<IEnumerable<Producto>> GetActivosAsync(int kioscoId);
        Task<IEnumerable<Producto>> GetByCategoriaAsync(int categoriaId);
        Task<IEnumerable<Producto>> GetBajoStockAsync(int kioscoId);
        Task<IEnumerable<Producto>> GetProximosAVencerAsync(int kioscoId, int dias = 7);
        Task<Producto?> GetByCodigoBarraAsync(string codigoBarra, int kioscoId);
        Task<IEnumerable<Producto>> SearchAsync(string searchTerm, int kioscoId);
        Task<Producto> CreateAsync(Producto producto);
        Task<Producto> UpdateAsync(Producto producto);
        Task<bool> DeleteAsync(int id);
        Task<bool> ActivarDesactivarAsync(int id, bool activo);
        Task<bool> ActualizarStockAsync(int id, int cantidad);
        Task<bool> ExistsAsync(int id);
        Task<bool> ExistsCodigoBarraAsync(string codigoBarra, int kioscoId);
        Task<(IEnumerable<Producto> Items, int Total)> GetByKioscoIdPaginadoAsync(
            int kioscoId, int pagina, int tamanoPagina,
            string? busqueda = null, int? categoriaId = null,
            bool? soloStockBajo = null, bool soloActivos = true);
        Task<IEnumerable<Producto>> GetSinMovimientoAsync(int kioscoId, int dias);

        /// <summary>
        /// Limpia el ChangeTracker de EF Core. Se usa después de que falla un
        /// guardado (ej. durante una importación masiva) para que la entidad
        /// rota no quede "pegada" y arruine los guardados siguientes.
        /// </summary>
        Task LimpiarSeguimientoAsync();
    }
}
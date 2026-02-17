using Application.DTOs.Producto;

namespace Application.Interfaces.Services
{
    /// <summary>
    /// Interfaz del servicio de Productos
    /// Define la lógica de negocio
    /// </summary>
    public interface IProductoService
    {
        // Consultas
        Task<ProductoResponseDTO?> GetByIdAsync(int id);
        Task<IEnumerable<ProductoResponseDTO>> GetAllAsync();
        Task<IEnumerable<ProductoResponseDTO>> GetByKioscoIdAsync(int kioscoId);
        Task<IEnumerable<ProductoResponseDTO>> GetActivosAsync(int kioscoId);
        Task<IEnumerable<ProductoResponseDTO>> GetByCategoriaAsync(int categoriaId);
        Task<IEnumerable<ProductoResponseDTO>> GetBajoStockAsync(int kioscoId);
        Task<IEnumerable<ProductoResponseDTO>> GetProximosAVencerAsync(int kioscoId);
        Task<ProductoResponseDTO?> GetByCodigoBarraAsync(string codigoBarra);
        Task<IEnumerable<ProductoResponseDTO>> SearchAsync(string searchTerm, int kioscoId);

        // Comandos
        Task<ProductoResponseDTO> CreateAsync(CreateProductoDTO dto);
        Task<ProductoResponseDTO> UpdateAsync(UpdateProductoDTO dto);
        Task<bool> DeleteAsync(int id);
        Task<bool> ActivarDesactivarAsync(int id, bool activo);
        Task<bool> ActualizarStockAsync(int id, int cantidad);
    }
}
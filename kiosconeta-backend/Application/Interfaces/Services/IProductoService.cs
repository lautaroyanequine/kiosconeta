using Application.DTOs.Common;
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
        Task<ProductoResponseDTO?> GetByIdAsync(int id,int kioscoId);
        Task<IEnumerable<ProductoResponseDTO>> GetAllAsync();
        // IProductoService
        Task<ResultadoPaginadoDTO<ProductoResponseDTO>> GetByKioscoIdPaginadoAsync(
            int kioscoId,
            int pagina,
            int tamanoPagina,
            string? busqueda = null,
            int? categoriaId = null,
            bool? soloStockBajo = null,
            bool soloActivos = true); Task<IEnumerable<ProductoResponseDTO>> GetByKioscoIdAsync(int kioscoId);

        Task<IEnumerable<ProductoResponseDTO>> GetActivosAsync(int kioscoId);
        Task<IEnumerable<ProductoResponseDTO>> GetByCategoriaAsync(int categoriaId);
        Task<IEnumerable<ProductoResponseDTO>> GetSinStockAsync(int kioscoId);
        Task<IEnumerable<ProductoResponseDTO>> GetBajoStockAsync(int kioscoId);
        Task<IEnumerable<ProductoResponseDTO>> GetProximosAVencerAsync(int kioscoId);
        Task<ProductoResponseDTO?> GetByCodigoBarraAsync(string codigoBarra,int kioscoId);
        Task<IEnumerable<ProductoResponseDTO>> SearchAsync(string searchTerm, int kioscoId);
        Task<IEnumerable<ProductoResponseDTO>> GetSinMovimientoAsync(int kioscoId, int dias = 7);

        // Comandos
        Task<ProductoResponseDTO> CreateAsync(CreateProductoDTO dto);
        Task<ProductoResponseDTO> UpdateAsync(UpdateProductoDTO dto,int empleadoId);
        Task<bool> DeleteAsync(int id);
        Task<bool> ActivarDesactivarAsync(int id, bool activo);
        Task<bool> ActualizarStockAsync(int id, int cantidad,int idEmpleado,int kioscoId);
    }
}
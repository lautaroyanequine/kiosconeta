using Domain.Entities;

namespace Application.Interfaces.Repository
{
    public interface IProductoVentaRepository
    {
        Task<List<ProductoVenta>> GetByKioscoYFechaAsync(int kioscoId, DateTime desde);

        Task<List<ProductoVenta>> GetByKioscoYFechaAsync(int kioscoId, DateTime desde, DateTime hasta);

        Task<List<ProductoVenta>> GetUltimos30DiasAsync(int kioscoId);
    }
}

using Domain.Entities;
using Application.DTOs.Venta;

namespace Application.Interfaces.Repository
{
    public interface IVentaRepository
    {
        // Consultas
        Task<Venta?> GetByIdAsync(int id);
        Task<IEnumerable<Venta>> GetAllAsync();
        Task<IEnumerable<Venta>> GetByKioscoIdAsync(int kioscoId);
        Task<IEnumerable<Venta>> GetByEmpleadoIdAsync(int empleadoId);
        Task<IEnumerable<Venta>> GetByFechaAsync(DateTime fechaDesde, DateTime fechaHasta);
        Task<IEnumerable<Venta>> GetVentasDelDiaAsync(int kioscoId);
        Task<IEnumerable<Venta>> GetConFiltrosAsync(int kioscoId, VentaFiltrosDTO filtros);

        // Comandos
        Task<Venta> CreateAsync(Venta venta);
        Task<bool> AnularVentaAsync(int ventaId);

        // Validaciones
        Task<bool> ExistsAsync(int id);
        Task<int> GetSiguienteNumeroVentaAsync(int kioscoId);

        // Productos de la venta
        Task<IEnumerable<ProductoVenta>> GetProductosVentaAsync(int ventaId);
    }
}
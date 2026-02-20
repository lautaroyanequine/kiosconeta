using Application.DTOs.Venta;

namespace Application.Interfaces.Services
{
    public interface IVentaService
    {
        // Consultas
        Task<VentaResponseDTO?> GetByIdAsync(int id);
        Task<IEnumerable<VentaResponseDTO>> GetAllAsync();
        Task<IEnumerable<VentaResponseDTO>> GetByKioscoIdAsync(int kioscoId);
        Task<IEnumerable<VentaResponseDTO>> GetByEmpleadoIdAsync(int empleadoId);
        Task<IEnumerable<VentaResponseDTO>> GetByFechaAsync(DateTime fechaDesde, DateTime fechaHasta);
        Task<IEnumerable<VentaResponseDTO>> GetVentasDelDiaAsync(int kioscoId);
        Task<IEnumerable<VentaResponseDTO>> GetConFiltrosAsync(int kioscoId, VentaFiltrosDTO filtros);

        // Comandos
        Task<VentaResponseDTO> CreateAsync(CreateVentaDTO dto);
        Task<bool> AnularVentaAsync(int ventaId);
    }
}
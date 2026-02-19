using Application.DTOs.Dashboard;

namespace Application.Interfaces.Services
{
    public interface IDashboardService
    {
        // Dashboard general
        Task<DashboardResponseDTO> GetDashboardAsync(int kioscoId);

        // Reportes específicos
        Task<ReporteVentasDTO> GetReporteVentasAsync(int kioscoId, ReporteFiltrosDTO filtros);
        Task<ReporteProductosDTO> GetReporteProductosAsync(int kioscoId);
        Task<ReporteFinancieroDTO> GetReporteFinancieroAsync(int kioscoId, ReporteFiltrosDTO filtros);
    }
}
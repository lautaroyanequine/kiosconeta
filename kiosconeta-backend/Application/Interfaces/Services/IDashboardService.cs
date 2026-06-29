using Application.DTOs.Dashboard;

namespace Application.Interfaces.Services
{
    public interface IDashboardService
    {
        // Dashboard general
        Task<DashboardResponseDTO> GetDashboardAsync(int kioscoId);

        // Dashboard diario por turnos
        Task<DashboardDiarioDTO> GetDashboardDiarioAsync(int kioscoId, DateTime fechaDesde, DateTime fechaHasta);
        Task<ProductoDetalleResponseDTO?> GetDetalleProductoAsync(
    int kioscoId,
    int productoId,
    DateTime fechaDesde,
    DateTime fechaHasta);
        Task<MetricasPeriodoDTO> GetMetricasPeriodoAsync(
    int kioscoId, DateTime fechaDesde, DateTime fechaHasta);

        Task<AnalisisProductosResponseDTO> GetAnalisisProductosAsync(int kioscoId, DateTime fechaDesde, DateTime fechaHasta);
        // Reportes específicos
        Task<ReporteVentasDTO> GetReporteVentasAsync(int kioscoId, ReporteFiltrosDTO filtros);
        Task<ReporteProductosDTO> GetReporteProductosAsync(int kioscoId);
        Task<ReporteFinancieroDTO> GetReporteFinancieroAsync(int kioscoId, ReporteFiltrosDTO filtros);
    }
}
using Application.DTOs.Dashboard;
using Application.Interfaces.Services;
using KIOSCONETA.Attributes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KIOSCONETA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        /// <summary>
        /// Obtener dashboard general del kiosco
        /// </summary>
        [HttpGet("kiosco/{kioscoId}")]
        [RequierePermiso("reportes.dashboard_completo")]
        public async Task<ActionResult<DashboardResponseDTO>> GetDashboard(int kioscoId)
        {
            try
            {
                var dashboard = await _dashboardService.GetDashboardAsync(kioscoId);
                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener dashboard", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener reporte de ventas
        /// </summary>
        [HttpPost("kiosco/{kioscoId}/reporte-ventas")]
        public async Task<ActionResult<ReporteVentasDTO>> GetReporteVentas(
            int kioscoId,
            [FromBody] ReporteFiltrosDTO filtros)
        {
            try
            {
                var reporte = await _dashboardService.GetReporteVentasAsync(kioscoId, filtros);
                return Ok(reporte);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al generar reporte de ventas", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener reporte de productos
        /// </summary>
        [HttpGet("kiosco/{kioscoId}/reporte-productos")]
        public async Task<ActionResult<ReporteProductosDTO>> GetReporteProductos(int kioscoId)
        {
            try
            {
                var reporte = await _dashboardService.GetReporteProductosAsync(kioscoId);
                return Ok(reporte);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al generar reporte de productos", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener reporte financiero
        /// </summary>
        [HttpPost("kiosco/{kioscoId}/reporte-financiero")]
        public async Task<ActionResult<ReporteFinancieroDTO>> GetReporteFinanciero(
            int kioscoId,
            [FromBody] ReporteFiltrosDTO filtros)
        {
            try
            {
                var reporte = await _dashboardService.GetReporteFinancieroAsync(kioscoId, filtros);
                return Ok(reporte);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al generar reporte financiero", error = ex.Message });
            }
        }
    }
}
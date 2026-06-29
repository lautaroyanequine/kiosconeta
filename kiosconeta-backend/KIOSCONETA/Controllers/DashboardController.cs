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
        /// Detalle de un producto: franjas horarias, distribución por hora y día de semana.
        /// </summary>
        [HttpPost("kiosco/{kioscoId}/analisis-productos/{productoId}/detalle")]
        public async Task<IActionResult> GetDetalleProducto(
            int kioscoId,
            int productoId,
            [FromBody] ReporteFiltrosDTO filtros)  // mismo DTO que ya usás para analisis-productos
        {
            var resultado = await _dashboardService.GetDetalleProductoAsync(
                kioscoId,
                productoId,
                filtros.FechaDesde,
                filtros.FechaHasta);

            if (resultado == null)
                return NotFound($"No se encontró el producto {productoId} en el kiosco {kioscoId}.");

            return Ok(resultado);
        }


        /// <summary>
        /// Obtener reporte de ventas
        /// </summary>
        [HttpPost("kiosco/{kioscoId}/reporte-ventas")]
        [RequierePermiso("reportes.ventas")]
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
        [HttpPost("kiosco/{kioscoId}/metricas-periodo")]
        [RequierePermiso("reportes.dashboard_completo")]
        public async Task<ActionResult<MetricasPeriodoDTO>> GetMetricasPeriodo(
    int kioscoId,
    [FromBody] ReporteFiltrosDTO filtros)
        {
            try
            {
                var resultado = await _dashboardService.GetMetricasPeriodoAsync(
                    kioscoId, filtros.FechaDesde, filtros.FechaHasta);
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener métricas", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener reporte de productos
        /// </summary>
        [HttpGet("kiosco/{kioscoId}/reporte-productos")]
        [RequierePermiso("reportes.productos")]
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


        [HttpPost("kiosco/{kioscoId}/analisis-productos")]
        [RequierePermiso("reportes.dashboard_completo")]
        public async Task<ActionResult<AnalisisProductosResponseDTO>> GetAnalisisProductos(
    int kioscoId, [FromBody] ReporteFiltrosDTO filtros)
        {
            try
            {
                var resultado = await _dashboardService.GetAnalisisProductosAsync(
                    kioscoId, filtros.FechaDesde, filtros.FechaHasta);
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al generar análisis", error = ex.Message });
            }
        }



        /// <summary>
        /// Obtener reporte financiero
        /// </summary>
        [HttpPost("kiosco/{kioscoId}/reporte-financiero")]
        [RequierePermiso("reportes.financiero")]
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
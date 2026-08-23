using Application.DTOs.Producto;
using Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KIOSCONETA.Controllers
{
    [Route("api/Productos")]
    [ApiController]
    [Authorize]
    public class ProductoImportExportController : ControllerBase
    {
        private readonly IProductoImportExportService _importExportService;

        public ProductoImportExportController(IProductoImportExportService importExportService)
        {
            _importExportService = importExportService;
        }

        // ─── GET /api/Productos/kiosco/{kioscoId}/exportar ───────────────────
        // Descarga el catálogo completo como .xlsx
        [HttpGet("kiosco/{kioscoId}/exportar")]
        public async Task<IActionResult> Exportar(int kioscoId)
        {
            try
            {
                var archivo = await _importExportService.ExportarExcelAsync(kioscoId);
                var nombreArchivo = $"productos_{DateTime.Now:yyyyMMdd_HHmm}.xlsx";

                return File(
                    archivo,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    nombreArchivo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al exportar productos", error = ex.Message });
            }
        }

        // ─── POST /api/Productos/kiosco/{kioscoId}/importar/preview ──────────
        // Sube el Excel y devuelve la vista previa (no persiste nada)
        [HttpPost("kiosco/{kioscoId}/importar/preview")]
        public async Task<ActionResult<ImportarProductosPreviewResponseDTO>> Preview(
            int kioscoId, [FromForm] IFormFile archivo)
        {
            try
            {
                if (archivo == null || archivo.Length == 0)
                    return BadRequest(new { message = "No se recibió ningún archivo" });

                var extension = Path.GetExtension(archivo.FileName).ToLower();
                if (extension != ".xlsx")
                    return BadRequest(new { message = "El archivo debe ser un Excel (.xlsx)" });

                using var stream = archivo.OpenReadStream();
                var preview = await _importExportService.PreviewImportacionAsync(kioscoId, stream);
                return Ok(preview);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al leer el archivo", error = ex.Message });
            }
        }

        // ─── POST /api/Productos/kiosco/{kioscoId}/importar/confirmar ────────
        // Persiste las filas confirmadas (creación/actualización real)
        [HttpPost("kiosco/{kioscoId}/importar/confirmar")]
        public async Task<ActionResult<ImportarProductosResultadoDTO>> Confirmar(
            int kioscoId, [FromBody] ConfirmarImportacionDTO dto)
        {
            try
            {
                if (dto.Filas == null || dto.Filas.Count == 0)
                    return BadRequest(new { message = "No hay filas para importar" });

                var resultado = await _importExportService.ConfirmarImportacionAsync(kioscoId, dto);
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al importar productos", error = ex.Message });
            }
        }
    }
}
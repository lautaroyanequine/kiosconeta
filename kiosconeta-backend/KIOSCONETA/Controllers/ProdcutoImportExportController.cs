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

        // ─── POST /api/Productos/kiosco/{kioscoId}/importar/leer-estructura ──
        // Sube CUALQUIER Excel y devuelve las columnas detectadas + una
        // sugerencia automática de mapeo, sin persistir nada.
        [HttpPost("kiosco/{kioscoId}/importar/leer-estructura")]
        public async Task<ActionResult<LeerEstructuraExcelResponseDTO>> LeerEstructura(
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
                var estructura = await _importExportService.LeerEstructuraAsync(stream);
                return Ok(estructura);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al leer el archivo", error = ex.Message });
            }
        }

        // ─── POST /api/Productos/kiosco/{kioscoId}/importar/preview ──────────
        // Recibe el archivo + el mapeo de columnas elegido por el usuario,
        // y devuelve la vista previa (no persiste nada)
        [HttpPost("kiosco/{kioscoId}/importar/preview")]
        public async Task<ActionResult<ImportarProductosPreviewResponseDTO>> Preview(
    int kioscoId,
    [FromForm] IFormFile archivo,
    [FromForm] ColumnaMapeoDTO mapeo)
        {
            try
            {
                if (archivo == null || archivo.Length == 0)
                    return BadRequest(new { message = "No se recibió ningún archivo" });

                if (mapeo.NombreColumna <= 0 ||
                    mapeo.CategoriaColumna <= 0 ||
                    mapeo.PrecioCostoColumna <= 0 ||
                    mapeo.PrecioVentaColumna <= 0 ||
                    mapeo.StockActualColumna <= 0 ||
                    mapeo.StockMinimoColumna <= 0)
                {
                    return BadRequest(new
                    {
                        message = "Faltan columnas obligatorias por mapear (nombre, categoría, precio costo, precio venta, stock actual y stock mínimo)."
                    });
                }

                await using var stream = archivo.OpenReadStream();

                var preview = await _importExportService.PreviewImportacionAsync(
                    kioscoId,
                    stream,
                    mapeo);

                return Ok(preview);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Error al leer el archivo.",
                    error = ex.Message
                });
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
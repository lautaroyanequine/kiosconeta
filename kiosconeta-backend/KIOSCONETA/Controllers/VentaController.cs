using Application.DTOs.Venta;
using Application.Interfaces.Services;
using KIOSCONETA.Attributes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KIOSCONETA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class VentasController : ControllerBase
    {
        private readonly IVentaService _ventaService;

        public VentasController(IVentaService ventaService)
        {
            _ventaService = ventaService;
        }

        // ── GET ───────────────────────────────────────────────────────────

        [HttpGet]
        [RequierePermiso("ventas.ver_todas")]            // ← era "productos.ver_todas" (typo)
        public async Task<ActionResult<IEnumerable<VentaResponseDTO>>> GetAll()
        {
            try { return Ok(await _ventaService.GetAllAsync()); }
            catch (Exception ex) { return StatusCode(500, new { message = "Error al obtener ventas", error = ex.Message }); }
        }

        [HttpGet("{id}")]
        [RequierePermiso("ventas.ver_detalle")]          // ← era "productos.ver"
        public async Task<ActionResult<VentaResponseDTO>> GetById(int id)
        {
            try
            {
                var venta = await _ventaService.GetByIdAsync(id);
                if (venta == null) return NotFound(new { message = $"Venta {id} no encontrada" });
                return Ok(venta);
            }
            catch (Exception ex) { return StatusCode(500, new { message = "Error al obtener venta", error = ex.Message }); }
        }

        [HttpGet("kiosco/{kioscoId}")]
        [RequierePermiso("ventas.ver_todas")]            // ← era "productos.ver"
        public async Task<ActionResult<IEnumerable<VentaResponseDTO>>> GetByKiosco(int kioscoId)
        {
            try { return Ok(await _ventaService.GetByKioscoIdAsync(kioscoId)); }
            catch (Exception ex) { return StatusCode(500, new { message = "Error al obtener ventas", error = ex.Message }); }
        }

        [HttpGet("kiosco/{kioscoId}/hoy")]
        [RequierePermiso("ventas.ver_todas")]            // ← era "productos.ver"
        public async Task<ActionResult<IEnumerable<VentaResponseDTO>>> GetVentasDelDia(int kioscoId)
        {
            try { return Ok(await _ventaService.GetVentasDelDiaAsync(kioscoId)); }
            catch (Exception ex) { return StatusCode(500, new { message = "Error al obtener ventas del día", error = ex.Message }); }
        }

        [HttpGet("empleado/{empleadoId}")]
        [RequierePermiso("ventas.ver_por_empleado")]     // ← era "productos.ver_por_empleado"
        public async Task<ActionResult<IEnumerable<VentaResponseDTO>>> GetByEmpleado(int empleadoId)
        {
            try { return Ok(await _ventaService.GetByEmpleadoIdAsync(empleadoId)); }
            catch (Exception ex) { return StatusCode(500, new { message = "Error al obtener ventas", error = ex.Message }); }
        }

        [HttpGet("fecha")]
        [RequierePermiso("ventas.ver_todas")]            // ← era "productos.ver"
        public async Task<ActionResult<IEnumerable<VentaResponseDTO>>> GetByFecha(
            [FromQuery] DateTime fechaDesde, [FromQuery] DateTime fechaHasta)
        {
            try { return Ok(await _ventaService.GetByFechaAsync(fechaDesde, fechaHasta)); }
            catch (Exception ex) { return StatusCode(500, new { message = "Error al obtener ventas", error = ex.Message }); }
        }

        [HttpPost("kiosco/{kioscoId}/buscar")]
        [RequierePermiso("ventas.ver_todas")]            // ← era "productos.ver"
        public async Task<ActionResult<IEnumerable<VentaResponseDTO>>> Buscar(
            int kioscoId, [FromBody] VentaFiltrosDTO filtros)
        {
            try { return Ok(await _ventaService.GetConFiltrosAsync(kioscoId, filtros)); }
            catch (Exception ex) { return StatusCode(500, new { message = "Error al buscar ventas", error = ex.Message }); }
        }

        // ── POST ──────────────────────────────────────────────────────────

        [HttpPost]
        [RequierePermiso("ventas.crear")]
        public async Task<ActionResult<VentaResponseDTO>> Create([FromBody] CreateVentaDTO dto)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);
                var venta = await _ventaService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = venta.VentaId }, venta);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
            catch (Exception ex) { return StatusCode(500, new { message = "Error al crear venta", error = ex.Message }); }
        }

        // ── ANULAR ────────────────────────────────────────────────────────

        [HttpPost("{id}/anular")]
        [RequierePermiso("ventas.anular")]
        public async Task<ActionResult> Anular(int id, [FromBody] AnularVentaDTO dto)
        {
            try
            {
                var empleadoId = int.Parse(User.FindFirst("EmpleadoId")?.Value ?? "0");
                await _ventaService.AnularVentaAsync(id, empleadoId, dto.Motivo);
                return Ok(new { message = "Venta anulada correctamente. Stock devuelto." });
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
            catch (Exception ex) { return StatusCode(500, new { message = "Error al anular venta", error = ex.Message }); }
        }
    }
}
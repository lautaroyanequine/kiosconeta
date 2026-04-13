using Application.DTOs.Caja;
using Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KIOSCONETA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CajaController : ControllerBase
    {
        private readonly ICajaService _cajaService;

        public CajaController(ICajaService cajaService)
        {
            _cajaService = cajaService;
        }

        // ─── GET /api/Caja/kiosco/{kioscoId} ─────────────────────────────────
        // Resumen completo de caja (saldo, ventas, gastos, movimientos)
        [HttpGet("kiosco/{kioscoId}")]
        public async Task<ActionResult<CajaResumenDTO>> GetResumen(int kioscoId)
        {
            try
            {
                var resumen = await _cajaService.GetResumenAsync(kioscoId);
                return Ok(resumen);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener resumen de caja", error = ex.Message });
            }
        }

        // ─── GET /api/Caja/kiosco/{kioscoId}/movimientos ─────────────────────
        // Lista de movimientos manuales del kiosco
        [HttpGet("kiosco/{kioscoId}/movimientos")]
        public async Task<ActionResult<IEnumerable<MovimientoCajaResponseDTO>>> GetMovimientos(int kioscoId)
        {
            try
            {
                var movimientos = await _cajaService.GetMovimientosAsync(kioscoId);
                return Ok(movimientos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener movimientos", error = ex.Message });
            }
        }

        // ─── POST /api/Caja/kiosco/{kioscoId}/movimientos ────────────────────
        // Registrar un ingreso o egreso manual
        [HttpPost("kiosco/{kioscoId}/movimientos")]
        public async Task<ActionResult<MovimientoCajaResponseDTO>> CreateMovimiento(
            int kioscoId,
            [FromBody] CreateMovimientoCajaDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var movimiento = await _cajaService.CreateMovimientoAsync(kioscoId, dto);
                return CreatedAtAction(
                    nameof(GetMovimientos),
                    new { kioscoId },
                    movimiento);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al registrar movimiento", error = ex.Message });
            }
        }

        // ─── DELETE /api/Caja/movimientos/{id} ───────────────────────────────
        // Eliminar un movimiento manual
        [HttpDelete("movimientos/{id}")]
        public async Task<ActionResult> DeleteMovimiento(int id)
        {
            try
            {
                await _cajaService.DeleteMovimientoAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al eliminar movimiento", error = ex.Message });
            }
        }

        // ─── PUT /api/Caja/kiosco/{kioscoId}/saldo-inicial ───────────────────
        // Actualizar el saldo inicial configurable
        [HttpPut("kiosco/{kioscoId}/saldo-inicial")]
        public async Task<ActionResult<CajaResumenDTO>> UpdateSaldoInicial(
            int kioscoId,
            [FromBody] UpdateSaldoInicialDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var resumen = await _cajaService.UpdateSaldoInicialAsync(kioscoId, dto);
                return Ok(resumen);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al actualizar saldo inicial", error = ex.Message });
            }
        }
    }
}
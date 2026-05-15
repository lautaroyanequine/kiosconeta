using Application.DTOs.Promocion;
using Application.Interfaces.Services;
using KIOSCONETA.Attributes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KIOSCONETA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PromocionController : ControllerBase
    {
        private readonly IPromocionService _service;
        public PromocionController(IPromocionService service) => _service = service;

        [HttpGet("kiosco/{kioscoId}")]
        [RequierePermiso("promociones.ver")]
        public async Task<IActionResult> GetByKiosco(int kioscoId)
        {
            var promos = await _service.GetByKioscoAsync(kioscoId);
            return Ok(promos);
        }

        [HttpPost("kiosco/{kioscoId}")]
        [RequierePermiso("promociones.crear")]
        public async Task<IActionResult> Create(int kioscoId, [FromBody] CreatePromocionDTO dto)
        {
            try
            {
                var promo = await _service.CreateAsync(kioscoId, dto);
                return CreatedAtAction(nameof(GetByKiosco), new { kioscoId }, promo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al crear la promoción", error = ex.Message });
            }
        }

        [HttpPatch("{id}/toggle")]
        [RequierePermiso("promociones.editar")]
        public async Task<IActionResult> Toggle(int id)
        {
            try
            {
                var activa = await _service.ToggleActivaAsync(id);
                return Ok(new { activa });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al cambiar estado", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [RequierePermiso("promociones.editar")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _service.DeleteAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al eliminar la promoción", error = ex.Message });
            }
        }

        // ── Endpoint clave: detectar promos en carrito ──
        [HttpPost("detectar")]
        [AllowAnonymous] // lo llama el POS en tiempo real
        public async Task<IActionResult> Detectar([FromBody] DetectarPromocionesDTO dto)
        {
            var resultado = await _service.DetectarAsync(dto);
            return Ok(resultado);
        }
    }
}
using Application.DTOs.Kiosco;
using Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KIOSCONETA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class KioscoController : ControllerBase
    {
        private readonly IKioscoService _kioscoService;

        public KioscoController(IKioscoService kioscoService)
        {
            _kioscoService = kioscoService;
        }

        // GET /api/Kiosco/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<KioscoResponseDTO>> GetById(int id)
        {
            try
            {
                var kiosco = await _kioscoService.GetByIdAsync(id);
                return Ok(kiosco);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener el kiosco", error = ex.Message });
            }
        }

        // PUT /api/Kiosco/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<KioscoResponseDTO>> Update(int id, [FromBody] UpdateKioscoDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var kiosco = await _kioscoService.UpdateAsync(id, dto);
                return Ok(kiosco);
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
                return StatusCode(500, new { message = "Error al actualizar el kiosco", error = ex.Message });
            }
        }
    }
}
using Application.DTOs.CierreTurno;
using Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KIOSCONETA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TurnosController : ControllerBase
    {
        private readonly ICierreTurnoService _cierreTurnoService;

        public TurnosController(ICierreTurnoService cierreTurnoService)
        {
            _cierreTurnoService = cierreTurnoService;
        }

        // ========== GET - CONSULTAS ==========

        /// <summary>
        /// Obtener cierre de turno por ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<CierreTurnoResponseDTO>> GetById(int id)
        {
            try
            {
                var cierre = await _cierreTurnoService.GetByIdAsync(id);
                if (cierre == null)
                    return NotFound(new { message = $"Cierre de turno con ID {id} no encontrado" });

                return Ok(cierre);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener cierre de turno", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener todos los cierres de un kiosco
        /// </summary>
        [HttpGet("kiosco/{kioscoId}")]
        public async Task<ActionResult<IEnumerable<CierreTurnoResponseDTO>>> GetByKiosco(int kioscoId)
        {
            try
            {
                var cierres = await _cierreTurnoService.GetByKioscoIdAsync(kioscoId);
                return Ok(cierres);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener cierres", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener el turno actualmente abierto
        /// </summary>
        [HttpGet("kiosco/{kioscoId}/actual")]
        public async Task<ActionResult<TurnoActualDTO>> GetTurnoActual(int kioscoId)
        {
            try
            {
                var turno = await _cierreTurnoService.GetTurnoAbiertoAsync(kioscoId);
                if (turno == null)
                    return NotFound(new { message = "No hay ningún turno abierto actualmente" });

                return Ok(turno);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener turno actual", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener cierres por rango de fechas
        /// </summary>
        [HttpGet("kiosco/{kioscoId}/fecha")]
        public async Task<ActionResult<IEnumerable<CierreTurnoResponseDTO>>> GetPorFecha(
            int kioscoId,
            [FromQuery] DateTime fechaDesde,
            [FromQuery] DateTime fechaHasta)
        {
            try
            {
                var cierres = await _cierreTurnoService.GetPorFechaAsync(kioscoId, fechaDesde, fechaHasta);
                return Ok(cierres);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener cierres", error = ex.Message });
            }
        }

        // ========== POST - ABRIR/CERRAR ==========

        /// <summary>
        /// Abrir un nuevo turno
        /// </summary>
        [HttpPost("abrir")]
        public async Task<ActionResult<CierreTurnoResponseDTO>> AbrirTurno([FromBody] AbrirTurnoDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var cierre = await _cierreTurnoService.AbrirTurnoAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = cierre.CierreTurnoId }, cierre);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al abrir turno", error = ex.Message });
            }
        }

        /// <summary>
        /// Cerrar el turno actual
        /// </summary>
        [HttpPost("cerrar")]
        public async Task<ActionResult<CierreTurnoResponseDTO>> CerrarTurno([FromBody] CerrarTurnoDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var cierre = await _cierreTurnoService.CerrarTurnoAsync(dto);
                return Ok(cierre);
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
                return StatusCode(500, new { message = "Error al cerrar turno", error = ex.Message });
            }
        }
    }
}
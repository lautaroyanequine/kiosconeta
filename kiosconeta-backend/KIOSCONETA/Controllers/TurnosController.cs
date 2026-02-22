using Application.DTOs.CierreTurno;
using Application.Interfaces.Services;
using KIOSCONETA.Attributes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize]

public class TurnosController : ControllerBase
{
    private readonly ICierreTurnoService _cierreTurnoService;

    public TurnosController(ICierreTurnoService cierreTurnoService)
    {
        _cierreTurnoService = cierreTurnoService;
    }

    // ===================== GET =====================

    [HttpGet("{id}")]
    [RequierePermiso("turnos.ver_todos")]
    public async Task<ActionResult<CierreTurnoResponseDTO>> GetById(int id)
    {
        var cierre = await _cierreTurnoService.GetByIdAsync(id);

        if (cierre == null)
            return NotFound(new { message = $"Cierre de turno con ID {id} no encontrado" });

        return Ok(cierre);
    }

    [HttpGet("kiosco/{kioscoId}")]
    
    public async Task<ActionResult<IEnumerable<CierreTurnoResponseDTO>>> GetByKiosco(int kioscoId)
    {
        var cierres = await _cierreTurnoService.GetByKioscoIdAsync(kioscoId);
        return Ok(cierres);
    }

    [HttpGet("kiosco/{kioscoId}/actual")]

    public async Task<ActionResult<TurnoActualDTO>> GetTurnoActual(int kioscoId)
    {
        var turno = await _cierreTurnoService.GetTurnoAbiertoAsync(kioscoId);

        if (turno == null)
            return NotFound(new { message = "No hay ningún turno abierto actualmente" });

        return Ok(turno);
    }

    [HttpGet("kiosco/{kioscoId}/tiene-abierto")]
    public async Task<ActionResult> TieneTurnoAbierto(int kioscoId)
    {
        var turno = await _cierreTurnoService.GetTurnoAbiertoAsync(kioscoId);

        return Ok(new
        {
            tieneAbierto = turno != null,
            turno
        });
    }

    [HttpGet("kiosco/{kioscoId}/fecha")]
    public async Task<ActionResult<IEnumerable<CierreTurnoResponseDTO>>> GetPorFecha(
        int kioscoId,
        [FromQuery] DateTime fechaDesde,
        [FromQuery] DateTime fechaHasta)
    {
        var cierres = await _cierreTurnoService
            .GetPorFechaAsync(kioscoId, fechaDesde, fechaHasta);

        return Ok(cierres);
    }

    // ===================== POST =====================

    [HttpPost("abrir")]
    [RequierePermiso("turno.abrir")]
    public async Task<ActionResult<CierreTurnoResponseDTO>>
        AbrirTurno([FromBody] AbrirTurnoDTO dto)
    {
        try
        {
            var cierre = await _cierreTurnoService.AbrirTurnoAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = cierre.CierreTurnoId },
                cierre
            );
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("kiosco/{kioscoId}/cerrar")]
    [RequierePermiso("turnos.cerrar")]
    public async Task<ActionResult<CierreTurnoResponseDTO>>
        CerrarTurno(int kioscoId, [FromBody] CerrarTurnoDTO dto)
    {
        try
        {
            var cierre = await _cierreTurnoService
                .CerrarTurnoAsync(kioscoId, dto);

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
    }
}
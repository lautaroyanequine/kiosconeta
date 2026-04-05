using Application.DTOs.Auditoria;
using Application.Interfaces.Services;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KIOSCONETA.Controllers
{ 
    [Route("api/[controller]")]
[ApiController]
[Authorize]
public class AuditoriaController : ControllerBase
{
        private readonly IAuditoriaService _service;

        public AuditoriaController(IAuditoriaService service)
    {
        _service = service;
    }

    [HttpGet("kiosco/{kioscoId}")]
    public async Task<IActionResult> GetByKiosco(
        int kioscoId,
        [FromQuery] DateTime? desde,
        [FromQuery] DateTime? hasta)
    {
        var logs = await _service.GetByKioscoAsync(kioscoId, desde, hasta);
        return Ok(logs);
    }

        [HttpPost("registrar")]
        [Authorize]
        public async Task<IActionResult> Registrar([FromBody] RegistrarAuditoriaDTO dto)
        {
            var empleadoId = int.Parse(User.FindFirst("EmpleadoId")?.Value ?? "0");
            await _service.RegistrarAsync(
                empleadoId: empleadoId,
                kioscoId: dto.KioscoId,
                tipoEvento: dto.TipoEvento,
                descripcion: dto.Descripcion,
                datos: dto.Datos,
                esSospechoso: dto.EsSospechoso,
                motivoSospecha: dto.MotivoSospecha
            );
            return Ok();
        }

        [HttpGet("kiosco/{kioscoId}/sospechosos")]
    public async Task<IActionResult> GetSospechosos(int kioscoId)
    {
        var logs = await _service.GetSospechososByKioscoAsync(kioscoId);
        return Ok(logs);
    }

    [HttpGet("empleado/{empleadoId}")]
    public async Task<IActionResult> GetByEmpleado(
        int empleadoId,
        [FromQuery] DateTime? desde,
        [FromQuery] DateTime? hasta)
    {
        var logs = await _service.GetByEmpleadoAsync(empleadoId, desde, hasta);
        return Ok(logs);
    }
}
}
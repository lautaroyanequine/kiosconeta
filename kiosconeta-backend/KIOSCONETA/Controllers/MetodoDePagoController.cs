using Application.DTOs.MetodoDePago;
using Application.Interfaces.Services;
using KIOSCONETA.Attributes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KIOSCONETA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MetodosDePagoController : ControllerBase
    {
        private readonly IMetodoDePagoService _metodoDePagoService;

        public MetodosDePagoController(IMetodoDePagoService metodoDePagoService)
        {
            _metodoDePagoService = metodoDePagoService;
        }

        [HttpGet]
        // Sin RequierePermiso — el POS necesita cargar métodos sin restricción
        public async Task<ActionResult<IEnumerable<MetodoDePagoResponseDTO>>> GetAll()
        {
            try { return Ok(await _metodoDePagoService.GetAllAsync()); }
            catch (Exception ex) { return StatusCode(500, new { message = "Error al obtener métodos de pago", error = ex.Message }); }
        }

        [HttpGet("{id}")]
        [RequierePermiso("metodos_pago.ver")]
        public async Task<ActionResult<MetodoDePagoResponseDTO>> GetById(int id)
        {
            try
            {
                var metodo = await _metodoDePagoService.GetByIdAsync(id);
                if (metodo == null) return NotFound(new { message = $"Método de pago {id} no encontrado" });
                return Ok(metodo);
            }
            catch (Exception ex) { return StatusCode(500, new { message = "Error al obtener método de pago", error = ex.Message }); }
        }

        [HttpPost]
        [RequierePermiso("metodos_pago.crear")]   // ← antes sin permiso
        public async Task<ActionResult<MetodoDePagoResponseDTO>> Create([FromBody] CreateMetodoDePagoDTO dto)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);
                var metodo = await _metodoDePagoService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = metodo.MetodoDePagoID }, metodo);
            }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
            catch (Exception ex) { return StatusCode(500, new { message = "Error al crear método de pago", error = ex.Message }); }
        }

        [HttpPut("{id}")]
        [RequierePermiso("metodos_pago.editar")]   // ← antes sin permiso
        public async Task<ActionResult<MetodoDePagoResponseDTO>> Update(int id, [FromBody] UpdateMetodoDePagoDTO dto)
        {
            try
            {
                if (id != dto.MetodoDePagoID) return BadRequest(new { message = "ID no coincide" });
                if (!ModelState.IsValid) return BadRequest(ModelState);
                var metodo = await _metodoDePagoService.UpdateAsync(dto);
                return Ok(metodo);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
            catch (Exception ex) { return StatusCode(500, new { message = "Error al actualizar método de pago", error = ex.Message }); }
        }

        [HttpDelete("{id}")]
        [RequierePermiso("metodos_pago.eliminar")]  // ← antes sin permiso
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                await _metodoDePagoService.DeleteAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
            catch (Exception ex) { return StatusCode(500, new { message = "Error al eliminar método de pago", error = ex.Message }); }
        }
    }
}
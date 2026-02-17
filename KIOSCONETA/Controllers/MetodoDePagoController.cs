using Application.DTOs.MetodoDePago;
using Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace KIOSCONETA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MetodosDePagoController : ControllerBase
    {
        private readonly IMetodoDePagoService _metodoDePagoService;

        public MetodosDePagoController(IMetodoDePagoService metodoDePagoService)
        {
            _metodoDePagoService = metodoDePagoService;
        }

        /// <summary>
        /// Obtener todos los métodos de pago
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MetodoDePagoResponseDTO>>> GetAll()
        {
            try
            {
                var metodos = await _metodoDePagoService.GetAllAsync();
                return Ok(metodos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener métodos de pago", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener método de pago por ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<MetodoDePagoResponseDTO>> GetById(int id)
        {
            try
            {
                var metodo = await _metodoDePagoService.GetByIdAsync(id);
                if (metodo == null)
                    return NotFound(new { message = $"Método de pago con ID {id} no encontrado" });

                return Ok(metodo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener método de pago", error = ex.Message });
            }
        }

        /// <summary>
        /// Crear nuevo método de pago
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<MetodoDePagoResponseDTO>> Create([FromBody] CreateMetodoDePagoDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var metodo = await _metodoDePagoService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = metodo.MetodoDePagoID }, metodo);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al crear método de pago", error = ex.Message });
            }
        }

        /// <summary>
        /// Actualizar método de pago
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<MetodoDePagoResponseDTO>> Update(int id, [FromBody] UpdateMetodoDePagoDTO dto)
        {
            try
            {
                if (id != dto.MetodoDePagoID)
                    return BadRequest(new { message = "El ID de la URL no coincide con el ID del cuerpo" });

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var metodo = await _metodoDePagoService.UpdateAsync(dto);
                return Ok(metodo);
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
                return StatusCode(500, new { message = "Error al actualizar método de pago", error = ex.Message });
            }
        }

        /// <summary>
        /// Eliminar método de pago (solo si no tiene ventas)
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                await _metodoDePagoService.DeleteAsync(id);
                return NoContent();
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
                return StatusCode(500, new { message = "Error al eliminar método de pago", error = ex.Message });
            }
        }
    }
}
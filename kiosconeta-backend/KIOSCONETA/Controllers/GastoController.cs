using Application.DTOs.Gasto;
using Application.Interfaces.Services;
using KIOSCONETA.Attributes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KIOSCONETA.Controllers
{
    // ═══════════════════════════════════════════════════
    // GASTOS CONTROLLER
    // ═══════════════════════════════════════════════════

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GastosController : ControllerBase
    {
        private readonly IGastoService _gastoService;

        public GastosController(IGastoService gastoService)
        {
            _gastoService = gastoService;
        }

    
        /// Obtener todos los gastos
        [HttpGet]
        [RequierePermiso("gastos.ver_todos")]
        public async Task<ActionResult<IEnumerable<GastoResponseDTO>>> GetAll()
        {
            try
            {
                var gastos = await _gastoService.GetAllAsync();
                return Ok(gastos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener gastos", error = ex.Message });
            }
        }

        /// Obtener gasto por ID
        [HttpGet("{id}")]
        [RequierePermiso("gastos.ver_todos")]
        public async Task<ActionResult<GastoResponseDTO>> GetById(int id)
        {
            try
            {
                var gasto = await _gastoService.GetByIdAsync(id);
                if (gasto == null)
                    return NotFound(new { message = $"Gasto con ID {id} no encontrado" });

                return Ok(gasto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener gasto", error = ex.Message });
            }
        }

        /// Obtener gastos de un kiosco
        
        [HttpGet("kiosco/{kioscoId}")]
        [RequierePermiso("gastos.ver_todos")]
        public async Task<ActionResult<IEnumerable<GastoResponseDTO>>> GetByKiosco(int kioscoId)
        {
            try
            {
                var gastos = await _gastoService.GetByKioscoIdAsync(kioscoId);
                return Ok(gastos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener gastos", error = ex.Message });
            }
        }

        /// Obtener gastos del día
     
        [HttpGet("kiosco/{kioscoId}/hoy")]
        [RequierePermiso("gastos.ver_todos")]
        public async Task<ActionResult<IEnumerable<GastoResponseDTO>>> GetDelDia(int kioscoId)
        {
            try
            {
                var gastos = await _gastoService.GetDelDiaAsync(kioscoId);
                return Ok(gastos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener gastos del día", error = ex.Message });
            }
        }

        /// Obtener gastos de un empleado
        [HttpGet("empleado/{empleadoId}")]
        [RequierePermiso("gastos.ver_todos")]
        public async Task<ActionResult<IEnumerable<GastoResponseDTO>>> GetByEmpleado(int empleadoId)
        {
            try
            {
                var gastos = await _gastoService.GetByEmpleadoIdAsync(empleadoId);
                return Ok(gastos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener gastos", error = ex.Message });
            }
        }

        /// Obtener gastos por rango de fechas
        [HttpGet("fecha")]
        [RequierePermiso("gastos.ver_todos")]
        public async Task<ActionResult<IEnumerable<GastoResponseDTO>>> GetByFecha(
            [FromQuery] DateTime fechaDesde,
            [FromQuery] DateTime fechaHasta)
        {
            try
            {
                var gastos = await _gastoService.GetByFechaAsync(fechaDesde, fechaHasta);
                return Ok(gastos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener gastos", error = ex.Message });
            }
        }

        /// Buscar gastos con filtros
        [HttpPost("kiosco/{kioscoId}/buscar")]
        [RequierePermiso("gastos.ver_todos")]
        public async Task<ActionResult<IEnumerable<GastoResponseDTO>>> Buscar(
            int kioscoId,
            [FromBody] GastoFiltrosDTO filtros)
        {
            try
            {
                var gastos = await _gastoService.GetConFiltrosAsync(kioscoId, filtros);
                return Ok(gastos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al buscar gastos", error = ex.Message });
            }
        }

        /// Registrar nuevo gasto
        [HttpPost]
        [RequierePermiso("gastos.crear")]
        public async Task<ActionResult<GastoResponseDTO>> Create([FromBody] CreateGastoDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var gasto = await _gastoService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = gasto.GastoId }, gasto);
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
                return StatusCode(500, new { message = "Error al crear gasto", error = ex.Message });
            }
        }

        /// Actualizar gasto
        [HttpPut("{id}")]
        [RequierePermiso("gastos.editar")]
        public async Task<ActionResult<GastoResponseDTO>> Update(int id, [FromBody] UpdateGastoDTO dto)
        {
            try
            {
                if (id != dto.GastoId)
                    return BadRequest(new { message = "El ID de la URL no coincide con el ID del cuerpo" });

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var gasto = await _gastoService.UpdateAsync(dto);
                return Ok(gasto);
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
                return StatusCode(500, new { message = "Error al actualizar gasto", error = ex.Message });
            }
        }

        /// Eliminar gasto
        [HttpDelete("{id}")]
        [RequierePermiso("gastos.eliminar")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                await _gastoService.DeleteAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al eliminar gasto", error = ex.Message });
            }
        }
    }

    // ═══════════════════════════════════════════════════
    // TIPOS DE GASTO CONTROLLER
    // ═══════════════════════════════════════════════════

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TiposDeGastoController : ControllerBase
    {
        private readonly ITipoDeGastoService _tipoDeGastoService;

        public TiposDeGastoController(ITipoDeGastoService tipoDeGastoService)
        {
            _tipoDeGastoService = tipoDeGastoService;
        }

        /// Obtener todos los tipos de gasto
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TipoDeGastoResponseDTO>>> GetAll()
        {
            try
            {
                var tipos = await _tipoDeGastoService.GetAllAsync();
                return Ok(tipos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener tipos de gasto", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener tipos de gasto activos
        /// </summary>
        [HttpGet("activos")]
        public async Task<ActionResult<IEnumerable<TipoDeGastoResponseDTO>>> GetActivos()
        {
            try
            {
                var tipos = await _tipoDeGastoService.GetActivosAsync();
                return Ok(tipos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener tipos de gasto", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener tipo de gasto por ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<TipoDeGastoResponseDTO>> GetById(int id)
        {
            try
            {
                var tipo = await _tipoDeGastoService.GetByIdAsync(id);
                if (tipo == null)
                    return NotFound(new { message = $"Tipo de gasto con ID {id} no encontrado" });

                return Ok(tipo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener tipo de gasto", error = ex.Message });
            }
        }

        /// <summary>
        /// Crear nuevo tipo de gasto
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<TipoDeGastoResponseDTO>> Create([FromBody] CreateTipoDeGastoDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var tipo = await _tipoDeGastoService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = tipo.TipoDeGastoId }, tipo);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al crear tipo de gasto", error = ex.Message });
            }
        }

        /// <summary>
        /// Actualizar tipo de gasto
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<TipoDeGastoResponseDTO>> Update(int id, [FromBody] UpdateTipoDeGastoDTO dto)
        {
            try
            {
                if (id != dto.TipoDeGastoId)
                    return BadRequest(new { message = "El ID de la URL no coincide con el ID del cuerpo" });

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var tipo = await _tipoDeGastoService.UpdateAsync(dto);
                return Ok(tipo);
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
                return StatusCode(500, new { message = "Error al actualizar tipo de gasto", error = ex.Message });
            }
        }

        /// <summary>
        /// Activar o desactivar tipo de gasto
        /// </summary>
        [HttpPatch("{id}/toggle-activo")]
        public async Task<ActionResult> ToggleActivo(int id, [FromQuery] bool activo)
        {
            try
            {
                await _tipoDeGastoService.ActivarDesactivarAsync(id, activo);
                return Ok(new { message = $"Tipo de gasto {(activo ? "activado" : "desactivado")} correctamente" });
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
    }
}
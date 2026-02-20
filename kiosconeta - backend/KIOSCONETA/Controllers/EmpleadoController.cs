using Application.DTOs.Empleado;
using Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace KIOSCONETA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmpleadosController : ControllerBase
    {
        private readonly IEmpleadoService _empleadoService;

        public EmpleadosController(IEmpleadoService empleadoService)
        {
            _empleadoService = empleadoService;
        }

        // ========== GET - CONSULTAS ==========

        /// <summary>
        /// Obtener todos los empleados
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmpleadoResponseDTO>>> GetAll()
        {
            try
            {
                var empleados = await _empleadoService.GetAllAsync();
                return Ok(empleados);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener empleados", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener empleado por ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<EmpleadoResponseDTO>> GetById(int id)
        {
            try
            {
                var empleado = await _empleadoService.GetByIdAsync(id);
                if (empleado == null)
                    return NotFound(new { message = $"Empleado con ID {id} no encontrado" });

                return Ok(empleado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener empleado", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener empleados de un kiosco
        /// </summary>
        [HttpGet("kiosco/{kioscoId}")]
        public async Task<ActionResult<IEnumerable<EmpleadoResponseDTO>>> GetByKiosco(int kioscoId)
        {
            try
            {
                var empleados = await _empleadoService.GetByKioscoIdAsync(kioscoId);
                return Ok(empleados);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener empleados", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener empleados activos de un kiosco
        /// </summary>
        [HttpGet("kiosco/{kioscoId}/activos")]
        public async Task<ActionResult<IEnumerable<EmpleadoResponseDTO>>> GetActivos(int kioscoId)
        {
            try
            {
                var empleados = await _empleadoService.GetActivosAsync(kioscoId);
                return Ok(empleados);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener empleados activos", error = ex.Message });
            }
        }

        // ========== POST - CREAR ==========

        /// <summary>
        /// Crear nuevo empleado
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<EmpleadoResponseDTO>> Create([FromBody] CreateEmpleadoDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var empleado = await _empleadoService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = empleado.EmpleadoId }, empleado);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al crear empleado", error = ex.Message });
            }
        }

        // ========== PUT - ACTUALIZAR ==========

        /// <summary>
        /// Actualizar empleado
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<EmpleadoResponseDTO>> Update(int id, [FromBody] UpdateEmpleadoDTO dto)
        {
            try
            {
                if (id != dto.EmpleadoId)
                    return BadRequest(new { message = "El ID de la URL no coincide con el ID del cuerpo" });

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var empleado = await _empleadoService.UpdateAsync(dto);
                return Ok(empleado);
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
                return StatusCode(500, new { message = "Error al actualizar empleado", error = ex.Message });
            }
        }

        // ========== PATCH - ACCIONES ESPECIALES ==========

        /// <summary>
        /// Activar o desactivar un empleado
        /// </summary>
        [HttpPatch("{id}/toggle-activo")]
        public async Task<ActionResult> ToggleActivo(int id, [FromQuery] bool activo)
        {
            try
            {
                await _empleadoService.ActivarDesactivarAsync(id, activo);
                return Ok(new { message = $"Empleado {(activo ? "activado" : "desactivado")} correctamente" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al cambiar estado del empleado", error = ex.Message });
            }
        }

        /// <summary>
        /// Asignar permiso a un empleado
        /// </summary>
        [HttpPost("permisos/asignar")]
        public async Task<ActionResult<EmpleadoResponseDTO>> AsignarPermiso([FromBody] AsignarPermisoDTO dto)
        {
            try
            {
                var empleado = await _empleadoService.AsignarPermisoAsync(dto);
                return Ok(empleado);
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
                return StatusCode(500, new { message = "Error al asignar permiso", error = ex.Message });
            }
        }

        /// <summary>
        /// Quitar permiso a un empleado
        /// </summary>
        [HttpPost("permisos/quitar")]
        public async Task<ActionResult<EmpleadoResponseDTO>> QuitarPermiso([FromBody] AsignarPermisoDTO dto)
        {
            try
            {
                var empleado = await _empleadoService.QuitarPermisoAsync(dto);
                return Ok(empleado);
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
                return StatusCode(500, new { message = "Error al quitar permiso", error = ex.Message });
            }
        }
    }
}

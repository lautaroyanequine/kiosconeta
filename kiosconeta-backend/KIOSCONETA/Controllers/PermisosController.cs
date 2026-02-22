using Application.DTOs.Permiso;
using Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KIOSCONETA.Attributes;

namespace KIOSCONETA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PermisosController : ControllerBase
    {
        private readonly IPermisoService _permisoService;

        public PermisosController(IPermisoService permisoService)
        {
            _permisoService = permisoService;
        }

        /// <summary>
        /// Obtener todos los permisos disponibles
        /// </summary>
        [HttpGet]
        [RequierePermiso("empleados.asignar_permisos")]
        public async Task<ActionResult<IEnumerable<PermisoResponseDTO>>> GetAll()
        {
            try
            {
                var permisos = await _permisoService.GetAllPermisosAsync();
                return Ok(permisos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener permisos", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener permisos de un empleado específico
        /// </summary>
        [HttpGet("empleado/{empleadoId}")]
        [RequierePermiso("empleados.ver")]
        public async Task<ActionResult<EmpleadoConPermisosDTO>> GetByEmpleado(int empleadoId)
        {
            try
            {
                var empleado = await _permisoService.GetEmpleadoConPermisosAsync(empleadoId);
                return Ok(empleado);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener permisos", error = ex.Message });
            }
        }

        /// <summary>
        /// Verificar si un empleado tiene un permiso específico
        /// </summary>
        [HttpPost("verificar")]
        public async Task<ActionResult<bool>> VerificarPermiso([FromBody] VerificarPermisoDTO dto)
        {
            try
            {
                var tienePermiso = await _permisoService.VerificarPermisoAsync(dto.EmpleadoId, dto.Permiso);
                return Ok(new { tienePermiso });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al verificar permiso", error = ex.Message });
            }
        }

        /// <summary>
        /// Asignar permisos a un empleado (agregar a los existentes)
        /// </summary>
        [HttpPost("asignar")]
        [RequierePermiso("empleados.asignar_permisos")]
        public async Task<ActionResult> AsignarPermisos([FromBody] AsignarPermisosDTO dto)
        {
            try
            {
                await _permisoService.AsignarPermisosAsync(dto);
                return Ok(new { message = "Permisos asignados correctamente" });
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
                return StatusCode(500, new { message = "Error al asignar permisos", error = ex.Message });
            }
        }

        /// <summary>
        /// Quitar permisos a un empleado
        /// </summary>
        [HttpPost("quitar")]
        [RequierePermiso("empleados.asignar_permisos")]
        public async Task<ActionResult> QuitarPermisos([FromBody] AsignarPermisosDTO dto)
        {
            try
            {
                await _permisoService.QuitarPermisosAsync(dto.EmpleadoId, dto.PermisosIds);
                return Ok(new { message = "Permisos quitados correctamente" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al quitar permisos", error = ex.Message });
            }
        }

        /// <summary>
        /// Reemplazar todos los permisos de un empleado
        /// </summary>
        [HttpPut("reemplazar")]
        [RequierePermiso("empleados.asignar_permisos")]
        public async Task<ActionResult> ReemplazarPermisos([FromBody] AsignarPermisosDTO dto)
        {
            try
            {
                await _permisoService.ReemplazarPermisosAsync(dto);
                return Ok(new { message = "Permisos actualizados correctamente" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al actualizar permisos", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener plantillas de roles predefinidos (Admin, Gerente, Cajero, Repositor)
        /// </summary>
        [HttpGet("plantillas")]
        [RequierePermiso("empleados.asignar_permisos")]
        public async Task<ActionResult<IEnumerable<PlantillaRolDTO>>> GetPlantillas()
        {
            try
            {
                var plantillas = await _permisoService.GetPlantillasRolesAsync();
                return Ok(plantillas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener plantillas", error = ex.Message });
            }
        }

        /// <summary>
        /// Asignar un rol completo a un empleado (Admin, Gerente, Cajero, Repositor)
        /// </summary>
        [HttpPost("asignar-rol")]
        [RequierePermiso("empleados.asignar_permisos")]
        public async Task<ActionResult> AsignarRol([FromQuery] int empleadoId, [FromQuery] string rol)
        {
            try
            {
                await _permisoService.AsignarRolAsync(empleadoId, rol);
                return Ok(new { message = $"Rol '{rol}' asignado correctamente" });
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
                return StatusCode(500, new { message = "Error al asignar rol", error = ex.Message });
            }
        }
    }
}
using Application.DTOs.Auth;
using Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KIOSCONETA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        // ════════════════════════════════════════════════
        // LOGIN ADMIN (Email + Password)
        // ════════════════════════════════════════════════

        /// <summary>
        /// Login del administrador con email y contraseña
        /// </summary>
        [HttpPost("login-admin")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponseDTO>> LoginAdmin([FromBody] LoginAdminDTO dto)
        {
            try
            {
                var response = await _authService.LoginAdminAsync(dto);
                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al iniciar sesión", error = ex.Message });
            }
        }

        // ════════════════════════════════════════════════
        // LOGIN EMPLEADO (ID/Legajo + PIN)
        // ════════════════════════════════════════════════

        /// <summary>
        /// Login de empleado con ID o legajo y PIN
        /// </summary>
        [HttpPost("login-empleado")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponseDTO>> LoginEmpleado([FromBody] LoginEmpleadoDTO dto)
        {
            try
            {
                var response = await _authService.LoginEmpleadoAsync(dto);
                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al iniciar sesión", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener lista de empleados disponibles para login (sin PIN, solo para mostrar en UI)
        /// </summary>
        [HttpGet("empleados-login/{kioscoId}")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<EmpleadoLoginDTO>>> GetEmpleadosParaLogin(int kioscoId)
        {
            try
            {
                var empleados = await _authService.GetEmpleadosParaLoginAsync(kioscoId);
                return Ok(empleados);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener empleados", error = ex.Message });
            }
        }

        // ════════════════════════════════════════════════
        // REGISTRO (Crear kiosco + admin)
        // ════════════════════════════════════════════════

        /// <summary>
        /// Registrar nuevo kiosco con su administrador
        /// </summary>
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponseDTO>> Register([FromBody] RegisterDTO dto)
        {
            try
            {
                var response = await _authService.RegisterAsync(dto);
                return CreatedAtAction(nameof(Register), response);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al registrar", error = ex.Message });
            }
        }

        // ════════════════════════════════════════════════
        // CAMBIAR CREDENCIALES
        // ════════════════════════════════════════════════

        /// <summary>
        /// Cambiar contraseña del administrador
        /// </summary>
        [HttpPost("cambiar-password")]
        [Authorize]
        public async Task<ActionResult> CambiarPassword([FromBody] CambiarPasswordDTO dto)
        {
            try
            {
                var usuarioId = int.Parse(User.FindFirst("UsuarioID")?.Value ?? "0");
                await _authService.CambiarPasswordAsync(usuarioId, dto);
                return Ok(new { message = "Contraseña cambiada exitosamente" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al cambiar contraseña", error = ex.Message });
            }
        }

        /// <summary>
        /// Cambiar PIN de un empleado (el propio empleado)
        /// </summary>
        [HttpPost("cambiar-pin")]
        [Authorize]
        public async Task<ActionResult> CambiarPin([FromBody] CambiarPinDTO dto)
        {
            try
            {
                // Verificar que el empleado está cambiando su propio PIN
                var empleadoId = int.Parse(User.FindFirst("EmpleadoId")?.Value ?? "0");
                if (dto.EmpleadoId != empleadoId)
                    return Forbid();

                await _authService.CambiarPinAsync(dto);
                return Ok(new { message = "PIN cambiado exitosamente" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al cambiar PIN", error = ex.Message });
            }
        }

        /// <summary>
        /// Asignar/resetear PIN de un empleado (solo admin)
        /// </summary>
        [HttpPost("asignar-pin")]
        [Authorize]
        public async Task<ActionResult> AsignarPin([FromQuery] int empleadoId, [FromQuery] string pin)
        {
            try
            {
                // Verificar que es admin
                var esAdmin = bool.Parse(User.FindFirst("EsAdmin")?.Value ?? "false");
                if (!esAdmin)
                    return Forbid();

                await _authService.AsignarPinAsync(empleadoId, pin);
                return Ok(new { message = "PIN asignado exitosamente" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al asignar PIN", error = ex.Message });
            }
        }

        /// <summary>
        /// Verificar si el token es válido
        /// </summary>
        [HttpGet("verificar")]
        [Authorize]
        public ActionResult Verificar()
        {
            var empleadoId = User.FindFirst("EmpleadoId")?.Value;
            var nombre = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            var esAdmin = User.FindFirst("EsAdmin")?.Value;

            return Ok(new
            {
                valido = true,
                empleadoId,
                nombre,
                esAdmin = bool.Parse(esAdmin ?? "false")
            });
        }
    }
}
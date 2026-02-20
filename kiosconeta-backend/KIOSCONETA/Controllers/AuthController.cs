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

        /// <summary>
        /// Login - obtener token JWT
        /// </summary>
        [HttpPost("login")]
        [AllowAnonymous]  // ← Este endpoint NO requiere token
        public async Task<ActionResult<AuthResponseDTO>> Login([FromBody] LoginDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var response = await _authService.LoginAsync(dto);
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
        /// Registro - crear nueva cuenta
        /// </summary>
        [HttpPost("register")]
        [AllowAnonymous]  // ← Este endpoint NO requiere token
        public async Task<ActionResult<AuthResponseDTO>> Register([FromBody] RegisterDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var response = await _authService.RegisterAsync(dto);
                return CreatedAtAction(nameof(Login), response);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al registrar usuario", error = ex.Message });
            }
        }

        /// <summary>
        /// Cambiar contraseña (requiere token)
        /// </summary>
        [HttpPost("cambiar-password")]
        [Authorize]  // ← Este endpoint SÍ requiere token
        public async Task<ActionResult> CambiarPassword([FromBody] CambiarPasswordDTO dto)
        {
            try
            {
                await _authService.CambiarPasswordAsync(dto);
                return Ok(new { message = "Contraseña actualizada correctamente" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
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
                return StatusCode(500, new { message = "Error al cambiar contraseña", error = ex.Message });
            }
        }

        /// <summary>
        /// Verificar si el token es válido
        /// </summary>
        [HttpGet("verificar")]
        [Authorize]  // ← Si llega acá, el token es válido
        public ActionResult Verificar()
        {
            // Leer datos del token actual
            var usuarioId = User.FindFirst("UsuarioID")?.Value;
            var nombre = User.FindFirst("Nombre")?.Value;
            var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

            return Ok(new
            {
                message = "Token válido",
                usuarioId,
                nombre,
                email
            });
        }
    }
}
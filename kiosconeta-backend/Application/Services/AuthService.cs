using Application.DTOs.Auth;
using Application.Interfaces.Repository;
using Application.Interfaces.Services;
using Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepository;
        private readonly IEmpleadoRepository _empleadoRepository;
        private readonly IConfiguration _configuration;

        public AuthService(
            IAuthRepository authRepository,
            IEmpleadoRepository empleadoRepository,
            IConfiguration configuration)
        {
            _authRepository = authRepository;
            _empleadoRepository = empleadoRepository;
            _configuration = configuration;
        }

        // ════════════════════════════════════════════════
        // LOGIN ADMIN (Email + Password)
        // ════════════════════════════════════════════════

        public async Task<AuthResponseDTO> LoginAdminAsync(LoginAdminDTO dto)
        {
            // Buscar usuario por email
            var usuario = await _authRepository.GetByEmailAsync(dto.Email);
            if (usuario == null)
                throw new UnauthorizedAccessException("Email o contraseña incorrectos");

            // Validar password
            var passwordHash = HashPassword(dto.Password);
            if (usuario.Password != passwordHash)
                throw new UnauthorizedAccessException("Email o contraseña incorrectos");

            // Buscar empleado admin asociado
            var empleado = await _empleadoRepository.GetByUsuarioIdAsync(usuario.UsuarioID);
            if (empleado == null || !empleado.EsAdmin)
                throw new UnauthorizedAccessException("Usuario no es administrador");

            if (!empleado.Activo)
                throw new UnauthorizedAccessException("Usuario inactivo");

            // Generar token JWT
            var token = GenerarTokenJWT(empleado);

            return new AuthResponseDTO
            {
                EmpleadoId = empleado.EmpleadoId,
                Nombre = empleado.Nombre,
                EsAdmin = true,
                Email = usuario.Email,
                KioscoId = empleado.KioscoID,
                Token = token,
                Expiracion = DateTime.Now.AddHours(
                    int.Parse(_configuration["Jwt:ExpirationHours"] ?? "8")
                )
            };
        }

        // ════════════════════════════════════════════════
        // LOGIN EMPLEADO (ID/Legajo + PIN)
        // ════════════════════════════════════════════════

        public async Task<AuthResponseDTO> LoginEmpleadoAsync(LoginEmpleadoDTO dto)
        {
            Empleado? empleado = null;

            // Buscar por ID o Legajo
            if (dto.EmpleadoId.HasValue)
            {
                empleado = await _empleadoRepository.GetByIdAsync(dto.EmpleadoId.Value);
            }
            else if (!string.IsNullOrWhiteSpace(dto.Legajo))
            {
                empleado = await _empleadoRepository.GetByLegajoAsync(dto.Legajo);
            }
            else
            {
                throw new InvalidOperationException("Debe especificar EmpleadoId o Legajo");
            }

            if (empleado == null)
                throw new UnauthorizedAccessException("Empleado no encontrado");

            if (!empleado.Activo)
                throw new UnauthorizedAccessException("Empleado inactivo");

            if (empleado.EsAdmin)
                throw new UnauthorizedAccessException("Los administradores deben usar login con email");

            // Validar PIN
            if (string.IsNullOrWhiteSpace(empleado.PIN))
                throw new InvalidOperationException("El empleado no tiene PIN configurado");

            var pinHash = HashPassword(dto.PIN);
            if (empleado.PIN != pinHash)
                throw new UnauthorizedAccessException("PIN incorrecto");

            // Generar token JWT
            var token = GenerarTokenJWT(empleado);

            return new AuthResponseDTO
            {
                EmpleadoId = empleado.EmpleadoId,
                Nombre = empleado.Nombre,
                EsAdmin = false,
                Email = null,
                KioscoId = empleado.KioscoID,
                Token = token,
                Expiracion = DateTime.Now.AddHours(
                    int.Parse(_configuration["Jwt:ExpirationHours"] ?? "8")
                )
            };
        }

        // ════════════════════════════════════════════════
        // LISTAR EMPLEADOS DISPONIBLES PARA LOGIN
        // ════════════════════════════════════════════════

        public async Task<IEnumerable<EmpleadoLoginDTO>> GetEmpleadosParaLoginAsync(int kioscoId)
        {
            var empleados = await _empleadoRepository.GetByKioscoIdAsync(kioscoId);

            return empleados
                .Where(e => e.Activo)
                .Select(e => new EmpleadoLoginDTO
                {
                    EmpleadoId = e.EmpleadoId,
                    Nombre = e.Nombre,
                    Legajo = e.Legajo,
                    EsAdmin = e.EsAdmin
                });
        }

        // ════════════════════════════════════════════════
        // REGISTRO (Crear kiosco + admin)
        // ════════════════════════════════════════════════

        public async Task<AuthResponseDTO> RegisterAsync(RegisterDTO dto)
        {
            // Validar email único
            var usuarioExistente = await _authRepository.GetByEmailAsync(dto.Email);
            if (usuarioExistente != null)
                throw new InvalidOperationException("El email ya está en uso");

            // Crear kiosco
            var kiosco = new Kiosco
            {
                Nombre = dto.NombreKiosco,
                Direccion = dto.DireccionKiosco
            };

            // Crear usuario admin
            var usuario = new Usuario
            {
                Email = dto.Email,
                Password = HashPassword(dto.Password),
                
            };
            usuario.Kioscos.Add(kiosco);

            // Crear empleado admin
            var empleadoAdmin = new Empleado
            {
                Nombre = dto.NombreAdmin,
                EsAdmin = true,
                Activo = true,
                Usuario = usuario,
                Kiosco = kiosco,
                PIN = null  // Admin no usa PIN
            };

            // Guardar todo
            await _authRepository.CreateUsuarioConEmpleadoAsync(usuario, empleadoAdmin);

            // Generar token
            var token = GenerarTokenJWT(empleadoAdmin);

            return new AuthResponseDTO
            {
                EmpleadoId = empleadoAdmin.EmpleadoId,
                Nombre = empleadoAdmin.Nombre,
                EsAdmin = true,
                Email = usuario.Email,
                KioscoId = kiosco.KioscoID,
                Token = token,
                Expiracion = DateTime.Now.AddHours(
                    int.Parse(_configuration["Jwt:ExpirationHours"] ?? "8")
                )
            };
        }

        // ════════════════════════════════════════════════
        // CAMBIAR PASSWORD (Solo admin)
        // ════════════════════════════════════════════════

        public async Task CambiarPasswordAsync(int usuarioId, CambiarPasswordDTO dto)
        {
            var usuario = await _authRepository.GetByIdAsync(usuarioId);
            if (usuario == null)
                throw new KeyNotFoundException("Usuario no encontrado");

            // Validar password actual
            var passwordActualHash = HashPassword(dto.PasswordActual);
            if (usuario.Password != passwordActualHash)
                throw new UnauthorizedAccessException("Contraseña actual incorrecta");

            // Actualizar password
            usuario.Password = HashPassword(dto.PasswordNuevo);
            await _authRepository.UpdateAsync(usuario);
        }

        // ════════════════════════════════════════════════
        // CAMBIAR PIN (Empleados)
        // ════════════════════════════════════════════════

        public async Task CambiarPinAsync(CambiarPinDTO dto)
        {
            var empleado = await _empleadoRepository.GetByIdAsync(dto.EmpleadoId);
            if (empleado == null)
                throw new KeyNotFoundException("Empleado no encontrado");

            if (empleado.EsAdmin)
                throw new InvalidOperationException("Los administradores no usan PIN");

            // Validar PIN actual
            if (!string.IsNullOrWhiteSpace(empleado.PIN))
            {
                var pinActualHash = HashPassword(dto.PinActual);
                if (empleado.PIN != pinActualHash)
                    throw new UnauthorizedAccessException("PIN actual incorrecto");
            }

            // Validar formato del nuevo PIN (4-6 dígitos)
            if (!System.Text.RegularExpressions.Regex.IsMatch(dto.PinNuevo, @"^\d{4,6}$"))
                throw new InvalidOperationException("El PIN debe tener entre 4 y 6 dígitos");

            // Actualizar PIN
            empleado.PIN = HashPassword(dto.PinNuevo);
            await _empleadoRepository.UpdateAsync(empleado);
        }

        // ════════════════════════════════════════════════
        // ASIGNAR PIN A EMPLEADO (Admin)
        // ════════════════════════════════════════════════

        public async Task AsignarPinAsync(int empleadoId, string pin)
        {
            var empleado = await _empleadoRepository.GetByIdAsync(empleadoId);
            if (empleado == null)
                throw new KeyNotFoundException("Empleado no encontrado");

            if (empleado.EsAdmin)
                throw new InvalidOperationException("Los administradores no usan PIN");

            // Validar formato (4-6 dígitos)
            if (!System.Text.RegularExpressions.Regex.IsMatch(pin, @"^\d{4,6}$"))
                throw new InvalidOperationException("El PIN debe tener entre 4 y 6 dígitos");

            empleado.PIN = HashPassword(pin);
            await _empleadoRepository.UpdateAsync(empleado);
        }

        // ════════════════════════════════════════════════
        // MÉTODOS PRIVADOS
        // ════════════════════════════════════════════════

        private string GenerarTokenJWT(Empleado empleado)
        {
            var claims = new List<Claim>
            {
                new Claim("UsuarioID", empleado.EmpleadoId.ToString()),
                new Claim("EmpleadoId", empleado.EmpleadoId.ToString()),
                new Claim(ClaimTypes.Name, empleado.Nombre),
                new Claim("EsAdmin", empleado.EsAdmin.ToString()),
                new Claim("KioscoId", empleado.KioscoID.ToString())
            };

            if (empleado.Usuario != null)
            {
                claims.Add(new Claim(ClaimTypes.Email, empleado.Usuario.Email));
            }

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!)
            );
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(
                    int.Parse(_configuration["Jwt:ExpirationHours"] ?? "8")
                ),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }
    }
}
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
        private readonly IConfiguration _configuration;

        public AuthService(IAuthRepository authRepository, IConfiguration configuration)
        {
            _authRepository = authRepository;
            _configuration = configuration;
        }

        // ========== LOGIN ==========
        public async Task<AuthResponseDTO> LoginAsync(LoginDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                throw new InvalidOperationException("Email y contraseña son obligatorios");

            // Buscar usuario por email
            var usuario = await _authRepository.GetByEmailAsync(dto.Email);
            if (usuario == null)
                throw new UnauthorizedAccessException("Email o contraseña incorrectos");

            // Verificar password hasheado
            if (!VerificarPassword(dto.Password, usuario.Password))
                throw new UnauthorizedAccessException("Email o contraseña incorrectos");

            // Generar token JWT
            var token = GenerarToken(usuario);
            var expiracion = DateTime.UtcNow.AddHours(
                double.Parse(_configuration["Jwt:ExpirationHours"] ?? "8")
            );

            return new AuthResponseDTO
            {
                UsuarioID = usuario.UsuarioID,
                Nombre = usuario.Nombre,
                Email = usuario.Email,
                Token = token,
                Expiracion = expiracion
            };
        }

        // ========== REGISTRO ==========
        public async Task<AuthResponseDTO> RegisterAsync(RegisterDTO dto)
        {
            // Validaciones
            if (string.IsNullOrWhiteSpace(dto.Nombre))
                throw new InvalidOperationException("El nombre es obligatorio");

            if (string.IsNullOrWhiteSpace(dto.Email))
                throw new InvalidOperationException("El email es obligatorio");

            if (string.IsNullOrWhiteSpace(dto.Password))
                throw new InvalidOperationException("La contraseña es obligatoria");

            if (dto.Password != dto.ConfirmarPassword)
                throw new InvalidOperationException("Las contraseñas no coinciden");

            if (dto.Password.Length < 6)
                throw new InvalidOperationException("La contraseña debe tener al menos 6 caracteres");

            // Verificar email único
            var existe = await _authRepository.ExistsEmailAsync(dto.Email);
            if (existe)
                throw new InvalidOperationException($"Ya existe una cuenta con el email '{dto.Email}'");

            // Crear usuario con password hasheado
            var usuario = new Usuario
            {
                Nombre = dto.Nombre.Trim(),
                Email = dto.Email.Trim().ToLower(),
                Password = HashearPassword(dto.Password)
            };

            var creado = await _authRepository.CreateAsync(usuario);

            // Generar token JWT
            var token = GenerarToken(creado);
            var expiracion = DateTime.UtcNow.AddHours(
                double.Parse(_configuration["Jwt:ExpirationHours"] ?? "8")
            );

            return new AuthResponseDTO
            {
                UsuarioID = creado.UsuarioID,
                Nombre = creado.Nombre,
                Email = creado.Email,
                Token = token,
                Expiracion = expiracion
            };
        }

        // ========== CAMBIAR PASSWORD ==========
        public async Task<bool> CambiarPasswordAsync(CambiarPasswordDTO dto)
        {
            var usuario = await _authRepository.GetByIdAsync(dto.UsuarioID);
            if (usuario == null)
                throw new KeyNotFoundException($"Usuario con ID {dto.UsuarioID} no encontrado");

            // Verificar password actual
            if (!VerificarPassword(dto.PasswordActual, usuario.Password))
                throw new UnauthorizedAccessException("La contraseña actual es incorrecta");

            if (dto.NuevoPassword != dto.ConfirmarNuevoPassword)
                throw new InvalidOperationException("Las contraseñas nuevas no coinciden");

            if (dto.NuevoPassword.Length < 6)
                throw new InvalidOperationException("La contraseña debe tener al menos 6 caracteres");

            // Actualizar con nuevo password hasheado
            usuario.Password = HashearPassword(dto.NuevoPassword);
            await _authRepository.UpdateAsync(usuario);

            return true;
        }

        // ========== MÉTODOS PRIVADOS ==========

        /// <summary>
        /// Genera un token JWT con los datos del usuario
        /// </summary>
        private string GenerarToken(Usuario usuario)
        {
            var jwtKey = _configuration["Jwt:Key"]
                ?? throw new InvalidOperationException("JWT Key no configurada en appsettings");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Datos que se incluyen dentro del token
            var claims = new[]
            {
                new Claim("UsuarioID", usuario.UsuarioID.ToString()),
                new Claim("Nombre", usuario.Nombre),
                new Claim(ClaimTypes.Email, usuario.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(
                    double.Parse(_configuration["Jwt:ExpirationHours"] ?? "8")
                ),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        /// <summary>
        /// Hashea la contraseña con SHA256
        /// </summary>
        private string HashearPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }

        /// <summary>
        /// Verifica si el password ingresado coincide con el hash guardado
        /// </summary>
        private bool VerificarPassword(string passwordIngresado, string hashGuardado)
        {
            var hashIngresado = HashearPassword(passwordIngresado);
            return hashIngresado == hashGuardado;
        }
    }
}
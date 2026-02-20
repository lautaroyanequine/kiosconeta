namespace Application.DTOs.Auth
{
    // ─── LOGIN ───────────────────────────────────────
    public class LoginDTO
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    // ─── REGISTRO ────────────────────────────────────
    public class RegisterDTO
    {
        public string Nombre { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string ConfirmarPassword { get; set; }
    }

    // ─── RESPUESTA DEL LOGIN ─────────────────────────
    public class AuthResponseDTO
    {
        public int UsuarioID { get; set; }
        public string Nombre { get; set; }
        public string Email { get; set; }
        public string Token { get; set; }           // JWT Token
        public DateTime Expiracion { get; set; }    // Cuándo vence el token
    }

    // ─── CAMBIAR PASSWORD ────────────────────────────
    public class CambiarPasswordDTO
    {
        public int UsuarioID { get; set; }
        public string PasswordActual { get; set; }
        public string NuevoPassword { get; set; }
        public string ConfirmarNuevoPassword { get; set; }
    }
}
namespace Application.DTOs.Auth
{
    // ════════════════════════════════════════════════
    // LOGIN ADMIN (con email y password)
    // ════════════════════════════════════════════════

    public class LoginAdminDTO
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    // ════════════════════════════════════════════════
    // LOGIN EMPLEADO (con ID o legajo y PIN)
    // ════════════════════════════════════════════════

    public class LoginEmpleadoDTO
    {
        /// <summary>
        /// ID del empleado o legajo
        /// </summary>
        public int? EmpleadoId { get; set; }

        /// <summary>
        /// Legajo alternativo (ej: "EMP001")
        /// </summary>
        public string? Legajo { get; set; }

        /// <summary>
        /// PIN de 4-6 dígitos
        /// </summary>
        public string PIN { get; set; }
    }

    // ════════════════════════════════════════════════
    // REGISTRO (solo admin puede registrar el kiosco)
    // ════════════════════════════════════════════════

    public class RegisterDTO
    {
        // Datos del kiosco
        public string NombreKiosco { get; set; }
        public string? DireccionKiosco { get; set; }

        // Datos del admin
        public string NombreAdmin { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }

    // ════════════════════════════════════════════════
    // RESPUESTA DE AUTH (unificada)
    // ════════════════════════════════════════════════

    public class AuthResponseDTO
    {
        public int EmpleadoId { get; set; }
        public string Nombre { get; set; }
        public bool EsAdmin { get; set; }
        public string? Email { get; set; }  // Solo si es admin
        public int KioscoId { get; set; }
        public string Token { get; set; }
        public DateTime Expiracion { get; set; }
    }

    // ════════════════════════════════════════════════
    // CAMBIAR PASSWORD (solo admin)
    // ════════════════════════════════════════════════

    public class CambiarPasswordDTO
    {
        public string PasswordActual { get; set; }
        public string PasswordNuevo { get; set; }
    }

    // ════════════════════════════════════════════════
    // CAMBIAR PIN (empleados)
    // ════════════════════════════════════════════════

    public class CambiarPinDTO
    {
        public int EmpleadoId { get; set; }
        public string PinActual { get; set; }
        public string PinNuevo { get; set; }
    }

    // ════════════════════════════════════════════════
    // LISTAR EMPLEADOS PARA LOGIN
    // ════════════════════════════════════════════════

    public class EmpleadoLoginDTO
    {
        public int EmpleadoId { get; set; }
        public string Nombre { get; set; }
        public string? Legajo { get; set; }
        public bool EsAdmin { get; set; }
    }
}
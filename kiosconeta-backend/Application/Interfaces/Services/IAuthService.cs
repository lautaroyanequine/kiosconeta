using Application.DTOs.Auth;

namespace Application.Interfaces.Services
{
    public interface IAuthService
    {
        // Login
        Task<AuthResponseDTO> LoginAdminAsync(LoginAdminDTO dto);
        Task<AuthResponseDTO> LoginEmpleadoAsync(LoginEmpleadoDTO dto);
        Task<IEnumerable<EmpleadoLoginDTO>> GetEmpleadosParaLoginAsync(int kioscoId);

        // Registro
        Task<AuthResponseDTO> RegisterAsync(RegisterDTO dto);

        // Cambiar credenciales
        Task CambiarPasswordAsync(int usuarioId, CambiarPasswordDTO dto);
        Task CambiarPinAsync(CambiarPinDTO dto);
        Task AsignarPinAsync(int empleadoId, string pin);
    }
}
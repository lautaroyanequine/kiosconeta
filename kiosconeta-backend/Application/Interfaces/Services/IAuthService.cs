using Application.DTOs.Auth;

namespace Application.Interfaces.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDTO> LoginAsync(LoginDTO dto);
        Task<AuthResponseDTO> RegisterAsync(RegisterDTO dto);
        Task<bool> CambiarPasswordAsync(CambiarPasswordDTO dto);
    }
}
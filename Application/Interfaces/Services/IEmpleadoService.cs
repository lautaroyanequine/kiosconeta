using Application.DTOs.Empleado;

namespace Application.Interfaces.Services
{
    public interface IEmpleadoService
    {
        // Consultas
        Task<EmpleadoResponseDTO?> GetByIdAsync(int id);
        Task<IEnumerable<EmpleadoResponseDTO>> GetAllAsync();
        Task<IEnumerable<EmpleadoResponseDTO>> GetByKioscoIdAsync(int kioscoId);
        Task<IEnumerable<EmpleadoResponseDTO>> GetActivosAsync(int kioscoId);

        // Comandos
        Task<EmpleadoResponseDTO> CreateAsync(CreateEmpleadoDTO dto);
        Task<EmpleadoResponseDTO> UpdateAsync(UpdateEmpleadoDTO dto);
        Task<bool> ActivarDesactivarAsync(int id, bool activo);

        // Permisos
        Task<EmpleadoResponseDTO> AsignarPermisoAsync(AsignarPermisoDTO dto);
        Task<EmpleadoResponseDTO> QuitarPermisoAsync(AsignarPermisoDTO dto);
    }
}
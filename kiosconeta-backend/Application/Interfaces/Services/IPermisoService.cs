using Application.DTOs.Permiso;

namespace Application.Interfaces.Services
{
    public interface IPermisoService
    {
        // Consultas
        Task<IEnumerable<PermisoResponseDTO>> GetAllPermisosAsync();
        Task<IEnumerable<PermisoResponseDTO>> GetPermisosByEmpleadoAsync(int empleadoId);
        Task<EmpleadoConPermisosDTO> GetEmpleadoConPermisosAsync(int empleadoId);
        Task<bool> VerificarPermisoAsync(int empleadoId, string permiso);

        // Comandos
        Task AsignarPermisosAsync(AsignarPermisosDTO dto);
        Task QuitarPermisosAsync(int empleadoId, List<int> permisosIds);
        Task ReemplazarPermisosAsync(AsignarPermisosDTO dto);

        // Plantillas de roles
        Task<IEnumerable<PlantillaRolDTO>> GetPlantillasRolesAsync();
        Task AsignarRolAsync(int empleadoId, string rol);
    }
}
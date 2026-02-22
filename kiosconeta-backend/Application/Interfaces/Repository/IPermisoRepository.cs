using Domain.Entities;

namespace Application.Interfaces.Repository
{
    public interface IPermisoRepository
    {
        // Permisos
        Task<IEnumerable<Permiso>> GetAllAsync();
        Task<Permiso?> GetByIdAsync(int id);
        Task<Permiso?> GetByNombreAsync(string nombre);

        // Permisos de empleado
        Task<IEnumerable<Permiso>> GetPermisosByEmpleadoAsync(int empleadoId);
        Task<bool> EmpleadoTienePermisoAsync(int empleadoId, string permiso);
        Task AsignarPermisosAsync(int empleadoId, List<int> permisosIds);
        Task QuitarPermisosAsync(int empleadoId, List<int> permisosIds);
        Task ReemplazarPermisosAsync(int empleadoId, List<int> permisosIds);
    }
}
using Domain.Entities;

namespace Application.Interfaces.Repository
{
    public interface IEmpleadoRepository
    {
        // Consultas
        Task<Empleado?> GetByIdAsync(int id);
        Task<IEnumerable<Empleado>> GetAllAsync();
        Task<IEnumerable<Empleado>> GetByKioscoIdAsync(int kioscoId);
        Task<IEnumerable<Empleado>> GetActivosAsync(int kioscoId);
        Task<bool> ExistsAsync(int id);

        // Comandos
        Task<Empleado> CreateAsync(Empleado empleado);
        Task<Empleado> UpdateAsync(Empleado empleado);
        Task<bool> ActivarDesactivarAsync(int id, bool activo);

        // Validaciones
        Task<bool> TieneVentasAsync(int id);
        Task<int> ContarVentasAsync(int id);

        // Permisos
        Task<IEnumerable<EmpleadoPermiso>> GetPermisosAsync(int empleadoId);
        Task<bool> TienePermisoAsync(int empleadoId, int permisoId);
        Task<EmpleadoPermiso> AsignarPermisoAsync(EmpleadoPermiso empleadoPermiso);
        Task<bool> QuitarPermisoAsync(int empleadoId, int permisoId);
    }
}
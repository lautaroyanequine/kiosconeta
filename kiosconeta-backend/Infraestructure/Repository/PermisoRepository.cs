using Application.Interfaces.Repository;
using Domain.Entities;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infraestructure.Repository
{
    public class PermisoRepository : IPermisoRepository
    {
        private readonly AppDbContext _context;

        public PermisoRepository(AppDbContext context)
        {
            _context = context;
        }

        // ========== PERMISOS ==========

        public async Task<IEnumerable<Permiso>> GetAllAsync()
        {
            return await _context.Permisos
                .OrderBy(p => p.PermisoID)
                .ToListAsync();
        }

        public async Task<Permiso?> GetByIdAsync(int id)
        {
            return await _context.Permisos
                .FirstOrDefaultAsync(p => p.PermisoID == id);
        }

        public async Task<Permiso?> GetByNombreAsync(string nombre)
        {
            return await _context.Permisos
                .FirstOrDefaultAsync(p => p.Nombre.ToLower() == nombre.ToLower());
        }

        // ========== PERMISOS DE EMPLEADO ==========

        public async Task<IEnumerable<Permiso>> GetPermisosByEmpleadoAsync(int empleadoId)
        {
            return await _context.EmpleadoPermisos
                .Where(ep => ep.EmpleadoId == empleadoId)
                .Include(ep => ep.Permiso)
                .Select(ep => ep.Permiso)
                .OrderBy(p => p.PermisoID)
                .ToListAsync();
        }

        public async Task<bool> EmpleadoTienePermisoAsync(int empleadoId, string permiso)
        {
            return await _context.EmpleadoPermisos
                .AnyAsync(ep => ep.EmpleadoId == empleadoId
                             && ep.Permiso.Nombre.ToLower() == permiso.ToLower());
        }

        public async Task AsignarPermisosAsync(int empleadoId, List<int> permisosIds)
        {
            var permisosExistentes = await _context.EmpleadoPermisos
                .Where(ep => ep.EmpleadoId == empleadoId)
                .Select(ep => ep.PermisoId)
                .ToListAsync();

            var nuevosPermisos = permisosIds
                .Where(pid => !permisosExistentes.Contains(pid))
                .Select(pid => new EmpleadoPermiso
                {
                    EmpleadoId = empleadoId,
                    PermisoId = pid
                });

            if (nuevosPermisos.Any())
            {
                _context.EmpleadoPermisos.AddRange(nuevosPermisos);
                await _context.SaveChangesAsync();
            }
        }

        public async Task QuitarPermisosAsync(int empleadoId, List<int> permisosIds)
        {
            var permisosAQuitar = await _context.EmpleadoPermisos
                .Where(ep => ep.EmpleadoId == empleadoId
                          && permisosIds.Contains(ep.PermisoId))
                .ToListAsync();

            if (permisosAQuitar.Any())
            {
                _context.EmpleadoPermisos.RemoveRange(permisosAQuitar);
                await _context.SaveChangesAsync();
            }
        }

        public async Task ReemplazarPermisosAsync(int empleadoId, List<int> permisosIds)
        {
            // Quitar todos los permisos actuales
            var permisosActuales = await _context.EmpleadoPermisos
                .Where(ep => ep.EmpleadoId == empleadoId)
                .ToListAsync();

            _context.EmpleadoPermisos.RemoveRange(permisosActuales);

            // Agregar los nuevos permisos
            var nuevosPermisos = permisosIds
                .Select(pid => new EmpleadoPermiso
                {
                    EmpleadoId = empleadoId,
                    PermisoId = pid
                });

            _context.EmpleadoPermisos.AddRange(nuevosPermisos);
            await _context.SaveChangesAsync();
        }
    }
}
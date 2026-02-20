using Application.Interfaces.Repository;
using Domain.Entities;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infraestructure.Repository
{
    public class EmpleadoRepository : IEmpleadoRepository
    {
        private readonly AppDbContext _context;

        public EmpleadoRepository(AppDbContext context)
        {
            _context = context;
        }

        // ========== CONSULTAS ==========

        public async Task<Empleado?> GetByIdAsync(int id)
        {
            return await _context.Empleados
                .Include(e => e.Kiosco)
                .Include(e => e.EmpleadoPermisos)
                    .ThenInclude(ep => ep.Permiso)
                .FirstOrDefaultAsync(e => e.EmpleadoId == id);
        }

        public async Task<IEnumerable<Empleado>> GetAllAsync()
        {
            return await _context.Empleados
                .Include(e => e.Kiosco)
                .Include(e => e.EmpleadoPermisos)
                    .ThenInclude(ep => ep.Permiso)
                .OrderBy(e => e.Nombre)
                .ToListAsync();
        }

        public async Task<IEnumerable<Empleado>> GetByKioscoIdAsync(int kioscoId)
        {
            return await _context.Empleados
                .Include(e => e.Kiosco)
                .Include(e => e.EmpleadoPermisos)
                    .ThenInclude(ep => ep.Permiso)
                .Where(e => e.KioscoID == kioscoId)
                .OrderBy(e => e.Nombre)
                .ToListAsync();
        }

        public async Task<IEnumerable<Empleado>> GetActivosAsync(int kioscoId)
        {
            return await _context.Empleados
                .Include(e => e.Kiosco)
                .Include(e => e.EmpleadoPermisos)
                    .ThenInclude(ep => ep.Permiso)
                .Where(e => e.KioscoID == kioscoId && e.Activo)
                .OrderBy(e => e.Nombre)
                .ToListAsync();
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Empleados
                .AnyAsync(e => e.EmpleadoId == id);
        }

        // ========== COMANDOS ==========

        public async Task<Empleado> CreateAsync(Empleado empleado)
        {
            empleado.Activo = true;
            _context.Empleados.Add(empleado);
            await _context.SaveChangesAsync();

            // Recargar con relaciones
            return await GetByIdAsync(empleado.EmpleadoId);
        }

        public async Task<Empleado> UpdateAsync(Empleado empleado)
        {
            _context.Empleados.Update(empleado);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(empleado.EmpleadoId);
        }

        public async Task<bool> ActivarDesactivarAsync(int id, bool activo)
        {
            var empleado = await _context.Empleados.FindAsync(id);
            if (empleado == null) return false;

            empleado.Activo = activo;
            await _context.SaveChangesAsync();
            return true;
        }

        // ========== VALIDACIONES ==========

        public async Task<bool> TieneVentasAsync(int id)
        {
            return await _context.Ventas
                .AnyAsync(v => v.EmpleadoId == id);
        }

        public async Task<int> ContarVentasAsync(int id)
        {
            return await _context.Ventas
                .CountAsync(v => v.EmpleadoId == id);
        }

        // ========== PERMISOS ==========

        public async Task<IEnumerable<EmpleadoPermiso>> GetPermisosAsync(int empleadoId)
        {
            return await _context.EmpleadoPermisos
                .Include(ep => ep.Permiso)
                .Where(ep => ep.EmpleadoId == empleadoId && ep.Activo)
                .ToListAsync();
        }

        public async Task<bool> TienePermisoAsync(int empleadoId, int permisoId)
        {
            return await _context.EmpleadoPermisos
                .AnyAsync(ep => ep.EmpleadoId == empleadoId
                             && ep.PermisoId == permisoId
                             && ep.Activo);
        }

        public async Task<EmpleadoPermiso> AsignarPermisoAsync(EmpleadoPermiso empleadoPermiso)
        {
            empleadoPermiso.FechaAsignacion = DateTime.Now;
            empleadoPermiso.Activo = true;

            _context.EmpleadoPermisos.Add(empleadoPermiso);
            await _context.SaveChangesAsync();
            return empleadoPermiso;
        }

        public async Task<bool> QuitarPermisoAsync(int empleadoId, int permisoId)
        {
            var permiso = await _context.EmpleadoPermisos
                .FirstOrDefaultAsync(ep => ep.EmpleadoId == empleadoId
                                        && ep.PermisoId == permisoId
                                        && ep.Activo);

            if (permiso == null) return false;

            // Soft delete del permiso
            permiso.Activo = false;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
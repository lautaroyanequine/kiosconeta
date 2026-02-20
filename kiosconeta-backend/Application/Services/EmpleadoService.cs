using Application.DTOs.Empleado;
using Application.Interfaces.Repository;
using Application.Interfaces.Services;
using Domain.Entities;

namespace Application.Services
{
    public class EmpleadoService : IEmpleadoService
    {
        private readonly IEmpleadoRepository _empleadoRepository;

        public EmpleadoService(IEmpleadoRepository empleadoRepository)
        {
            _empleadoRepository = empleadoRepository;
        }

        // ========== CONSULTAS ==========

        public async Task<EmpleadoResponseDTO?> GetByIdAsync(int id)
        {
            var empleado = await _empleadoRepository.GetByIdAsync(id);
            if (empleado == null) return null;

            return await MapToResponseDTO(empleado);
        }

        public async Task<IEnumerable<EmpleadoResponseDTO>> GetAllAsync()
        {
            var empleados = await _empleadoRepository.GetAllAsync();
            var result = new List<EmpleadoResponseDTO>();
            foreach (var e in empleados)
                result.Add(await MapToResponseDTO(e));
            return result;
        }

        public async Task<IEnumerable<EmpleadoResponseDTO>> GetByKioscoIdAsync(int kioscoId)
        {
            var empleados = await _empleadoRepository.GetByKioscoIdAsync(kioscoId);
            var result = new List<EmpleadoResponseDTO>();
            foreach (var e in empleados)
                result.Add(await MapToResponseDTO(e));
            return result;
        }

        public async Task<IEnumerable<EmpleadoResponseDTO>> GetActivosAsync(int kioscoId)
        {
            var empleados = await _empleadoRepository.GetActivosAsync(kioscoId);
            var result = new List<EmpleadoResponseDTO>();
            foreach (var e in empleados)
                result.Add(await MapToResponseDTO(e));
            return result;
        }

        // ========== COMANDOS ==========

        public async Task<EmpleadoResponseDTO> CreateAsync(CreateEmpleadoDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Nombre))
                throw new InvalidOperationException("El nombre del empleado es obligatorio");

            var empleado = new Empleado
            {
                Nombre = dto.Nombre.Trim(),
                KioscoID = dto.KioscoID,
                UsuarioID = dto.UsuarioID,
                Activo = true
            };

            var creado = await _empleadoRepository.CreateAsync(empleado);
            return await MapToResponseDTO(creado);
        }

        public async Task<EmpleadoResponseDTO> UpdateAsync(UpdateEmpleadoDTO dto)
        {
            var empleado = await _empleadoRepository.GetByIdAsync(dto.EmpleadoId);
            if (empleado == null)
                throw new KeyNotFoundException($"No se encontró el empleado con ID: {dto.EmpleadoId}");

            if (string.IsNullOrWhiteSpace(dto.Nombre))
                throw new InvalidOperationException("El nombre del empleado es obligatorio");

            empleado.Nombre = dto.Nombre.Trim();
            empleado.Activo = dto.Activo;

            var actualizado = await _empleadoRepository.UpdateAsync(empleado);
            return await MapToResponseDTO(actualizado);
        }

        public async Task<bool> ActivarDesactivarAsync(int id, bool activo)
        {
            var existe = await _empleadoRepository.ExistsAsync(id);
            if (!existe)
                throw new KeyNotFoundException($"No se encontró el empleado con ID: {id}");

            return await _empleadoRepository.ActivarDesactivarAsync(id, activo);
        }

        // ========== PERMISOS ==========

        public async Task<EmpleadoResponseDTO> AsignarPermisoAsync(AsignarPermisoDTO dto)
        {
            var empleado = await _empleadoRepository.GetByIdAsync(dto.EmpleadoId);
            if (empleado == null)
                throw new KeyNotFoundException($"No se encontró el empleado con ID: {dto.EmpleadoId}");

            // Verificar si ya tiene el permiso
            var yaLotiene = await _empleadoRepository.TienePermisoAsync(dto.EmpleadoId, dto.PermisoId);
            if (yaLotiene)
                throw new InvalidOperationException("El empleado ya tiene este permiso asignado");

            var empleadoPermiso = new EmpleadoPermiso
            {
                EmpleadoId = dto.EmpleadoId,
                PermisoId = dto.PermisoId,
                FechaAsignacion = DateTime.Now,
                Activo = true
            };

            await _empleadoRepository.AsignarPermisoAsync(empleadoPermiso);

            // Recargar empleado con permisos actualizados
            var actualizado = await _empleadoRepository.GetByIdAsync(dto.EmpleadoId);
            return await MapToResponseDTO(actualizado!);
        }

        public async Task<EmpleadoResponseDTO> QuitarPermisoAsync(AsignarPermisoDTO dto)
        {
            var empleado = await _empleadoRepository.GetByIdAsync(dto.EmpleadoId);
            if (empleado == null)
                throw new KeyNotFoundException($"No se encontró el empleado con ID: {dto.EmpleadoId}");

            var tienePermiso = await _empleadoRepository.TienePermisoAsync(dto.EmpleadoId, dto.PermisoId);
            if (!tienePermiso)
                throw new InvalidOperationException("El empleado no tiene este permiso asignado");

            await _empleadoRepository.QuitarPermisoAsync(dto.EmpleadoId, dto.PermisoId);

            var actualizado = await _empleadoRepository.GetByIdAsync(dto.EmpleadoId);
            return await MapToResponseDTO(actualizado!);
        }

        // ========== MAPEO ==========

        private async Task<EmpleadoResponseDTO> MapToResponseDTO(Empleado empleado)
        {
            var cantidadVentas = await _empleadoRepository.ContarVentasAsync(empleado.EmpleadoId);

            var permisos = empleado.EmpleadoPermisos?
                .Where(ep => ep.Activo)
                .Select(ep => new PermisoDTO
                {
                    PermisoId = ep.PermisoId,
                    Nombre = ep.Permiso?.Nombre ?? "",
                    Descripcion = ep.Permiso?.Descripcion ?? "",
                    FechaAsignacion = ep.FechaAsignacion
                })
                .ToList() ?? new List<PermisoDTO>();

            return new EmpleadoResponseDTO
            {
                EmpleadoId = empleado.EmpleadoId,
                Nombre = empleado.Nombre,
                Activo = empleado.Activo,
                KioscoID = empleado.KioscoID,
                KioscoNombre = empleado.Kiosco?.Nombre ?? "",
                UsuarioID = empleado.UsuarioID,
                CantidadVentas = cantidadVentas,
                Permisos = permisos
            };
        }
    }
}
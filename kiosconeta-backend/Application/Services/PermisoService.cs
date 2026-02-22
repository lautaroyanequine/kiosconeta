using Application.DTOs.Permiso;
using Application.Interfaces.Repository;
using Application.Interfaces.Services;

namespace Application.Services
{
    public class PermisoService : IPermisoService
    {
        private readonly IPermisoRepository _permisoRepository;
        private readonly IEmpleadoRepository _empleadoRepository;

        public PermisoService(
            IPermisoRepository permisoRepository,
            IEmpleadoRepository empleadoRepository)
        {
            _permisoRepository = permisoRepository;
            _empleadoRepository = empleadoRepository;
        }

        // ========== CONSULTAS ==========

        public async Task<IEnumerable<PermisoResponseDTO>> GetAllPermisosAsync()
        {
            var permisos = await _permisoRepository.GetAllAsync();
            return permisos.Select(p => new PermisoResponseDTO
            {
                PermisoID = p.PermisoID,
                Nombre = p.Nombre,
                Descripcion = p.Descripcion,
                Categoria = p.Nombre.Split('.')[0] // productos, ventas, etc.
            });
        }

        public async Task<IEnumerable<PermisoResponseDTO>> GetPermisosByEmpleadoAsync(int empleadoId)
        {
            var empleado = await _empleadoRepository.GetByIdAsync(empleadoId);
            if (empleado == null)
                throw new KeyNotFoundException($"Empleado con ID {empleadoId} no encontrado");

            var permisos = await _permisoRepository.GetPermisosByEmpleadoAsync(empleadoId);
            return permisos.Select(p => new PermisoResponseDTO
            {
                PermisoID = p.PermisoID,
                Nombre = p.Nombre,
                Descripcion = p.Descripcion,
                Categoria = p.Nombre.Split('.')[0]
            });
        }

        public async Task<EmpleadoConPermisosDTO> GetEmpleadoConPermisosAsync(int empleadoId)
        {
            var empleado = await _empleadoRepository.GetByIdAsync(empleadoId);
            if (empleado == null)
                throw new KeyNotFoundException($"Empleado con ID {empleadoId} no encontrado");

            var permisos = await _permisoRepository.GetPermisosByEmpleadoAsync(empleadoId);

            return new EmpleadoConPermisosDTO
            {
                EmpleadoId = empleado.EmpleadoId,
                Nombre = empleado.Nombre,
                Email = empleado.Usuario?.Email ?? "",
                Activo = empleado.Activo,
                EsAdmin = permisos.Count() == 46, // Si tiene todos los permisos, es admin
                Permisos = permisos.Select(p => new PermisoResponseDTO
                {
                    PermisoID = p.PermisoID,
                    Nombre = p.Nombre,
                    Descripcion = p.Descripcion,
                    Categoria = p.Nombre.Split('.')[0]
                }).ToList()
            };
        }

        public async Task<bool> VerificarPermisoAsync(int empleadoId, string permiso)
        {
            return await _permisoRepository.EmpleadoTienePermisoAsync(empleadoId, permiso);
        }

        // ========== COMANDOS ==========

        public async Task AsignarPermisosAsync(AsignarPermisosDTO dto)
        {
            var empleado = await _empleadoRepository.GetByIdAsync(dto.EmpleadoId);
            if (empleado == null)
                throw new KeyNotFoundException($"Empleado con ID {dto.EmpleadoId} no encontrado");

            if (dto.PermisosIds == null || !dto.PermisosIds.Any())
                throw new InvalidOperationException("Debe especificar al menos un permiso");

            await _permisoRepository.AsignarPermisosAsync(dto.EmpleadoId, dto.PermisosIds);
        }

        public async Task QuitarPermisosAsync(int empleadoId, List<int> permisosIds)
        {
            var empleado = await _empleadoRepository.GetByIdAsync(empleadoId);
            if (empleado == null)
                throw new KeyNotFoundException($"Empleado con ID {empleadoId} no encontrado");

            await _permisoRepository.QuitarPermisosAsync(empleadoId, permisosIds);
        }

        public async Task ReemplazarPermisosAsync(AsignarPermisosDTO dto)
        {
            var empleado = await _empleadoRepository.GetByIdAsync(dto.EmpleadoId);
            if (empleado == null)
                throw new KeyNotFoundException($"Empleado con ID {dto.EmpleadoId} no encontrado");

            await _permisoRepository.ReemplazarPermisosAsync(dto.EmpleadoId, dto.PermisosIds);
        }

        // ========== PLANTILLAS DE ROLES ==========

        public async Task<IEnumerable<PlantillaRolDTO>> GetPlantillasRolesAsync()
        {
            return new List<PlantillaRolDTO>
            {
                GetPlantillaAdmin(),
                GetPlantillaGerente(),
                GetPlantillaCajero(),
                GetPlantillaRepositor()
            };
        }

        public async Task AsignarRolAsync(int empleadoId, string rol)
        {
            var plantilla = rol.ToLower() switch
            {
                "admin" => GetPlantillaAdmin(),
                "gerente" => GetPlantillaGerente(),
                "cajero" => GetPlantillaCajero(),
                "repositor" => GetPlantillaRepositor(),
                _ => throw new InvalidOperationException($"Rol '{rol}' no válido")
            };

            await _permisoRepository.ReemplazarPermisosAsync(empleadoId, plantilla.PermisosIds);
        }

        // ========== PLANTILLAS PRIVADAS ==========

        private PlantillaRolDTO GetPlantillaAdmin()
        {
            // Admin tiene TODOS los permisos (1-46)
            return new PlantillaRolDTO
            {
                Rol = "Admin",
                Descripcion = "Acceso total al sistema",
                PermisosIds = Enumerable.Range(1, 46).ToList()
            };
        }

        private PlantillaRolDTO GetPlantillaGerente()
        {
            return new PlantillaRolDTO
            {
                Rol = "Gerente",
                Descripcion = "Gestión operativa completa sin configuración crítica",
                PermisosIds = new List<int>
                {
                    // PRODUCTOS (todos menos eliminar)
                    1, 2, 3, 5, 6, 7, 8,
                    
                    // CATEGORÍAS (todos menos eliminar)
                    9, 10, 11,
                    
                    // VENTAS (todos)
                    13, 14, 15, 16, 17, 18,
                    
                    // GASTOS (crear, ver todos, editar)
                    19, 20, 22,
                    
                    // TURNOS (todos)
                    25, 26, 27, 28, 29, 30,
                    
                    // EMPLEADOS (solo ver)
                    31, 36,
                    
                    // REPORTES (dashboard completo, ventas, productos)
                    37, 39, 40,
                    
                    // MÉTODOS DE PAGO (ver)
                    42
                }
            };
        }

        private PlantillaRolDTO GetPlantillaCajero()
        {
            return new PlantillaRolDTO
            {
                Rol = "Cajero",
                Descripcion = "Operación de caja y ventas básicas",
                PermisosIds = new List<int>
                {
                    // PRODUCTOS (solo ver y ver stock bajo)
                    1, 7,
                    
                    // CATEGORÍAS (solo ver)
                    9,
                    
                    // VENTAS (crear, ver propias, ver detalle)
                    13, 15, 16,
                    
                    // GASTOS (crear menores, ver propios)
                    19, 21,
                    
                    // TURNOS (abrir, cerrar, ver propio)
                    25, 26, 28,
                    
                    // REPORTES (dashboard básico)
                    38,
                    
                    // MÉTODOS DE PAGO (ver)
                    42
                }
            };
        }

        private PlantillaRolDTO GetPlantillaRepositor()
        {
            return new PlantillaRolDTO
            {
                Rol = "Repositor",
                Descripcion = "Gestión de inventario y stock",
                PermisosIds = new List<int>
                {
                    // PRODUCTOS (ver, ajustar stock, ver stock bajo)
                    1, 6, 7,
                    
                    // CATEGORÍAS (solo ver)
                    9,
                    
                    // REPORTES (dashboard básico, productos)
                    38, 40
                }
            };
        }
    }
}

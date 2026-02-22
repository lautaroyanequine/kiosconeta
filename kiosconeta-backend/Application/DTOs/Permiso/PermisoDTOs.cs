namespace Application.DTOs.Permiso
{
    // ═══════════════════════════════════════════════════
    // PERMISOS
    // ═══════════════════════════════════════════════════

    public class PermisoResponseDTO
    {
        public int PermisoID { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public string Categoria { get; set; }  // productos, ventas, etc.
    }

    public class AsignarPermisosDTO
    {
        public int EmpleadoId { get; set; }
        public List<int> PermisosIds { get; set; } = new();
    }

    public class EmpleadoConPermisosDTO
    {
        public int EmpleadoId { get; set; }
        public string Nombre { get; set; }
        public string Email { get; set; }
        public bool Activo { get; set; }
        public bool EsAdmin { get; set; }
        public List<PermisoResponseDTO> Permisos { get; set; } = new();
    }

    public class VerificarPermisoDTO
    {
        public int EmpleadoId { get; set; }
        public string Permiso { get; set; }
    }

    // ═══════════════════════════════════════════════════
    // PLANTILLAS DE ROLES
    // ═══════════════════════════════════════════════════

    public class PlantillaRolDTO
    {
        public string Rol { get; set; }  // Admin, Gerente, Cajero, Repositor
        public string Descripcion { get; set; }
        public List<int> PermisosIds { get; set; } = new();
    }
}
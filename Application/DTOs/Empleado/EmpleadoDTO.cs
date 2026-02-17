namespace Application.DTOs.Empleado
{
    // ─── CREAR ───────────────────────────────────────
    public class CreateEmpleadoDTO
    {
        public string Nombre { get; set; }
        public int KioscoID { get; set; }
        public int UsuarioID { get; set; }
    }

    // ─── ACTUALIZAR ──────────────────────────────────
    public class UpdateEmpleadoDTO
    {
        public int EmpleadoId { get; set; }
        public string Nombre { get; set; }
        public bool Activo { get; set; }
    }

    // ─── RESPUESTA ───────────────────────────────────
    public class EmpleadoResponseDTO
    {
        public int EmpleadoId { get; set; }
        public string Nombre { get; set; }
        public bool Activo { get; set; }
        public int KioscoID { get; set; }
        public string KioscoNombre { get; set; }
        public int UsuarioID { get; set; }
        public int CantidadVentas { get; set; }       // Calculado
        public List<PermisoDTO> Permisos { get; set; } // Permisos activos
    }

    // ─── PERMISO (usado dentro de EmpleadoResponseDTO) ──
    public class PermisoDTO
    {
        public int PermisoId { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public DateTime FechaAsignacion { get; set; }
    }

    // ─── ASIGNAR / QUITAR PERMISO ────────────────────
    public class AsignarPermisoDTO
    {
        public int EmpleadoId { get; set; }
        public int PermisoId { get; set; }
    }
}

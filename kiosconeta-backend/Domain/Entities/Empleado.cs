using System.ComponentModel.DataAnnotations;

namespace Domain.Entities
{
    public class Empleado
    {
        public int EmpleadoId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Nombre { get; set; }

        [MaxLength(20)]
        public string? Legajo { get; set; }

        [MaxLength(15)]
        public string? Telefono { get; set; }

        // ════════════════════════════════════════════════
        // NUEVO SISTEMA DE AUTENTICACIÓN
        // ════════════════════════════════════════════════

        /// <summary>
        /// PIN de acceso del empleado (4-6 dígitos hasheados con SHA256)
        /// Solo para empleados NO admin
        /// </summary>
        [MaxLength(100)]
        public string? PIN { get; set; }

        /// <summary>
        /// Indica si este empleado es el administrador del kiosco
        /// Solo puede haber 1 admin por kiosco
        /// </summary>
        public bool EsAdmin { get; set; }

        /// <summary>
        /// Relación con Usuario (solo si es admin)
        /// Los empleados normales NO tienen usuario, usan PIN
        /// </summary>
        public int? UsuarioID { get; set; }
        public Usuario? Usuario { get; set; }

        // ════════════════════════════════════════════════
        // RESTO DE CAMPOS (sin cambios)
        // ════════════════════════════════════════════════

        public bool Activo { get; set; }

        public int KioscoID { get; set; }
        public Kiosco Kiosco { get; set; }

        public IList<Venta> Ventas { get; set; }
        public IList<Gasto> Gastos { get; set; }
        public IList<EmpleadoPermiso> EmpleadoPermisos { get; set; }
        public IList<CierreTurnoEmpleado> CierreTurnoEmpleados { get; set; }
    }
}
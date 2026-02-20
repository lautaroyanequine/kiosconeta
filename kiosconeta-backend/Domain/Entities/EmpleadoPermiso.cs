using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class EmpleadoPermiso
    {
        public int EmpleadoPermisoId { get; set; }

        public int EmpleadoId { get; set; }
        public Empleado Empleado { get; set; }

        public int PermisoId { get; set; }
        public Permiso Permiso { get; set; }

        public DateTime FechaAsignacion { get; set; }
        public bool Activo { get; set; }
    }

}

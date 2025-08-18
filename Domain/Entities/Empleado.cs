using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Empleado
    {
        public int EmpleadoID { get; set; }
        public string Nombre { get; set; }
        public bool Activo { get; set; }
        public int UsuarioID { get; set; }
        public Usuario Usuario { get; set; }
        public int KioscoID { get; set; }
        public Kiosco Kiosco { get; set; }  
       
    }
}

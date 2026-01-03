using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Gasto
    {
        public int GastoId { get; set; }

        public string Nombre { get; set; }

        public DateTime Fecha { get; set; }

        public string Descripcion { get; set; }

        public decimal Monto { get; set; }

        public int EmpleadoId { get; set; }
        public Empleado Empleado { get; set; }

        public int KioscoId { get; set; }
        public Kiosco Kiosco { get; set; }

        public int TipoDeGastoId { get; set; }
        public TipoDeGasto TipoDeGasto { get; set; }
    }

}

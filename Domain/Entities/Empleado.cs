namespace Domain.Entities
{
    public class Empleado
    {
        public int EmpleadoId { get; set; }
        public string Nombre { get; set; }
        public bool Activo { get; set; }
        public int UsuarioID { get; set; }
        public Usuario Usuario { get; set; }
        public int KioscoID { get; set; }
        public Kiosco Kiosco { get; set; }
        public IList<CierreTurnoEmpleado> CierreTurnoEmpleados { get; set; }
        public IList<EmpleadoPermiso> EmpleadoPermisos { get; set; }
        public IList<Gasto> Gastos { get; set; }

        public IList<Venta> Ventas { get; set; }


    }
}

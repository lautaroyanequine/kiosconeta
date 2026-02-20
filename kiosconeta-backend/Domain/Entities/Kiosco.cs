namespace Domain.Entities
{
    public class Kiosco
    {
        public int KioscoID { get; set; }
        public string Nombre { get; set; }
        public string Direccion { get; set; }
        public int UsuarioID { get; set; }
        public Usuario Usuario { get; set; }
        public IList<Empleado> Empleados { get; set; }
        public IList<Gasto> Gastos { get; set; }
        public IList<CierreTurno> CierreTurnos{ get; set; }

    }
}

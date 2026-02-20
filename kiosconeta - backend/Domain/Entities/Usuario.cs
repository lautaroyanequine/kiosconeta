namespace Domain.Entities
{
    public class Usuario
    {
        public int UsuarioID { get; set; }
        public string Nombre { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public IList<Kiosco> Kioscos { get; set; }
        public IList<Empleado> Empleados { get; set; }
    }
}

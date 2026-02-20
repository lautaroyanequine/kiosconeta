namespace Domain.Entities
{
    public class CierreTurnoEmpleado
    {
        public int CierreTurnoId { get; set; }
        public CierreTurno CierreTurno { get; set; }

        public int EmpleadoId { get; set; }
        public Empleado Empleado { get; set; }
    }

}

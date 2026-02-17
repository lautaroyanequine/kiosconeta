namespace Application.DTOs.MetodoDePago
{
    public class CreateMetodoDePagoDTO
    {
        public string Nombre { get; set; }
    }

    public class UpdateMetodoDePagoDTO
    {
        public int MetodoDePagoID { get; set; }
        public string Nombre { get; set; }
    }

    public class MetodoDePagoResponseDTO
    {
        public int MetodoDePagoID { get; set; }
        public string Nombre { get; set; }
        public int CantidadVentas { get; set; }  // Cuántas ventas usaron este método
    }
}
namespace Application.DTOs.Producto
{
    /// <summary>
    /// Ingreso de mercadería de UN producto: suma stock y, opcionalmente, actualiza
    /// el precio de costo y el distribuidor — todo en una sola operación.
    /// El kiosco y el empleado salen del token, no del body.
    /// </summary>
    public class IngresoMercaderiaDTO
    {
        /// <summary>Cantidad que ingresa (se suma al stock). Debe ser > 0.</summary>
        public int Cantidad { get; set; }

        /// <summary>Nuevo precio de costo. Si es null, el costo no cambia.</summary>
        public decimal? PrecioCosto { get; set; }

        /// <summary>
        /// Distribuidor del producto después del ingreso. Se aplica siempre:
        /// null = "sin distribuidor" (el modal ya viene precargado con el actual).
        /// </summary>
        public int? DistribuidorId { get; set; }
    }
}
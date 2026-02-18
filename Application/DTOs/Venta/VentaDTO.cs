namespace Application.DTOs.Venta
{
    // ─── CREAR VENTA ─────────────────────────────────
    public class CreateVentaDTO
    {
        public int EmpleadoId { get; set; }
        public int MetodoPagoId { get; set; }
        public int TurnoId { get; set; }
        public string? Detalles { get; set; }
        public List<ProductoVentaDTO> Productos { get; set; } = new();
    }

    // ─── PRODUCTO DENTRO DE LA VENTA ────────────────
    public class ProductoVentaDTO
    {
        public int ProductoId { get; set; }
        public int Cantidad { get; set; }
        // PrecioUnitario se toma del producto actual, no lo envía el frontend
    }

    // ─── RESPUESTA DE VENTA ──────────────────────────
    public class VentaResponseDTO
    {
        public int VentaId { get; set; }
        public DateTime Fecha { get; set; }
        public decimal Total { get; set; }
        public decimal PrecioCosto { get; set; }      // Costo total
        public decimal Ganancia { get; set; }          // Total - Costo (calculado)
        public decimal MargenGanancia { get; set; }    // % ganancia (calculado)
        public string? Detalles { get; set; }
        public bool Anulada { get; set; }
        public int NumeroVenta { get; set; }

        // Relaciones
        public int EmpleadoId { get; set; }
        public string EmpleadoNombre { get; set; }

        public int MetodoPagoId { get; set; }
        public string MetodoPagoNombre { get; set; }

        public int TurnoId { get; set; }
        public string TurnoNombre { get; set; }

        // Productos vendidos
        public List<ProductoVentaResponseDTO> Productos { get; set; } = new();
    }

    // ─── PRODUCTO VENDIDO (en la respuesta) ──────────
    public class ProductoVentaResponseDTO
    {
        public int ProductoVentaId { get; set; }
        public int ProductoId { get; set; }
        public string ProductoNombre { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal Subtotal { get; set; }          // Cantidad * PrecioUnitario (calculado)
    }

    // ─── FILTROS PARA BÚSQUEDA ───────────────────────
    public class VentaFiltrosDTO
    {
        public DateTime? FechaDesde { get; set; }
        public DateTime? FechaHasta { get; set; }
        public int? EmpleadoId { get; set; }
        public int? MetodoPagoId { get; set; }
        public int? TurnoId { get; set; }
        public bool? SoloAnuladas { get; set; }
    }
}
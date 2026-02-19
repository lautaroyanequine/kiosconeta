namespace Application.DTOs.Dashboard
{
    // ═══════════════════════════════════════════════════
    // DASHBOARD GENERAL
    // ═══════════════════════════════════════════════════

    public class DashboardResponseDTO
    {
        // Resumen del día
        public ResumenDelDiaDTO ResumenHoy { get; set; }

        // Resumen del mes
        public ResumenDelMesDTO ResumenMes { get; set; }

        // Top productos
        public List<ProductoMasVendidoDTO> TopProductos { get; set; } = new();

        // Métodos de pago
        public List<MetodoPagoEstadisticaDTO> MetodosPago { get; set; } = new();

        // Balance
        public BalanceDTO Balance { get; set; }
    }

    // ─── RESUMEN DEL DÍA ─────────────────────────────
    public class ResumenDelDiaDTO
    {
        public DateTime Fecha { get; set; }
        public int CantidadVentas { get; set; }
        public decimal TotalVentas { get; set; }
        public decimal TotalGastos { get; set; }
        public decimal Ganancia { get; set; }
        public decimal VentaPromedio { get; set; }
    }

    // ─── RESUMEN DEL MES ─────────────────────────────
    public class ResumenDelMesDTO
    {
        public int Mes { get; set; }
        public int Anio { get; set; }
        public int CantidadVentas { get; set; }
        public decimal TotalVentas { get; set; }
        public decimal TotalGastos { get; set; }
        public decimal Ganancia { get; set; }
        public int DiasOperativos { get; set; }
        public decimal PromedioVentasDiarias { get; set; }
    }

    // ─── PRODUCTO MÁS VENDIDO ────────────────────────
    public class ProductoMasVendidoDTO
    {
        public int ProductoId { get; set; }
        public string Nombre { get; set; }
        public int CantidadVendida { get; set; }
        public decimal TotalVentas { get; set; }
        public string Categoria { get; set; }
    }

    // ─── ESTADÍSTICA POR MÉTODO DE PAGO ──────────────
    public class MetodoPagoEstadisticaDTO
    {
        public string MetodoPago { get; set; }
        public int CantidadVentas { get; set; }
        public decimal Total { get; set; }
        public decimal Porcentaje { get; set; }
    }

    // ─── BALANCE ─────────────────────────────────────
    public class BalanceDTO
    {
        public decimal TotalIngresos { get; set; }
        public decimal TotalEgresos { get; set; }
        public decimal Ganancia { get; set; }
        public decimal MargenGanancia { get; set; }  // %
    }

    // ═══════════════════════════════════════════════════
    // REPORTES ESPECÍFICOS
    // ═══════════════════════════════════════════════════

    // ─── REPORTE DE VENTAS ───────────────────────────
    public class ReporteVentasDTO
    {
        public DateTime FechaDesde { get; set; }
        public DateTime FechaHasta { get; set; }
        public int TotalVentas { get; set; }
        public decimal TotalMonto { get; set; }
        public decimal CostoTotal { get; set; }
        public decimal GananciaTotal { get; set; }
        public decimal TicketPromedio { get; set; }
        public List<VentaPorDiaDTO> VentasPorDia { get; set; } = new();
        public List<VentaPorEmpleadoDTO> VentasPorEmpleado { get; set; } = new();
        public List<ProductoMasVendidoDTO> ProductosMasVendidos { get; set; } = new();
    }

    public class VentaPorDiaDTO
    {
        public DateTime Fecha { get; set; }
        public int CantidadVentas { get; set; }
        public decimal Total { get; set; }
    }

    public class VentaPorEmpleadoDTO
    {
        public string Empleado { get; set; }
        public int CantidadVentas { get; set; }
        public decimal Total { get; set; }
    }

    // ─── REPORTE DE PRODUCTOS ────────────────────────
    public class ReporteProductosDTO
    {
        public int TotalProductos { get; set; }
        public int ProductosActivos { get; set; }
        public int ProductosBajoStock { get; set; }
        public int ProductosProximosVencer { get; set; }
        public decimal ValorStockTotal { get; set; }
        public List<ProductoStockDTO> ProductosBajoStockDetalle { get; set; } = new();
        public List<ProductoRotacionDTO> ProductosMayorRotacion { get; set; } = new();
        public List<ProductoRotacionDTO> ProductosMenorRotacion { get; set; } = new();
    }

    public class ProductoStockDTO
    {
        public string Nombre { get; set; }
        public int StockActual { get; set; }
        public int StockMinimo { get; set; }
        public string Categoria { get; set; }
    }

    public class ProductoRotacionDTO
    {
        public string Nombre { get; set; }
        public int VecesVendido { get; set; }
        public int UnidadesVendidas { get; set; }
        public DateTime? UltimaVenta { get; set; }
    }

    // ─── REPORTE FINANCIERO ──────────────────────────
    public class ReporteFinancieroDTO
    {
        public DateTime FechaDesde { get; set; }
        public DateTime FechaHasta { get; set; }

        // Ingresos
        public decimal TotalVentas { get; set; }
        public decimal CostoVentas { get; set; }
        public decimal GananciaBruta { get; set; }

        // Egresos
        public decimal TotalGastos { get; set; }
        public List<GastoPorTipoDTO> GastosPorTipo { get; set; } = new();

        // Balance
        public decimal GananciaNeta { get; set; }
        public decimal MargenGananciaBruta { get; set; }
        public decimal MargenGananciaNeta { get; set; }
    }

    public class GastoPorTipoDTO
    {
        public string TipoGasto { get; set; }
        public decimal Total { get; set; }
        public int Cantidad { get; set; }
        public decimal Porcentaje { get; set; }
    }

    // ─── FILTROS PARA REPORTES ───────────────────────
    public class ReporteFiltrosDTO
    {
        public DateTime FechaDesde { get; set; }
        public DateTime FechaHasta { get; set; }
        public int? EmpleadoId { get; set; }
        public int? CategoriaId { get; set; }
    }
}
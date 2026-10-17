namespace Application.DTOs.Dashboard
{
    public class FranjaHorariaDTO
    {
        public int HoraInicio { get; set; }       // 0–23
        public int HoraFin => HoraInicio + 1;     // calculado
        public int CantidadVentas { get; set; }
        public decimal Porcentaje { get; set; }
    }

    public class DiaSemanaDTO
    {
        public string Dia { get; set; } = string.Empty;   // "Lunes", "Martes", …
        public int CantidadVentas { get; set; }
        public decimal Porcentaje { get; set; }
    }

    public class ProductoDetalleResponseDTO
    {
        public int ProductoId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Categoria { get; set; } = string.Empty;
        public int DiasAnalizados { get; set; }

        // Top 3 franjas ordenadas por volumen
        public List<FranjaHorariaDTO> FranjasHorarias { get; set; } = new();

        // Array[24]: cantidad de unidades vendidas por hora del día (índice = hora)
        public int[] DistribucionHoraria { get; set; } = new int[24];

        // Ventas por día de semana (Lunes → Domingo)
        public List<DiaSemanaDTO> DiasSemana { get; set; } = new();
        public int CantidadQuiebresStock { get; set; }
        public List<DateTime> FechasQuiebresStock { get; set; } = new();
    }
    public class AnalisisProductoDTO
    {
        public int ProductoId { get; set; }
        public string Nombre { get; set; }
        public string Categoria { get; set; }
        public int UnidadesVendidas { get; set; }
        public decimal TotalIngresos { get; set; }
        public decimal TotalCosto { get; set; }
        public decimal Ganancia { get; set; }
        public decimal MargenGanancia { get; set; }
        public int StockActual { get; set; }
        public int DiasAnalizados { get; set; }
        public decimal PromedioVentasDiarias { get; set; }
        public int RecomendacionCompra { get; set; }
        public decimal CostoTotalRecomendado { get; set; }
        public int StockMinimo { get; set; }

        public decimal DiasStockRestante { get; set; }
        public DateTime? UltimaVenta { get; set; }
    }

    // Combo vendido en el período, agregado por promoción (nombre + cantidad + ingresos).
    // Sus productos componentes YA están contados, cada uno por separado, dentro de
    // AnalisisProductoDTO (así se graba la venta): esto solo agrega el combo como tal,
    // por eso no tiene StockActual/DiasStockRestante propios (no son "un producto").
    public class AnalisisComboDTO
    {
        public int? PromocionId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public int CantidadVendida { get; set; }
        public decimal TotalIngresos { get; set; }

        public decimal PromedioVentasDiarias { get; set; }
        public DateTime? UltimaVenta { get; set; }

        // Ganancia/margen ESTIMADOS con los costos actuales de los productos del combo
        // (VentaCombo solo guarda el precio de venta, no el costo al momento de la venta).
        // Null si la promoción ya no existe o no hay datos suficientes.
        public decimal? Ganancia { get; set; }
        public decimal? MargenGanancia { get; set; }
        public bool GananciaEsEstimada { get; set; }

        // "Stock" del combo = cuántos combos se pueden armar hoy con el stock actual
        // (limita el componente más escaso). Null si no se puede calcular.
        public int? StockActual { get; set; }
        public decimal? DiasStockRestante { get; set; }
    }

    public class AnalisisProductosResponseDTO
    {
        public int DiasAnalizados { get; set; }
        public DateTime FechaDesde { get; set; }
        public DateTime FechaHasta { get; set; }
        public int TotalProductosVendidos { get; set; }
        public decimal TotalIngresos { get; set; }
        public decimal TotalGanancia { get; set; }
        public decimal TotalInversionNecesaria { get; set; }
        public List<AnalisisProductoDTO> Productos { get; set; } = new();
        public List<AnalisisComboDTO> Combos { get; set; } = new();
    }
}
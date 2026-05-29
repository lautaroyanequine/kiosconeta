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
    public decimal CostoTotalRecomendado { get; set; }
    public int StockActual { get; set; }
    public int DiasAnalizados { get; set; }
    public decimal PromedioVentasDiarias { get; set; }  // unidades/día
    public int RecomendacionCompra { get; set; }        // unidades sugeridas para el próximo período
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
}
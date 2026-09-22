namespace Application.DTOs.Producto
{
    public enum TipoAjustePrecio
    {
        Porcentaje = 0,
        MontoFijo = 1,
        // Reemplaza el precio directo, no lo calcula a partir del actual —
        // ValorVenta/ValorCosto acá son el precio final, no un delta.
        PrecioFijo = 2
    }

    /// <summary>
    /// DTO para ajustar el precio de varios productos a la vez.
    /// El frontend ya resuelve el filtro (categoría / búsqueda) contra el
    /// catálogo que tiene cargado y manda acá la lista final de IDs a tocar,
    /// así el backend no necesita replicar esa lógica de filtrado.
    /// </summary>
    public class AjustePrecioMasivoDTO
    {
        public int KioscoId { get; set; }
        public List<int> ProductoIds { get; set; } = new();
        public TipoAjustePrecio TipoAjuste { get; set; }

        // null = no tocar ese precio. Pueden venir los dos a la vez (con
        // valores distintos), uno solo, o ninguno (rechazado por el service).
        // Para Porcentaje: 10 = +10%, -15 = -15%. Para MontoFijo: plata directa.
        public decimal? ValorVenta { get; set; }
        public decimal? ValorCosto { get; set; }
    }

    public class AjustePrecioMasivoResponseDTO
    {
        public int CantidadActualizados { get; set; }
        public List<ProductoResponseDTO> Productos { get; set; } = new();
        // Productos que se omitieron (no encontrado, o el ajuste dejaba un
        // precio inválido: <= 0, o venta <= costo) — no frena el resto del lote.
        public List<string> Errores { get; set; } = new();
    }
}
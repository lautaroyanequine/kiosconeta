namespace Domain.Entities
{
    /// <summary>
    /// Registra que una venta incluyó N unidades de un combo (Promocion.Tipo = Combo).
    /// Los productos individuales del combo YA se guardan como ProductoVenta normales
    /// (con su precio real) — esta tabla solo agrega el dato de "qué combo se vendió",
    /// que antes se calculaba y se descartaba sin persistirse en ningún lado.
    /// </summary>
    public class VentaCombo
    {
        public int VentaComboId { get; set; }

        public int VentaId { get; set; }
        public Venta Venta { get; set; }

        /// <summary>
        /// Nullable: si la promoción se borra más adelante, el historial de ventas
        /// no debe romperse ni perder el nombre (por eso también se guarda PromocionNombre).
        /// </summary>
        public int? PromocionId { get; set; }
        public Promocion? Promocion { get; set; }

        /// <summary>Snapshot del nombre al momento de la venta.</summary>
        public string PromocionNombre { get; set; } = string.Empty;

        /// <summary>Cantidad de combos vendidos (ej: 2 combos "Desayuno").</summary>
        public int Cantidad { get; set; }

        /// <summary>Precio unitario del combo en el momento de la venta.</summary>
        public decimal PrecioCombo { get; set; }
    }
}
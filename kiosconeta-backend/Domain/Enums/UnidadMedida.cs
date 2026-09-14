namespace Domain.Enums
{
    // Define cómo se vende y se descuenta stock de un producto.
    // - Unidad: se vende y se descuenta en unidades enteras (ej: una gaseosa).
    // - Kilogramo: se vende "al peso". Por convención en todo el sistema:
    //     · StockActual y ProductoVenta.Cantidad se guardan en GRAMOS (int, sin decimales).
    //     · PrecioVenta / PrecioCosto representan el precio POR KILO.
    //   Esto evita manejar decimales en el stock y en la cantidad vendida,
    //   que es donde los errores de redondeo son más peligrosos (afectan
    //   comparaciones de stock, no solo montos).
    public enum UnidadMedida
    {
        Unidad = 0,
        Kilogramo = 1
    }
}
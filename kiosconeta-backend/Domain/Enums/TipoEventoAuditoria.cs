namespace Domain.Enums
{
    public static class TipoEventoAuditoria
    {
        // Ventas
        public const string VentaCreada = "VENTA_CREADA";
        public const string VentaAnulada = "VENTA_ANULADA";

        // Carrito
        public const string CarritoLimpiado = "CARRITO_LIMPIADO";

        // Turno
        public const string TurnoAbierto = "TURNO_ABIERTO";
        public const string TurnoCerrado = "TURNO_CERRADO";
        public const string TurnoCerradoConDiferencia = "TURNO_DIFERENCIA";

        // Gastos
        public const string GastoCreado = "GASTO_CREADO";
        public const string GastoEliminado = "GASTO_ELIMINADO";

        // Productos
        public const string StockAjustado = "STOCK_AJUSTADO";

        // Seguridad
        public const string LoginFallido = "LOGIN_FALLIDO";
        public const string LoginExitoso = "LOGIN_EXITOSO";
    }
}
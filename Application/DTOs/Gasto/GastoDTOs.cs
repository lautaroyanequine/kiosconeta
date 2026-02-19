namespace Application.DTOs.Gasto
{
    // ═══════════════════════════════════════════════════
    // GASTO
    // ═══════════════════════════════════════════════════

    // ─── CREAR GASTO ─────────────────────────────────
    public class CreateGastoDTO
    {
        public string Nombre { get; set; }
        public string? Descripcion { get; set; }
        public decimal Monto { get; set; }
        public int EmpleadoId { get; set; }
        public int KioscoId { get; set; }
        public int TipoDeGastoId { get; set; }
    }

    // ─── ACTUALIZAR GASTO ────────────────────────────
    public class UpdateGastoDTO
    {
        public int GastoId { get; set; }
        public string Nombre { get; set; }
        public string? Descripcion { get; set; }
        public decimal Monto { get; set; }
        public int TipoDeGastoId { get; set; }
    }

    // ─── RESPUESTA DE GASTO ──────────────────────────
    public class GastoResponseDTO
    {
        public int GastoId { get; set; }
        public string Nombre { get; set; }
        public string? Descripcion { get; set; }
        public decimal Monto { get; set; }
        public DateTime Fecha { get; set; }

        // Relaciones
        public int EmpleadoId { get; set; }
        public string EmpleadoNombre { get; set; }

        public int KioscoId { get; set; }
        public string KioscoNombre { get; set; }

        public int TipoDeGastoId { get; set; }
        public string TipoDeGastoNombre { get; set; }
    }

    // ─── FILTROS DE BÚSQUEDA ─────────────────────────
    public class GastoFiltrosDTO
    {
        public DateTime? FechaDesde { get; set; }
        public DateTime? FechaHasta { get; set; }
        public int? EmpleadoId { get; set; }
        public int? TipoDeGastoId { get; set; }
        public decimal? MontoMinimo { get; set; }
        public decimal? MontoMaximo { get; set; }
    }

    // ═══════════════════════════════════════════════════
    // TIPO DE GASTO
    // ═══════════════════════════════════════════════════

    // ─── CREAR TIPO DE GASTO ─────────────────────────
    public class CreateTipoDeGastoDTO
    {
        public string Nombre { get; set; }
        public string? Descripcion { get; set; }
    }

    // ─── ACTUALIZAR TIPO DE GASTO ────────────────────
    public class UpdateTipoDeGastoDTO
    {
        public int TipoDeGastoId { get; set; }
        public string Nombre { get; set; }
        public string? Descripcion { get; set; }
        public bool Activo { get; set; }
    }

    // ─── RESPUESTA DE TIPO DE GASTO ──────────────────
    public class TipoDeGastoResponseDTO
    {
        public int TipoDeGastoId { get; set; }
        public string Nombre { get; set; }
        public string? Descripcion { get; set; }
        public bool Activo { get; set; }
        public int CantidadGastos { get; set; }  // Cuántos gastos usan este tipo
        public decimal TotalGastos { get; set; }  // Suma de todos los gastos de este tipo
    }
}
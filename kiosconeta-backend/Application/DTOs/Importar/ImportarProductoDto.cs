namespace Application.DTOs.Producto
{
    // ─── Fila cruda leída del Excel ────────────────────────────────────────
    public class ImportarProductoFilaDTO
    {
        public int NumeroFila { get; set; } // fila real en el Excel (para mostrar errores)
        public string? CodigoBarra { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Categoria { get; set; } = string.Empty;
        public string? Distribuidor { get; set; }
        public decimal PrecioCosto { get; set; }
        public decimal PrecioVenta { get; set; }
        public int StockActual { get; set; }
        public int StockMinimo { get; set; }
        public bool Suelto { get; set; }
    }

    // ─── Resultado de la vista previa, fila por fila ───────────────────────
    public class ImportarProductoPreviewItemDTO
    {
        public int NumeroFila { get; set; }
        public ImportarProductoFilaDTO Datos { get; set; } = new();

        /// <summary>"Crear" | "Actualizar" | "Error"</summary>
        public string Accion { get; set; } = string.Empty;

        public int? ProductoIdExistente { get; set; }
        public bool CategoriaNueva { get; set; }
        public bool DistribuidorNuevo { get; set; }
        public List<string> Errores { get; set; } = new();

        // Para mostrar el "antes / después" cuando Accion = "Actualizar"
        public decimal? PrecioCostoAnterior { get; set; }
        public decimal? PrecioVentaAnterior { get; set; }
        public int? StockActualAnterior { get; set; }
        public int? StockMinimoAnterior { get; set; }
    }

    public class ImportarProductosPreviewResponseDTO
    {
        public List<ImportarProductoPreviewItemDTO> Items { get; set; } = new();
        public int TotalCrear { get; set; }
        public int TotalActualizar { get; set; }
        public int TotalErrores { get; set; }
    }

    // ─── Confirmación (lo que el usuario dejó tildado en la preview) ───────
    public class ConfirmarImportacionDTO
    {
        public List<ImportarProductoFilaDTO> Filas { get; set; } = new();
    }

    public class ImportarProductosResultadoDTO
    {
        public int Creados { get; set; }
        public int Actualizados { get; set; }
        public int CategoriasCreadas { get; set; }
        public int DistribuidoresCreados { get; set; }
        public List<string> Errores { get; set; } = new();
    }
}
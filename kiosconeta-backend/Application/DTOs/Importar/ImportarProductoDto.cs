

namespace Application.DTOs.Producto
{
    // ─── Fila cruda leída del Excel (ya normalizada según el mapeo) ────────
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
        public List<string> Advertencias { get; set; } = new();

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

    // ═══════════════════════════════════════════════════════════════════
    // MAPEO DE COLUMNAS (Excel "libre", no la plantilla fija)
    // ═══════════════════════════════════════════════════════════════════

    // ─── Una columna detectada en el archivo subido ─────────────────────
    public class ColumnaExcelDTO
    {
        public int Indice { get; set; }        // 1-based
        public string Letra { get; set; } = string.Empty; // "A", "B", "C"...
        public string? Encabezado { get; set; } // texto de la fila 1, si lo hay
    }

    // ─── Respuesta de "leer estructura": qué columnas hay + filas de muestra
    public class LeerEstructuraExcelResponseDTO
    {
        public List<ColumnaExcelDTO> Columnas { get; set; } = new();

        /// <summary>Primeras filas de datos: índice de columna → valor como texto</summary>
        public List<Dictionary<int, string>> FilasEjemplo { get; set; } = new();

        /// <summary>Sugerencia automática de mapeo, basada en los encabezados detectados</summary>
        public ColumnaMapeoDTO? MapeoSugerido { get; set; }
    }

    // ─── El mapeo que arma el usuario (o que le sugerimos) ──────────────
    public class ColumnaMapeoDTO
    {
        public int? CodigoBarraColumna { get; set; }
        public int NombreColumna { get; set; }
        public int CategoriaColumna { get; set; }
        public int? DistribuidorColumna { get; set; }
        public int PrecioCostoColumna { get; set; }
        public int PrecioVentaColumna { get; set; }
        public int StockActualColumna { get; set; }
        public int StockMinimoColumna { get; set; }
        public int? SueltoColumna { get; set; }
        public bool TieneEncabezados { get; set; } = true;
    }

    // ─── Body multipart para el endpoint de preview con mapeo ───────────
    public class ImportarPreviewRequestDTO
    {
        public Stream Archivo { get; set; } = null!;
        public int? CodigoBarraColumna { get; set; }
        public int NombreColumna { get; set; }
        public int CategoriaColumna { get; set; }
        public int? DistribuidorColumna { get; set; }
        public int PrecioCostoColumna { get; set; }
        public int PrecioVentaColumna { get; set; }
        public int StockActualColumna { get; set; }
        public int StockMinimoColumna { get; set; }
        public int? SueltoColumna { get; set; }
        public bool TieneEncabezados { get; set; } = true;
    }
}
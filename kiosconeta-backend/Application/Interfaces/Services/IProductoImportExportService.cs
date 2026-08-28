using Application.DTOs.Producto;

namespace Application.Interfaces.Services
{
    public interface IProductoImportExportService
    {
        /// <summary>Genera el Excel (.xlsx) con el catálogo completo del kiosco.</summary>
        Task<byte[]> ExportarExcelAsync(int kioscoId);

        /// <summary>
        /// Lee cualquier Excel subido y devuelve qué columnas detectó (con encabezados
        /// si los hay), unas filas de muestra, y una sugerencia automática de mapeo
        /// basada en el texto de los encabezados.
        /// </summary>
        Task<LeerEstructuraExcelResponseDTO> LeerEstructuraAsync(Stream archivoExcel);

        /// <summary>
        /// Parsea el Excel usando el mapeo de columnas indicado y arma la vista previa
        /// (crear / actualizar / error) sin persistir nada en la base de datos.
        /// </summary>
        Task<ImportarProductosPreviewResponseDTO> PreviewImportacionAsync(
            int kioscoId, Stream archivoExcel, ColumnaMapeoDTO mapeo);

        /// <summary>
        /// Persiste las filas confirmadas por el usuario: crea categorías/distribuidores
        /// que falten, y crea o actualiza los productos correspondientes.
        /// </summary>
        Task<ImportarProductosResultadoDTO> ConfirmarImportacionAsync(int kioscoId, ConfirmarImportacionDTO dto);
    }
}
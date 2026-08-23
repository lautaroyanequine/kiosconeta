using Application.DTOs.Producto;

namespace Application.Interfaces.Services
{
    public interface IProductoImportExportService
    {
        /// <summary>Genera el Excel (.xlsx) con el catálogo completo del kiosco.</summary>
        Task<byte[]> ExportarExcelAsync(int kioscoId);

        /// <summary>
        /// Parsea el Excel subido y arma la vista previa (crear / actualizar / error)
        /// sin persistir nada en la base de datos.
        /// </summary>
        Task<ImportarProductosPreviewResponseDTO> PreviewImportacionAsync(int kioscoId, Stream archivoExcel);

        /// <summary>
        /// Persiste las filas confirmadas por el usuario: crea categorías/distribuidores
        /// que falten, y crea o actualiza los productos correspondientes.
        /// </summary>
        Task<ImportarProductosResultadoDTO> ConfirmarImportacionAsync(int kioscoId, ConfirmarImportacionDTO dto);
    }
}
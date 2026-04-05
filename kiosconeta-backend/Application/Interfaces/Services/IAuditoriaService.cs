using Application.DTOs.Auditoria;

namespace Application.Interfaces.Services
{
    public interface IAuditoriaService
    {
        Task RegistrarAsync(
            int empleadoId,
            int kioscoId,
            string tipoEvento,
            string descripcion,
            object? datos = null,
            bool esSospechoso = false,
            string? motivoSospecha = null
        );

        Task<IEnumerable<AuditoriaLogResponseDTO>> GetByKioscoAsync(
            int kioscoId,
            DateTime? desde = null,
            DateTime? hasta = null
        );

        Task<IEnumerable<AuditoriaLogResponseDTO>> GetSospechososByKioscoAsync(int kioscoId);

        Task<IEnumerable<AuditoriaLogResponseDTO>> GetByEmpleadoAsync(
            int empleadoId,
            DateTime? desde = null,
            DateTime? hasta = null
        );
    }
}
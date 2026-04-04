using Domain.Entities;

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

        Task<IEnumerable<AuditoriaLog>> GetByKioscoAsync(
            int kioscoId,
            DateTime? desde = null,
            DateTime? hasta = null
        );

        Task<IEnumerable<AuditoriaLog>> GetSospechososByKioscoAsync(int kioscoId);

        Task<IEnumerable<AuditoriaLog>> GetByEmpleadoAsync(
            int empleadoId,
            DateTime? desde = null,
            DateTime? hasta = null
        );
    }
}
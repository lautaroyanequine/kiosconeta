using Application.Interfaces.Repository;
using Application.Interfaces.Services;
using Domain.Entities;
using Domain.Enums;
using System.Text.Json;

namespace Application.Services
{
    public class AuditoriaService : IAuditoriaService
    {
        private readonly IAuditoriaRepository _repo;

        public AuditoriaService(IAuditoriaRepository repo)
        {
            _repo = repo;
        }

        public async Task RegistrarAsync(
            int empleadoId, int kioscoId,
            string tipoEvento, string descripcion,
            object? datos = null,
            bool esSospechoso = false,
            string? motivoSospecha = null)
        {
            var log = new AuditoriaLog
            {
                EmpleadoId = empleadoId,
                KioscoId = kioscoId,
                TipoEvento = tipoEvento,
                Descripcion = descripcion,
                DatosJson = datos != null ? JsonSerializer.Serialize(datos) : null,
                EsSospechoso = esSospechoso,
                MotivoSospecha = motivoSospecha,
            };
            await _repo.RegistrarAsync(log);
        }

        public async Task<IEnumerable<AuditoriaLog>> GetByKioscoAsync(
            int kioscoId, DateTime? desde = null, DateTime? hasta = null)
            => await _repo.GetByKioscoAsync(kioscoId, desde, hasta);

        public async Task<IEnumerable<AuditoriaLog>> GetSospechososByKioscoAsync(int kioscoId)
            => await _repo.GetSospechososByKioscoAsync(kioscoId);

        public async Task<IEnumerable<AuditoriaLog>> GetByEmpleadoAsync(
            int empleadoId, DateTime? desde = null, DateTime? hasta = null)
            => await _repo.GetByEmpleadoAsync(empleadoId, desde, hasta);
    }
}
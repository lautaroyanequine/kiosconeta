using Application.DTOs.Auditoria;
using Application.Interfaces.Repository;
using Application.Interfaces.Services;
using Domain.Entities;
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
            int empleadoId,
            int kioscoId,
            string tipoEvento,
            string descripcion,
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

        public async Task<IEnumerable<AuditoriaLogResponseDTO>> GetByKioscoAsync(
            int kioscoId, DateTime? desde = null, DateTime? hasta = null)
        {
            var logs = await _repo.GetByKioscoAsync(kioscoId, desde, hasta);
            return logs.Select(MapToResponseDTO);
        }

        public async Task<IEnumerable<AuditoriaLogResponseDTO>> GetSospechososByKioscoAsync(int kioscoId)
        {
            var logs = await _repo.GetSospechososByKioscoAsync(kioscoId);
            return logs.Select(MapToResponseDTO);
        }

        public async Task<IEnumerable<AuditoriaLogResponseDTO>> GetByEmpleadoAsync(
            int empleadoId, DateTime? desde = null, DateTime? hasta = null)
        {
            var logs = await _repo.GetByEmpleadoAsync(empleadoId, desde, hasta);
            return logs.Select(MapToResponseDTO);
        }

        // 🔥 MAPPER
        private AuditoriaLogResponseDTO MapToResponseDTO(AuditoriaLog log)
        {
            return new AuditoriaLogResponseDTO
            {
                AuditoriaLogId = log.AuditoriaLogId,
                Fecha = log.Fecha,
                EmpleadoId = log.EmpleadoId,
                EmpleadoNombre = log.Empleado?.Nombre ?? "",
                TipoEvento = log.TipoEvento,
                Descripcion = log.Descripcion,
                DatosJson = log.DatosJson,
                EsSospechoso = log.EsSospechoso,
                MotivoSospecha = log.MotivoSospecha,
                KioscoId = log.KioscoId,
            };
        }
    }
}
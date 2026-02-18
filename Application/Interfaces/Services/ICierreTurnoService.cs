using Application.DTOs.CierreTurno;

namespace Application.Interfaces.Services
{
    public interface ICierreTurnoService
    {
        // Consultas
        Task<CierreTurnoResponseDTO?> GetByIdAsync(int id);
        Task<IEnumerable<CierreTurnoResponseDTO>> GetByKioscoIdAsync(int kioscoId);
        Task<TurnoActualDTO?> GetTurnoAbiertoAsync(int kioscoId);
        Task<IEnumerable<CierreTurnoResponseDTO>> GetPorFechaAsync(int kioscoId, DateTime fechaDesde, DateTime fechaHasta);

        // Comandos
        Task<CierreTurnoResponseDTO> AbrirTurnoAsync(AbrirTurnoDTO dto);
        Task<CierreTurnoResponseDTO> CerrarTurnoAsync(CerrarTurnoDTO dto);
    }
}
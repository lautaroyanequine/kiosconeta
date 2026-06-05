using Application.DTOs.CierreTurno;
using Application.DTOs.Common;

namespace Application.Interfaces.Services
{
    public interface ICierreTurnoService
    {
        // Consultas
        Task<CierreTurnoResponseDTO?> GetByIdAsync(int id);
        Task<ResultadoPaginadoDTO<CierreTurnoResponseDTO>> GetByKioscoIdAsync(int kioscoId, int pagina = 1, int tamanoPagina = 10);
        Task<TurnoActualDTO?> GetTurnoAbiertoAsync(int kioscoId);
        Task<IEnumerable<CierreTurnoResponseDTO>> GetPorFechaAsync(int kioscoId, DateTime fechaDesde, DateTime fechaHasta);

        // Comandos
        Task<CierreTurnoResponseDTO> AbrirTurnoAsync(AbrirTurnoDTO dto);
        Task<CierreTurnoResponseDTO> CerrarTurnoAsync(int kioscoId, CerrarTurnoDTO dto,int empleadoId);
    }
}
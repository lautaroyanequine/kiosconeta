using Domain.Entities;
using Domain.Enums;

namespace Application.Interfaces.Repository
{
    public interface ICierreTurnoRepository
    {
        // Consultas
        Task<CierreTurno?> GetByIdAsync(int id);
        Task<IEnumerable<CierreTurno>> GetAllAsync();
        Task<IEnumerable<CierreTurno>> GetByKioscoIdAsync(int kioscoId, int pagina = 1, int tamanoPagina = 10);
        Task<int> ContarByKioscoIdAsync(int kioscoId);
        Task<CierreTurno?> GetTurnoAbiertoAsync(int kioscoId);
        Task<IEnumerable<CierreTurno>> GetPorFechaAsync(int kioscoId, DateTime fechaDesde, DateTime fechaHasta);
        Task<(decimal TotalVentas, decimal TotalEfectivo, decimal TotalVirtual, decimal GananciaTotal, int Cantidad)> GetTotalesVentasAsync(int cierreTurnoId);

        // Comandos
        Task<CierreTurno> CreateAsync(CierreTurno cierreTurno);
        Task<CierreTurno> UpdateAsync(CierreTurno cierreTurno);

        // Validaciones
        Task<bool> ExistsAsync(int id);
        Task<bool> TieneTurnoAbiertoAsync(int kioscoId);

        // Empleados del turno
        Task AddEmpleadoAsync(int cierreTurnoId, int empleadoId);
        Task<IEnumerable<CierreTurnoEmpleado>> GetEmpleadosAsync(int cierreTurnoId);
    }
}
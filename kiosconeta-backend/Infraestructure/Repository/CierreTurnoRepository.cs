using Application.Interfaces.Repository;
using Domain.Entities;
using Domain.Enums;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infraestructure.Repository
{
    public class CierreTurnoRepository : ICierreTurnoRepository
    {
        private readonly AppDbContext _context;

        public CierreTurnoRepository(AppDbContext context)
        {
            _context = context;
        }

        // ========== CONSULTAS ==========
        public async Task<CierreTurno?> GetByIdAsync(int id)
        {
            return await _context.CierresTurno
                .Include(ct => ct.Kiosco)
                .Include(ct => ct.Turno)
                .Include(ct => ct.CierreTurnoEmpleados)
                    .ThenInclude(cte => cte.Empleado)
                .Include(ct => ct.Ventas)
                    .ThenInclude(v => v.MetodoPago)
                .Include(ct => ct.Ventas)           // ← AGREGAR
                    .ThenInclude(v => v.ProductoVentas)
                        .ThenInclude(pv => pv.Producto) // ← AGREGAR
                .FirstOrDefaultAsync(ct => ct.CierreTurnoId == id);
        }

        public async Task<(decimal TotalVentas, decimal TotalEfectivo, decimal TotalVirtual, decimal GananciaTotal, int Cantidad)> GetTotalesVentasAsync(int cierreTurnoId)
        {
            var ventasData = await _context.Ventas
                .Where(v => v.CierreTurnoId == cierreTurnoId && !v.Anulada)
                .Select(v => new
                {
                    v.Total,
                    v.PrecioCosto,
                    EsEfectivo = v.MetodoPago.Nombre.ToLower().Contains("efectivo")
                })
                .ToListAsync();

            return (
                ventasData.Sum(v => v.Total),
                ventasData.Where(v => v.EsEfectivo).Sum(v => v.Total),
                ventasData.Where(v => !v.EsEfectivo).Sum(v => v.Total),
                ventasData.Sum(v => v.Total - v.PrecioCosto),
                ventasData.Count
            );
        }

        public async Task<CierreTurno?> GetTurnoAbiertoAsync(int kioscoId)
        {
            return await _context.CierresTurno
                .Include(ct => ct.Kiosco)
                .Include(CT => CT.Turno)
                .Include(ct => ct.CierreTurnoEmpleados)
                    .ThenInclude(cte => cte.Empleado)
                .Include(ct => ct.Ventas)
                    .ThenInclude(v => v.MetodoPago)
                .Include(ct => ct.Ventas)           // ← AGREGAR
                    .ThenInclude(v => v.ProductoVentas)
                        .ThenInclude(pv => pv.Producto) // ← AGREGAR
                .FirstOrDefaultAsync(ct => ct.KioscoId == kioscoId
                                        && ct.Estado == EstadoCierre.Abierto);
        }

        // REEMPLAZAR GetByKioscoIdAsync
        public async Task<IEnumerable<CierreTurno>> GetByKioscoIdAsync(
            int kioscoId, int pagina = 1, int tamanoPagina = 10)
        {
            return await _context.CierresTurno
                .Include(ct => ct.Kiosco)
                .Include(ct => ct.Turno)
                .Include(ct => ct.CierreTurnoEmpleados)
                    .ThenInclude(cte => cte.Empleado)
                // Sin Include de Ventas — se calculan aparte
                .Where(ct => ct.KioscoId == kioscoId)
                .OrderByDescending(ct => ct.FechaApertura)
                .Skip((pagina - 1) * tamanoPagina)
                .Take(tamanoPagina)
                .ToListAsync();
        }

        public async Task<int> ContarByKioscoIdAsync(int kioscoId)
        {
            return await _context.CierresTurno
                .CountAsync(ct => ct.KioscoId == kioscoId);
        }

        public async Task<IEnumerable<CierreTurno>> GetAllAsync()
        {
            return await _context.CierresTurno
                .Include(ct => ct.Kiosco)
                .Include(ct => ct.Turno)
                .Include(ct => ct.CierreTurnoEmpleados)
                    .ThenInclude(cte => cte.Empleado)
                .OrderByDescending(ct => ct.FechaApertura)
                .ToListAsync();
        }



        public async Task<IEnumerable<CierreTurno>> GetPorFechaAsync(int kioscoId, DateTime fechaDesde, DateTime fechaHasta)
        {
            return await _context.CierresTurno
                .Include(ct => ct.Kiosco)
                .Include(ct => ct.Turno)
                .Include(ct => ct.CierreTurnoEmpleados)
                    .ThenInclude(cte => cte.Empleado)
                .Where(ct => ct.KioscoId == kioscoId
                          && ct.FechaApertura >= fechaDesde
                          && ct.FechaApertura <= fechaHasta)
                .OrderByDescending(ct => ct.FechaApertura)
                .ToListAsync();
        }

        // ========== COMANDOS ==========

        public async Task<CierreTurno> CreateAsync(CierreTurno cierreTurno)
        {
            _context.CierresTurno.Add(cierreTurno);
            await _context.SaveChangesAsync();
            return await GetByIdAsync(cierreTurno.CierreTurnoId)
                ?? throw new Exception("Error al recargar cierre de turno");
        }

        public async Task<CierreTurno> UpdateAsync(CierreTurno cierreTurno)
        {
            _context.CierresTurno.Update(cierreTurno);
            await _context.SaveChangesAsync();
            return await GetByIdAsync(cierreTurno.CierreTurnoId)
                ?? throw new Exception("Error al recargar cierre de turno");
        }

        // ========== VALIDACIONES ==========

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.CierresTurno
                .AnyAsync(ct => ct.CierreTurnoId == id);
        }

        public async Task<bool> TieneTurnoAbiertoAsync(int kioscoId)
        {
            return await _context.CierresTurno
                .AnyAsync(ct => ct.KioscoId == kioscoId
                             && ct.Estado == EstadoCierre.Abierto);
        }

        // ========== EMPLEADOS ==========

        public async Task AddEmpleadoAsync(int cierreTurnoId, int empleadoId)
        {
            var existe = await _context.CierreTurnoEmpleados
                .AnyAsync(cte => cte.CierreTurnoId == cierreTurnoId
                              && cte.EmpleadoId == empleadoId);

            if (!existe)
            {
                _context.CierreTurnoEmpleados.Add(new CierreTurnoEmpleado
                {
                    CierreTurnoId = cierreTurnoId,
                    EmpleadoId = empleadoId
                });
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<CierreTurnoEmpleado>> GetEmpleadosAsync(int cierreTurnoId)
        {
            return await _context.CierreTurnoEmpleados
                .Include(cte => cte.Empleado)
                .Where(cte => cte.CierreTurnoId == cierreTurnoId)
                .ToListAsync();
        }
    }
}  
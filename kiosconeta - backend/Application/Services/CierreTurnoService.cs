using Application.DTOs.CierreTurno;
using Application.Interfaces.Repository;
using Application.Interfaces.Services;
using Domain.Entities;
using Domain.Enums;

namespace Application.Services
{
    public class CierreTurnoService : ICierreTurnoService
    {
        private readonly ICierreTurnoRepository _cierreTurnoRepository;
        private readonly IVentaRepository _ventaRepository;

        public CierreTurnoService(
            ICierreTurnoRepository cierreTurnoRepository,
            IVentaRepository ventaRepository)
        {
            _cierreTurnoRepository = cierreTurnoRepository;
            _ventaRepository = ventaRepository;
        }

        // ========== CONSULTAS ==========

        public async Task<CierreTurnoResponseDTO?> GetByIdAsync(int id)
        {
            var cierre = await _cierreTurnoRepository.GetByIdAsync(id);
            if (cierre == null) return null;

            return await MapToResponseDTO(cierre);
        }

        public async Task<IEnumerable<CierreTurnoResponseDTO>> GetByKioscoIdAsync(int kioscoId)
        {
            var cierres = await _cierreTurnoRepository.GetByKioscoIdAsync(kioscoId);
            var result = new List<CierreTurnoResponseDTO>();
            foreach (var c in cierres)
                result.Add(await MapToResponseDTO(c));
            return result;
        }

        public async Task<TurnoActualDTO?> GetTurnoAbiertoAsync(int kioscoId)
        {
            var turno = await _cierreTurnoRepository.GetTurnoAbiertoAsync(kioscoId);
            if (turno == null) return null;

            // Obtener estadísticas del turno actual
            var ventas = turno.Ventas?.Where(v => !v.Anulada).ToList() ?? new List<Venta>();
            var totalVentas = ventas.Sum(v => v.Total);
            var totalEfectivo = ventas.Where(v => v.MetodoPago.Nombre.ToLower().Contains("efectivo"))
                                     .Sum(v => v.Total);
            var totalVirtual = ventas.Where(v => !v.MetodoPago.Nombre.ToLower().Contains("efectivo"))
                                    .Sum(v => v.Total);

            return new TurnoActualDTO
            {
                CierreTurnoId = turno.CierreTurnoId,
                FechaApertura = turno.Fecha,
                EfectivoInicial = turno.Efectivo,
                CantidadVentas = ventas.Count,
                TotalVentas = totalVentas,
                TotalEfectivo = totalEfectivo,
                TotalVirtual = totalVirtual,
                Empleados = turno.cierreTurnoEmpleados?.Select(e => e.Empleado.Nombre).ToList()
                    ?? new List<string>()
            };
        }

        public async Task<IEnumerable<CierreTurnoResponseDTO>> GetPorFechaAsync(
            int kioscoId, DateTime fechaDesde, DateTime fechaHasta)
        {
            var cierres = await _cierreTurnoRepository.GetPorFechaAsync(kioscoId, fechaDesde, fechaHasta);
            var result = new List<CierreTurnoResponseDTO>();
            foreach (var c in cierres)
                result.Add(await MapToResponseDTO(c));
            return result;
        }

        // ========== COMANDOS ==========

        public async Task<CierreTurnoResponseDTO> AbrirTurnoAsync(AbrirTurnoDTO dto)
        {
            // Validar que no haya un turno abierto
            var tieneAbierto = await _cierreTurnoRepository.TieneTurnoAbiertoAsync(dto.KioscoId);
            if (tieneAbierto)
                throw new InvalidOperationException(
                    "Ya existe un turno abierto. Debe cerrar el turno actual antes de abrir uno nuevo.");

            if (dto.EfectivoInicial < 0)
                throw new InvalidOperationException("El efectivo inicial no puede ser negativo");

            var cierre = new CierreTurno
            {
                KioscoId = dto.KioscoId,
                Fecha = DateTime.Now,
                Estado = EstadoCierre.Abierto,
                Efectivo = dto.EfectivoInicial,
                Virtual = 0,
                MontoEsperado = 0,
                MontoReal = 0,
                Diferencia = 0,
                CantidadVentas = 0,
                Observaciones = dto.Observaciones ?? ""
            };

            var creado = await _cierreTurnoRepository.CreateAsync(cierre);

            // Agregar el empleado que abrió el turno
            await _cierreTurnoRepository.AddEmpleadoAsync(creado.CierreTurnoId, dto.EmpleadoId);

            return await MapToResponseDTO(creado);
        }

        public async Task<CierreTurnoResponseDTO> CerrarTurnoAsync(CerrarTurnoDTO dto)
        {
            var cierre = await _cierreTurnoRepository.GetByIdAsync(dto.CierreTurnoId);
            if (cierre == null)
                throw new KeyNotFoundException($"Cierre de turno con ID {dto.CierreTurnoId} no encontrado");

            if (cierre.Estado != EstadoCierre.Abierto)
                throw new InvalidOperationException("El turno ya está cerrado");

            // ─── CALCULAR ESTADÍSTICAS DEL TURNO ───────

            var ventas = cierre.Ventas?.Where(v => !v.Anulada).ToList() ?? new List<Venta>();

            var totalVentas = ventas.Sum(v => v.Total);
            var totalEfectivo = ventas.Where(v => v.MetodoPago.Nombre.ToLower().Contains("efectivo"))
                                     .Sum(v => v.Total);
            var totalVirtual = ventas.Where(v => !v.MetodoPago.Nombre.ToLower().Contains("efectivo"))
                                    .Sum(v => v.Total);

            // TODO: Agregar gastos cuando esté el módulo
            var totalGastos = 0m;

            // ─── CALCULAR MONTOS ESPERADOS ─────────────

            var efectivoEsperado = cierre.Efectivo + totalEfectivo - totalGastos;
            var virtualEsperado = totalVirtual;

            var montoEsperado = efectivoEsperado + virtualEsperado;
            var montoReal = dto.EfectivoFinal + dto.VirtualFinal;
            var diferencia = montoReal - montoEsperado;

            // ─── ACTUALIZAR CIERRE ─────────────────────

            cierre.Estado = EstadoCierre.Cerrado;
            cierre.CantidadVentas = ventas.Count;
            cierre.MontoEsperado = montoEsperado;
            cierre.MontoReal = montoReal;
            cierre.Diferencia = diferencia;
            cierre.Virtual = dto.VirtualFinal;
            cierre.Observaciones = string.IsNullOrWhiteSpace(dto.Observaciones)
                ? cierre.Observaciones
                : $"{cierre.Observaciones}\n{dto.Observaciones}";

            var actualizado = await _cierreTurnoRepository.UpdateAsync(cierre);
            return await MapToResponseDTO(actualizado);
        }

        // ========== MAPEO ==========

        private async Task<CierreTurnoResponseDTO> MapToResponseDTO(CierreTurno cierre)
        {
            var ventas = cierre.Ventas?.Where(v => !v.Anulada).ToList() ?? new List<Venta>();

            var totalVentas = ventas.Sum(v => v.Total);
            var totalEfectivo = ventas.Where(v => v.MetodoPago?.Nombre?.ToLower().Contains("efectivo") == true)
                                     .Sum(v => v.Total);
            var totalVirtual = ventas.Where(v => v.MetodoPago?.Nombre?.ToLower().Contains("efectivo") != true)
                                    .Sum(v => v.Total);

            return new CierreTurnoResponseDTO
            {
                CierreTurnoId = cierre.CierreTurnoId,
                Fecha = cierre.Fecha,
                Estado = cierre.Estado,
                EstadoNombre = cierre.Estado.ToString(),

                EfectivoInicial = cierre.Efectivo,
                EfectivoFinal = cierre.Estado == EstadoCierre.Cerrado
                    ? cierre.MontoReal - cierre.Virtual
                    : 0,
                VirtualFinal = cierre.Virtual,
                MontoEsperado = cierre.MontoEsperado,
                MontoReal = cierre.MontoReal,
                Diferencia = cierre.Diferencia,

                CantidadVentas = ventas.Count,
                TotalVentas = totalVentas,
                TotalEfectivo = totalEfectivo,
                TotalVirtual = totalVirtual,
                TotalGastos = 0, // TODO: implementar cuando esté módulo Gastos

                Observaciones = cierre.Observaciones,

                KioscoId = cierre.KioscoId,
                KioscoNombre = cierre.Kiosco?.Nombre ?? "",

                Empleados = cierre.cierreTurnoEmpleados?.Select(cte => new EmpleadoTurnoDTO
                {
                    EmpleadoId = cte.EmpleadoId,
                    EmpleadoNombre = cte.Empleado?.Nombre ?? ""
                }).ToList() ?? new List<EmpleadoTurnoDTO>()
            };
        }
    }
}
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
        private readonly IGastoRepository _gastoRepository;

        public CierreTurnoService(
            ICierreTurnoRepository cierreTurnoRepository,
            IVentaRepository ventaRepository,
            IGastoRepository gastoRepository)
        {
            _cierreTurnoRepository = cierreTurnoRepository;
            _ventaRepository = ventaRepository;
            _gastoRepository = gastoRepository;
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

            // Calcular estadísticas en tiempo real del turno actual
            var ventas = turno.Ventas?.Where(v => !v.Anulada).ToList() ?? new List<Venta>();

            var totalVentas = ventas.Sum(v => v.Total);
            var totalEfectivo = ventas.Where(v => v.MetodoPago.Nombre.ToLower().Contains("efectivo"))
                                     .Sum(v => v.Total);
            var totalVirtual = ventas.Where(v => !v.MetodoPago.Nombre.ToLower().Contains("efectivo"))
                                    .Sum(v => v.Total);

            // Calcular gastos del turno
            var gastos = await _gastoRepository.GetByFechaAsync(turno.FechaApertura, DateTime.Now);
            gastos = gastos.Where(g => g.KioscoId == kioscoId);
            var totalGastos = gastos.Sum(g => g.Monto);

            return new TurnoActualDTO
            {
                CierreTurnoId = turno.CierreTurnoId,
                FechaApertura = turno.FechaApertura,
                EfectivoInicial = turno.EfectivoInicial,
                CantidadVentas = ventas.Count,
                TotalVentas = totalVentas,
                TotalEfectivo = totalEfectivo,
                TotalVirtual = totalVirtual,
                TotalGastos = totalGastos,
                EfectivoEsperado = turno.EfectivoInicial + totalEfectivo - totalGastos,
                Empleados = turno.CierreTurnoEmpleados?.Select(e => e.Empleado.Nombre).ToList()
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
            // Validación de orquestación (infraestructura)
            var turnoAbierto = await _cierreTurnoRepository
                .GetTurnoAbiertoAsync(dto.KioscoId);

            if (turnoAbierto != null)
                throw new InvalidOperationException(
                    "Ya existe un turno abierto para este kiosco.");

            // El dominio crea el turno
            var cierre = CierreTurno.Abrir(
                dto.KioscoId,
                dto.EfectivoInicial,
                dto.Observaciones ?? string.Empty
            );

            await _cierreTurnoRepository.CreateAsync(cierre);

            await _cierreTurnoRepository
                .AddEmpleadoAsync(cierre.CierreTurnoId, dto.EmpleadoId);

            return await MapToResponseDTO(cierre);
        }
        public async Task<CierreTurnoResponseDTO>
            CerrarTurnoAsync(int kioscoId, CerrarTurnoDTO dto)
        {
            var cierre = await _cierreTurnoRepository
                .GetTurnoAbiertoAsync(kioscoId);

            if (cierre == null)
                throw new InvalidOperationException("No existe turno abierto.");

            // Obtener ventas válidas
            var ventas = cierre.Ventas?
                .Where(v => !v.Anulada)
                .ToList() ?? new List<Venta>();

            var totalEfectivo = ventas
                .Where(v => v.MetodoPago.Nombre == "Efectivo")
                .Sum(v => v.Total);


            var totalVirtual = ventas
                .Where(v => v.MetodoPago.Nombre == "Virtual")
                .Sum(v => v.Total);
            // Obtener gastos
            var gastos = await _gastoRepository
                .GetByFechaAsync(cierre.FechaApertura, DateTime.Now);

            gastos = gastos.Where(g => g.KioscoId == kioscoId);

            var totalGastos = gastos.Sum(g => g.Monto);

            // 🔥 El dominio hace todo el trabajo real
            cierre.Cerrar(
                totalEfectivo,
                totalVirtual,
                totalGastos,
                dto.EfectivoContado,
                dto.VirtualAcreditado,
                ventas.Count,
                dto.Observaciones ?? string.Empty
            );

            await _cierreTurnoRepository.UpdateAsync(cierre);

            return await MapToResponseDTO(cierre);
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

            // Calcular gastos
            decimal totalGastos = 0;
            if (cierre.Estado == EstadoCierre.Cerrado)
            {
                var gastos = await _gastoRepository.GetByFechaAsync(cierre.FechaApertura, DateTime.Now);
                gastos = gastos.Where(g => g.KioscoId == cierre.KioscoId);
                totalGastos = gastos.Sum(g => g.Monto);
            }

            return new CierreTurnoResponseDTO
            {
                CierreTurnoId = cierre.CierreTurnoId,
                Fecha = cierre.FechaApertura,
                Estado = cierre.Estado,
                EstadoNombre = cierre.Estado.ToString(),

                EfectivoInicial = cierre.EfectivoInicial,
                EfectivoFinal = cierre.Estado == EstadoCierre.Cerrado ? cierre.EfectivoFinal : 0,
                VirtualFinal = cierre.VirtualFinal,
                MontoEsperado = cierre.MontoEsperado,
                MontoReal = cierre.MontoReal,
                Diferencia = cierre.Diferencia,

                CantidadVentas = ventas.Count,
                TotalVentas = totalVentas,
                TotalEfectivo = totalEfectivo,
                TotalVirtual = totalVirtual,
                TotalGastos = totalGastos,

                Observaciones = cierre.Observaciones,

                KioscoId = cierre.KioscoId,
                KioscoNombre = cierre.Kiosco?.Nombre ?? "",

                Empleados = cierre.CierreTurnoEmpleados?.Select(cte => new EmpleadoTurnoDTO
                {
                    EmpleadoId = cte.EmpleadoId,
                    EmpleadoNombre = cte.Empleado?.Nombre ?? ""
                }).ToList() ?? new List<EmpleadoTurnoDTO>()
            };
        }
    }
}
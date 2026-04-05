using Application.DTOs.CierreTurno;
using Application.Interfaces.Repository;
using Application.Interfaces.Services;
using Domain.Entities;
using System.Security.Claims;

using Domain.Enums;

namespace Application.Services
{
    public class CierreTurnoService : ICierreTurnoService
    {
        private readonly ICierreTurnoRepository _cierreTurnoRepository;
        private readonly IVentaRepository _ventaRepository;
        private readonly IGastoRepository _gastoRepository;
        private readonly IAuditoriaService _auditoriaService;

        public CierreTurnoService(
            ICierreTurnoRepository cierreTurnoRepository,
            IVentaRepository ventaRepository,
            IGastoRepository gastoRepository,IAuditoriaService auditoriaService)
        {
            _cierreTurnoRepository = cierreTurnoRepository;
            _ventaRepository = ventaRepository;
            _gastoRepository = gastoRepository;
            _auditoriaService = auditoriaService;
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
            var gastos = await _gastoRepository.GetByCierreTurnoIdAsync(turno.CierreTurnoId);
            var totalGastos = gastos.Sum(g => g.Monto);

            return new TurnoActualDTO
            {
                CierreTurnoId = turno.CierreTurnoId,
                TurnoId = turno.TurnoId, 
                TurnoNombre = turno.Turno?.Nombre ?? "",
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
                dto.Observaciones ?? string.Empty,dto.TurnoId
         
            );

            await _cierreTurnoRepository.CreateAsync(cierre);

            await _cierreTurnoRepository
                .AddEmpleadoAsync(cierre.CierreTurnoId, dto.EmpleadoId);

            return await MapToResponseDTO(cierre);
        }
        public async Task<CierreTurnoResponseDTO>CerrarTurnoAsync(int kioscoId, CerrarTurnoDTO dto , int empleadoId)
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
            // Obtener gastos del turno (filtro exacto por CierreTurnoId)
            var gastos = await _gastoRepository
                .GetByCierreTurnoIdAsync(cierre.CierreTurnoId);

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
            // Registrar en auditoría
            var diferencia = Math.Abs(cierre.Diferencia);
            var esSospechoso = diferencia > 500; // más de $500 de diferencia

            await _auditoriaService.RegistrarAsync(
            empleadoId: empleadoId,
            kioscoId: kioscoId,
            tipoEvento: esSospechoso
                ? TipoEventoAuditoria.TurnoCerradoConDiferencia
                : TipoEventoAuditoria.TurnoCerrado,
            descripcion: $"Turno cerrado. Diferencia de caja: ${cierre.Diferencia:F2}. Ventas: {ventas.Count}",
            datos: new
            {
                cierreTurnoId = cierre.CierreTurnoId,
                diferencia = cierre.Diferencia,
                montoEsperado = cierre.MontoEsperado,
                montoReal = cierre.MontoReal
            },
            esSospechoso: esSospechoso,
            motivoSospecha: esSospechoso
                ? $"Diferencia de caja mayor a $500: ${cierre.Diferencia:F2}"
                : null
        );
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
            var gananciaTotal = ventas
            .SelectMany(v => v.ProductoVentas ?? new List<ProductoVenta>())
            .Sum(pv => (pv.PrecioUnitario - (pv.Producto?.PrecioCosto ?? 0)) * pv.Cantidad);

            // Calcular gastos del turno (filtro exacto por CierreTurnoId, aplica siempre)
            var gastos = await _gastoRepository.GetByCierreTurnoIdAsync(cierre.CierreTurnoId);
            var totalGastos = gastos.Sum(g => g.Monto);

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
                TurnoId = cierre.TurnoId,
                TurnoNombre = cierre.Turno?.Nombre ?? "",
                CantidadVentas = ventas.Count,
                TotalVentas = totalVentas,
                TotalEfectivo = totalEfectivo,
                TotalVirtual = totalVirtual,
                TotalGastos = totalGastos,

                FechaCierre = cierre.FechaCierre,        
  
                GananciaTotal = gananciaTotal,

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
using Application.DTOs.CierreTurno;
using Application.DTOs.Common;
using Application.Interfaces.Repository;
using Application.Interfaces.Services;
using Domain.Entities;
using Domain.Enums;
using System.Security.Claims;

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

        public async Task<ResultadoPaginadoDTO<CierreTurnoResponseDTO>> GetByKioscoIdAsync(
    int kioscoId, int pagina = 1, int tamanoPagina = 10)
        {
            var total = await _cierreTurnoRepository.ContarByKioscoIdAsync(kioscoId);
            var cierres = await _cierreTurnoRepository.GetByKioscoIdAsync(kioscoId, pagina, tamanoPagina);

            var result = new List<CierreTurnoResponseDTO>();
            foreach (var c in cierres)
                result.Add(await MapToResponseDTO(c));

            return new ResultadoPaginadoDTO<CierreTurnoResponseDTO>
            {
                Items = result,
                TotalItems = total,
                Pagina = pagina,
                TamanoPagina = tamanoPagina,
                TotalPaginas = (int)Math.Ceiling(total / (double)tamanoPagina)
            };
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
                VirtualInicial = turno.VirtualInicial,
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
            dto.VirtualInicial,  
            dto.Observaciones ?? string.Empty,
            dto.TurnoId,
            dto.FechaDispositivo
        );

            await _cierreTurnoRepository.CreateAsync(cierre);

            await _cierreTurnoRepository
                .AddEmpleadoAsync(cierre.CierreTurnoId, dto.EmpleadoId);

            return await MapToResponseDTO(cierre);
        }
        public async Task<CierreTurnoResponseDTO> CerrarTurnoAsync(int kioscoId, CerrarTurnoDTO dto, int empleadoId)
        {
            var cierre = await _cierreTurnoRepository.GetTurnoAbiertoAsync(kioscoId);
            if (cierre == null)
                throw new InvalidOperationException("No existe turno abierto.");

            // Obtener ventas válidas del turno
            var ventas = cierre.Ventas?
                .Where(v => !v.Anulada)
                .ToList() ?? new List<Venta>();

            // ── TOTALES POR MÉTODO DE PAGO ────────────────────────────────────────
            var totalEfectivo = ventas
                .Where(v => v.MetodoPago != null &&
                            v.MetodoPago.Nombre.Trim().ToLower().Contains("efectivo"))
                .Sum(v => v.Total);

            var totalVirtual = ventas
                .Where(v => v.MetodoPago != null &&
                            !v.MetodoPago.Nombre.Trim().ToLower().Contains("efectivo"))
                .Sum(v => v.Total);

            // ── DIAGNÓSTICO (solo en desarrollo, borrar en producción) ────────────
            if (ventas.Any() && totalEfectivo == 0 && totalVirtual == 0)
            {
                var ventasSinMetodo = ventas.Where(v => v.MetodoPago == null).ToList();
                if (ventasSinMetodo.Any())
                {
                    totalEfectivo = ventas.Sum(v => v.Total);
                    totalVirtual = 0;
                }
            }

            // ── GASTOS ────────────────────────────────────────────────────────────
            var gastos = await _gastoRepository
                .GetByCierreTurnoIdAsync(cierre.CierreTurnoId);
            var totalGastos = gastos.Sum(g => g.Monto);

            // ── CERRAR ────────────────────────────────────────────────────────────
            cierre.Cerrar(
                totalEfectivo,
                totalVirtual,
                totalGastos,
                dto.EfectivoContado,
                dto.VirtualAcreditado,
                dto.EfectivoFinalFondo,
                dto.VirtualFinalFondo,
                ventas.Count,
                dto.Observaciones ?? string.Empty,
                dto.FechaDispositivo
            );

            await _cierreTurnoRepository.UpdateAsync(cierre);

            // ── AUDITORÍA ─────────────────────────────────────────────────────────
            var diferencia = Math.Abs(cierre.Diferencia);
            var esSospechoso = diferencia > 500;

            await _auditoriaService.RegistrarAsync(
                empleadoId: empleadoId,
                kioscoId: kioscoId,
                tipoEvento: esSospechoso
                                   ? TipoEventoAuditoria.TurnoCerradoConDiferencia
                                   : TipoEventoAuditoria.TurnoCerrado,
                descripcion: $"Turno cerrado. Diferencia: ${cierre.Diferencia:F2}. " +
                               $"Efectivo ventas: ${totalEfectivo:F2}. " +
                               $"Virtual ventas: ${totalVirtual:F2}. " +
                               $"Ventas: {ventas.Count}",
                datos: new
                {
                    cierreTurnoId = cierre.CierreTurnoId,
                    diferencia = cierre.Diferencia,
                    montoEsperado = cierre.MontoEsperado,
                    montoReal = cierre.MontoReal,
                    totalEfectivo,
                    totalVirtual,
                    totalGastos,
                    efectivoContado = dto.EfectivoContado,
                    virtualAcreditado = dto.VirtualAcreditado,
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
            // ── TOTALES VÍA REPOSITORIO (sin cargar ventas completas) ─────────────
            var (totalVentas, totalEfectivo, totalVirtual, gananciaTotal, cantidadVentas) =
                await _cierreTurnoRepository.GetTotalesVentasAsync(cierre.CierreTurnoId);

            var gastos = await _gastoRepository.GetByCierreTurnoIdAsync(cierre.CierreTurnoId);
            var totalGastos = gastos.Sum(g => g.Monto);

            // ── EFECTIVO (CÁLCULO SIN FONDO) ──────────────────────────────────────
            var efectivoEsperadoSinFondo = totalEfectivo - totalGastos;
            var efectivoContadoSinFondo = cierre.Estado == EstadoCierre.Cerrado ? cierre.EfectivoFinal : 0;
            var diferenciaEfectivo = cierre.Estado == EstadoCierre.Cerrado
                ? efectivoContadoSinFondo - efectivoEsperadoSinFondo
                : 0;

            // ── VIRTUAL (CÁLCULO SIN FONDO) ───────────────────────────────────────
            var virtualEsperadoSinFondo = totalVirtual;
            var virtualContadoSinFondo = cierre.Estado == EstadoCierre.Cerrado ? cierre.VirtualFinal : 0;
            var diferenciaVirtual = cierre.Estado == EstadoCierre.Cerrado
                ? virtualContadoSinFondo - virtualEsperadoSinFondo
                : 0;

            // ── DIFERENCIA TOTAL (SIN FONDO) ──────────────────────────────────────
            var diferenciaTotal = diferenciaEfectivo + diferenciaVirtual;

            // ── TOTALES GLOBALES (CON FONDO) ──────────────────────────────────────
            var montoEsperadoGlobal = cierre.EfectivoInicial + cierre.VirtualInicial + totalVentas - totalGastos;
            var montoRealGlobal = efectivoContadoSinFondo + virtualContadoSinFondo + cierre.EfectivoFinalFondo + cierre.VirtualFinalFondo;

            return new CierreTurnoResponseDTO
            {
                CierreTurnoId = cierre.CierreTurnoId,
                Fecha = cierre.FechaApertura,
                Estado = cierre.Estado,
                EstadoNombre = cierre.Estado.ToString(),
                EfectivoInicial = cierre.EfectivoInicial,
                VirtualInicial = cierre.VirtualInicial,
                EfectivoFinal = efectivoContadoSinFondo,
                VirtualFinal = virtualContadoSinFondo,
                MontoEsperado = montoEsperadoGlobal,
                MontoReal = montoRealGlobal,
                Diferencia = diferenciaTotal,
                TurnoId = cierre.TurnoId,
                TurnoNombre = cierre.Turno?.Nombre ?? "",
                CantidadVentas = cantidadVentas,
                TotalVentas = totalVentas,
                TotalEfectivo = totalEfectivo,
                TotalVirtual = totalVirtual,
                EfectivoFinalFondo = cierre.EfectivoFinalFondo,
                VirtualFinalFondo = cierre.VirtualFinalFondo,
                DiferenciaEfectivo = diferenciaEfectivo,
                DiferenciaVirtual = diferenciaVirtual,
                TotalGastos = totalGastos,
                FechaCierre = cierre.FechaCierre,
                GananciaTotal = gananciaTotal,
                Observaciones = cierre.Observaciones,
                KioscoId = cierre.KioscoId,
                KioscoNombre = cierre.Kiosco?.Nombre ?? "",
                Empleados = cierre.CierreTurnoEmpleados?
                    .Select(cte => new EmpleadoTurnoDTO
                    {
                        EmpleadoId = cte.EmpleadoId,
                        EmpleadoNombre = cte.Empleado?.Nombre ?? ""
                    }).ToList() ?? new List<EmpleadoTurnoDTO>()
            };
        }
    }
}
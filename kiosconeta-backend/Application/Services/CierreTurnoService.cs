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
            var gastos = await _gastoRepository.GetByFechaAsync(turno.Fecha, DateTime.Now);
            gastos = gastos.Where(g => g.KioscoId == kioscoId);
            var totalGastos = gastos.Sum(g => g.Monto);

            return new TurnoActualDTO
            {
                CierreTurnoId = turno.CierreTurnoId,
                FechaApertura = turno.Fecha,
                EfectivoInicial = turno.Efectivo,
                CantidadVentas = ventas.Count,
                TotalVentas = totalVentas,
                TotalEfectivo = totalEfectivo,
                TotalVirtual = totalVirtual,
                TotalGastos = totalGastos,
                EfectivoEsperado = turno.Efectivo + totalEfectivo - totalGastos,
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

        public async Task<CierreTurnoResponseDTO> CerrarTurnoAsync(int kioscoId,CerrarTurnoDTO dto)
        {
            var cierre = await _cierreTurnoRepository.GetTurnoAbiertoAsync(kioscoId); 
            if (cierre == null)

                throw new KeyNotFoundException($"Cierre de turno con ID {cierre.CierreTurnoId} no encontrado");

            if (cierre.Estado != EstadoCierre.Abierto)
                throw new InvalidOperationException("El turno ya está cerrado");

            if (dto.EfectivoContado < 0)
                throw new InvalidOperationException("El efectivo contado no puede ser negativo");

            // ─── CALCULAR TODO AUTOMÁTICAMENTE ─────────────

            var ventas = cierre.Ventas?.Where(v => !v.Anulada).ToList() ?? new List<Venta>();

            // Total de ventas
            var totalVentas = ventas.Sum(v => v.Total);

            // Separar por método de pago
            var ventasEfectivo = ventas.Where(v => v.MetodoPago.Nombre.ToLower().Contains("efectivo"));
            var ventasVirtual = ventas.Where(v => !v.MetodoPago.Nombre.ToLower().Contains("efectivo"));

            var totalEfectivo = ventasEfectivo.Sum(v => v.Total);
            var totalVirtual = ventasVirtual.Sum(v => v.Total);

            // Calcular gastos del turno
            var gastos = await _gastoRepository.GetByFechaAsync(cierre.Fecha, DateTime.Now);
            gastos = gastos.Where(g => g.KioscoId == cierre.KioscoId);
            var totalGastos = gastos.Sum(g => g.Monto);

            // ─── CÁLCULO DEL EFECTIVO ──────────────────────

            // Efectivo esperado = Inicial + Ventas en efectivo - Gastos
            var efectivoEsperado = cierre.Efectivo + totalEfectivo - totalGastos;

            // Efectivo real = Lo que el empleado contó físicamente
            var efectivoReal = dto.EfectivoContado;

            // Diferencia = Real - Esperado (positivo = sobrante, negativo = faltante)
            var diferenciaEfectivo = efectivoReal - efectivoEsperado;

            // ─── CÁLCULO DEL VIRTUAL ───────────────────────

            // Virtual esperado = Total de ventas virtuales (debería estar en la cuenta)
            var virtualEsperado = totalVirtual;

            // Virtual real = Lo que realmente se acreditó (lo informa el empleado)
            var virtualReal = dto.VirtualAcreditado;

            // Diferencia virtual = Real - Esperado
            var diferenciaVirtual = virtualReal - virtualEsperado;

            // ─── DIFERENCIA TOTAL ──────────────────────────

            var diferenciaTotal = diferenciaEfectivo + diferenciaVirtual;

            // ─── MONTO TOTAL ───────────────────────────────

            var montoEsperado = efectivoEsperado + virtualEsperado;
            var montoReal = efectivoReal + virtualReal;

            // ─── ACTUALIZAR CIERRE ─────────────────────────

            cierre.Estado = EstadoCierre.Cerrado;
            cierre.CantidadVentas = ventas.Count;

            // Montos esperados
            cierre.MontoEsperado = montoEsperado;

            // Montos reales (lo que el empleado contó/verificó)
            cierre.MontoReal = montoReal;
            cierre.Efectivo = efectivoReal;      // Actualizar con el efectivo real contado
            cierre.Virtual = virtualReal;        // Actualizar con el virtual real acreditado

            // Diferencia
            cierre.Diferencia = diferenciaTotal;

            // Observaciones
            var observacionesDetalle = $@"
RESUMEN DEL CIERRE:
─────────────────────────────────────
VENTAS:
  • Total ventas: ${totalVentas:N2}
  • Efectivo: ${totalEfectivo:N2} ({ventasEfectivo.Count()} ventas)
  • Virtual: ${totalVirtual:N2} ({ventasVirtual.Count()} ventas)

GASTOS:
  • Total gastos: ${totalGastos:N2}

EFECTIVO:
  • Inicial: ${cierre.Efectivo:N2}
  • Esperado: ${efectivoEsperado:N2}
  • Contado: ${efectivoReal:N2}
  • Diferencia: ${diferenciaEfectivo:N2} {(diferenciaEfectivo >= 0 ? "SOBRANTE ✓" : "FALTANTE ✗")}

VIRTUAL:
  • Esperado: ${virtualEsperado:N2}
  • Acreditado: ${virtualReal:N2}
  • Diferencia: ${diferenciaVirtual:N2}

TOTALES:
  • Monto esperado: ${montoEsperado:N2}
  • Monto real: ${montoReal:N2}
  • DIFERENCIA FINAL: ${diferenciaTotal:N2} {(diferenciaTotal >= 0 ? "✓" : "✗")}
─────────────────────────────────────";

            cierre.Observaciones = string.IsNullOrWhiteSpace(dto.Observaciones)
                ? observacionesDetalle
                : $"{dto.Observaciones}\n\n{observacionesDetalle}";

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

            // Calcular gastos
            decimal totalGastos = 0;
            if (cierre.Estado == EstadoCierre.Cerrado)
            {
                var gastos = await _gastoRepository.GetByFechaAsync(cierre.Fecha, DateTime.Now);
                gastos = gastos.Where(g => g.KioscoId == cierre.KioscoId);
                totalGastos = gastos.Sum(g => g.Monto);
            }

            return new CierreTurnoResponseDTO
            {
                CierreTurnoId = cierre.CierreTurnoId,
                Fecha = cierre.Fecha,
                Estado = cierre.Estado,
                EstadoNombre = cierre.Estado.ToString(),

                EfectivoInicial = cierre.Efectivo,
                EfectivoFinal = cierre.Estado == EstadoCierre.Cerrado ? cierre.Efectivo : 0,
                VirtualFinal = cierre.Virtual,
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

                Empleados = cierre.cierreTurnoEmpleados?.Select(cte => new EmpleadoTurnoDTO
                {
                    EmpleadoId = cte.EmpleadoId,
                    EmpleadoNombre = cte.Empleado?.Nombre ?? ""
                }).ToList() ?? new List<EmpleadoTurnoDTO>()
            };
        }
    }
}
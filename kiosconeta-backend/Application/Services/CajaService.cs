using Application.DTOs.Caja;
using Application.Interfaces.Repository;
using Application.Interfaces.Services;
using Domain.Entities;

namespace Application.Services
{
    public class CajaService : ICajaService
    {
        private readonly ICajaRepository _cajaRepository;
        private readonly IEmpleadoRepository _empleadoRepository;

        public CajaService(
            ICajaRepository cajaRepository,
            IEmpleadoRepository empleadoRepository)
        {
            _cajaRepository = cajaRepository;
            _empleadoRepository = empleadoRepository;
        }

        // ═══════════════════════════════════════════════════
        // RESUMEN
        // anio/mes = null → histórico completo (comportamiento de siempre)
        // anio+mes → solo ese mes calendario para los totales/movimientos.
        // Saldo actual y saldo inicial SIEMPRE reflejan el valor real de hoy,
        // sin importar el período elegido (no tiene sentido "el saldo de marzo").
        // ═══════════════════════════════════════════════════

        public async Task<CajaResumenDTO> GetResumenAsync(int kioscoId, int? anio = null, int? mes = null)
        {
            DateTime? fechaDesde = null;
            DateTime? fechaHasta = null;

            if (anio.HasValue && mes.HasValue)
            {
                if (mes.Value < 1 || mes.Value > 12)
                    throw new InvalidOperationException("El mes debe estar entre 1 y 12");

                fechaDesde = new DateTime(anio.Value, mes.Value, 1, 0, 0, 0, DateTimeKind.Utc);
                fechaHasta = fechaDesde.Value.AddMonths(1);
            }

            var saldo = await _cajaRepository.GetSaldoByKioscoAsync(kioscoId);
            var saldoInicial = saldo?.SaldoInicial ?? 0;

            // ── Histórico completo: siempre se calcula, es la base del saldo real de hoy ──
            var ventasEfectivoTotal = await _cajaRepository.GetTotalVentasEfectivoAsync(kioscoId);
            var ventasVirtualTotal = await _cajaRepository.GetTotalVentasVirtualAsync(kioscoId);
            var gastosTotal = await _cajaRepository.GetTotalGastosAsync(kioscoId);
            var ingresosManualesTotal = await _cajaRepository.GetTotalIngresosManualAsync(kioscoId);
            var egresosManualesTotal = await _cajaRepository.GetTotalEgresosManualAsync(kioscoId);

            var saldoActual = saldoInicial
                + ventasEfectivoTotal
                + ventasVirtualTotal
                - gastosTotal
                + ingresosManualesTotal
                - egresosManualesTotal;

            // ── Totales del período mostrado (tarjetas + extracto) ──
            // Si no hay filtro, son los mismos que ya calculamos arriba (evita repetir la consulta)
            var ventasEfectivo = fechaDesde.HasValue
                ? await _cajaRepository.GetTotalVentasEfectivoAsync(kioscoId, fechaDesde, fechaHasta)
                : ventasEfectivoTotal;

            var ventasVirtual = fechaDesde.HasValue
                ? await _cajaRepository.GetTotalVentasVirtualAsync(kioscoId, fechaDesde, fechaHasta)
                : ventasVirtualTotal;

            var gastos = fechaDesde.HasValue
                ? await _cajaRepository.GetTotalGastosAsync(kioscoId, fechaDesde, fechaHasta)
                : gastosTotal;

            var ingresosManuales = fechaDesde.HasValue
                ? await _cajaRepository.GetTotalIngresosManualAsync(kioscoId, fechaDesde, fechaHasta)
                : ingresosManualesTotal;

            var egresosManuales = fechaDesde.HasValue
                ? await _cajaRepository.GetTotalEgresosManualAsync(kioscoId, fechaDesde, fechaHasta)
                : egresosManualesTotal;

            var cantidadVentas = await _cajaRepository.GetCantidadVentasAsync(kioscoId, fechaDesde, fechaHasta);
            var gananciaTotal = await _cajaRepository.GetGananciaTotalAsync(kioscoId, fechaDesde, fechaHasta);
            var extracto = await _cajaRepository.GetExtractoAsync(kioscoId, fechaDesde, fechaHasta);

            return new CajaResumenDTO
            {
                SaldoInicial = saldoInicial,
                SaldoActual = saldoActual,
                TotalVentasEfectivo = ventasEfectivo,
                TotalVentasVirtual = ventasVirtual,
                TotalVentas = ventasEfectivo + ventasVirtual,
                TotalGastos = gastos,
                GananciaTotal = gananciaTotal,
                CantidadVentas = cantidadVentas,
                TotalIngresosManual = ingresosManuales,
                TotalEgresosManual = egresosManuales,
                Movimientos = extracto
            };
        }

        // ═══════════════════════════════════════════════════
        // MOVIMIENTOS
        // ═══════════════════════════════════════════════════

        public async Task<IEnumerable<MovimientoCajaResponseDTO>> GetMovimientosAsync(int kioscoId)
        {
            // Histórico general de movimientos
            var movimientos = await _cajaRepository.GetMovimientosByKioscoAsync(kioscoId);
            return movimientos.Select(MapMovimientoToDTO);
        }

        public async Task<MovimientoCajaResponseDTO> CreateMovimientoAsync(
            int kioscoId, CreateMovimientoCajaDTO dto)
        {
            if (dto.Monto <= 0)
                throw new InvalidOperationException("El monto debe ser mayor a 0");

            if (string.IsNullOrWhiteSpace(dto.Descripcion))
                throw new InvalidOperationException("La descripción es obligatoria");

            var empleado = await _empleadoRepository.GetByIdAsync(dto.EmpleadoId);
            if (empleado == null)
                throw new KeyNotFoundException($"Empleado con ID {dto.EmpleadoId} no encontrado");

            var movimiento = new MovimientoCaja
            {
                Descripcion = dto.Descripcion.Trim(),
                Monto = dto.Monto,
                Tipo = dto.Tipo,
                KioscoId = kioscoId,
                EmpleadoId = dto.EmpleadoId,
                Fecha = DateTime.UtcNow // Guardamos en UTC estándar para la DB
            };

            var creado = await _cajaRepository.CreateMovimientoAsync(movimiento);
            return MapMovimientoToDTO(creado);
        }

        public async Task<bool> DeleteMovimientoAsync(int id)
        {
            var movimiento = await _cajaRepository.GetMovimientoByIdAsync(id);
            if (movimiento == null)
                throw new KeyNotFoundException($"Movimiento con ID {id} no encontrado");

            return await _cajaRepository.DeleteMovimientoAsync(id);
        }

        // ═══════════════════════════════════════════════════
        // SALDO INICIAL
        // ═══════════════════════════════════════════════════

        public async Task<CajaResumenDTO> UpdateSaldoInicialAsync(int kioscoId, UpdateSaldoInicialDTO dto)
        {
            if (dto.SaldoInicial < 0)
                throw new InvalidOperationException("El saldo inicial no puede ser negativo");

            await _cajaRepository.UpsertSaldoAsync(kioscoId, dto.SaldoInicial);

            // Devuelve el resumen histórico completo (sin filtro de período)
            return await GetResumenAsync(kioscoId);
        }

        // ═══════════════════════════════════════════════════
        // MAPEO
        // ═══════════════════════════════════════════════════

        private MovimientoCajaResponseDTO MapMovimientoToDTO(MovimientoCaja m) =>
            new MovimientoCajaResponseDTO
            {
                MovimientoCajaId = m.MovimientoCajaId,
                Fecha = m.Fecha,
                Descripcion = m.Descripcion,
                Monto = m.Monto,
                Tipo = m.Tipo,
                KioscoId = m.KioscoId,
                EmpleadoId = m.EmpleadoId,
                EmpleadoNombre = m.Empleado?.Nombre ?? string.Empty
            };
    }
}
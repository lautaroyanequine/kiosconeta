using Application.DTOs.Caja;
using Application.Interfaces.Repository;
using Application.Interfaces.Services;
using Domain.Entities;
using Domain.Enums;

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
        // ═══════════════════════════════════════════════════

        public async Task<CajaResumenDTO> GetResumenAsync(int kioscoId)
        {
            // Obtener todos los datos en paralelo
            var saldoTask = _cajaRepository.GetSaldoByKioscoAsync(kioscoId);
            var ventasEfectivoTask = _cajaRepository.GetTotalVentasEfectivoAsync(kioscoId);
            var ventasVirtualTask = _cajaRepository.GetTotalVentasVirtualAsync(kioscoId);
            var gastosTask = _cajaRepository.GetTotalGastosAsync(kioscoId);
            var ingresosManualTask = _cajaRepository.GetTotalIngresosManualAsync(kioscoId);
            var egresosManualTask = _cajaRepository.GetTotalEgresosManualAsync(kioscoId);
            var cantidadVentasTask = _cajaRepository.GetCantidadVentasAsync(kioscoId);
            var gananciaTotalTask = _cajaRepository.GetGananciaTotalAsync(kioscoId);
            var movimientosTask = _cajaRepository.GetMovimientosByKioscoAsync(kioscoId);

            await Task.WhenAll(
                saldoTask, ventasEfectivoTask, ventasVirtualTask,
                gastosTask, ingresosManualTask, egresosManualTask,
                cantidadVentasTask, gananciaTotalTask, movimientosTask
            );

            var saldoInicial = saldoTask.Result?.SaldoInicial ?? 0;
            var ventasEfectivo = ventasEfectivoTask.Result;
            var ventasVirtual = ventasVirtualTask.Result;
            var gastos = gastosTask.Result;
            var ingresosManual = ingresosManualTask.Result;
            var egresosManual = egresosManualTask.Result;

            // Saldo actual = saldo inicial + ventas (efectivo + virtual) + ingresos manuales
            //                             - gastos - egresos manuales
            var saldoActual = saldoInicial
                            + ventasEfectivo
                            + ventasVirtual
                            + ingresosManual
                            - gastos
                            - egresosManual;

            return new CajaResumenDTO
            {
                SaldoInicial = saldoInicial,
                SaldoActual = saldoActual,
                TotalVentasEfectivo = ventasEfectivo,
                TotalVentasVirtual = ventasVirtual,
                TotalVentas = ventasEfectivo + ventasVirtual,
                TotalGastos = gastos,
                GananciaTotal = gananciaTotalTask.Result,
                CantidadVentas = cantidadVentasTask.Result,
                TotalIngresosManual = ingresosManual,
                TotalEgresosManual = egresosManual,
                Movimientos = movimientosTask.Result
                    .Select(MapMovimientoToDTO).ToList()
            };
        }

        // ═══════════════════════════════════════════════════
        // MOVIMIENTOS
        // ═══════════════════════════════════════════════════

        public async Task<IEnumerable<MovimientoCajaResponseDTO>> GetMovimientosAsync(int kioscoId)
        {
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
                Fecha = DateTime.Now
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

            // Devolver el resumen actualizado
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
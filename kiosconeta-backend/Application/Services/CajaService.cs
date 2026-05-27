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
        // RESUMEN (Modificado para aceptar rango de fechas)
        // ═══════════════════════════════════════════════════

        public async Task<CajaResumenDTO> GetResumenAsync(int kioscoId)
        {
            var saldo = await _cajaRepository.GetSaldoByKioscoAsync(kioscoId);
            var ventasEfectivo = await _cajaRepository.GetTotalVentasEfectivoAsync(kioscoId);
            var ventasVirtual = await _cajaRepository.GetTotalVentasVirtualAsync(kioscoId);
            var gastos = await _cajaRepository.GetTotalGastosAsync(kioscoId);

            // Obtenemos los totales manuales
            var ingresosManuales = await _cajaRepository.GetTotalIngresosManualAsync(kioscoId);
            var egresosManuales = await _cajaRepository.GetTotalEgresosManualAsync(kioscoId);

            var cantidadVentas = await _cajaRepository.GetCantidadVentasAsync(kioscoId);
            var gananciaTotal = await _cajaRepository.GetGananciaTotalAsync(kioscoId);
            var movimientos = await _cajaRepository.GetMovimientosByKioscoAsync(kioscoId);

            var saldoInicial = saldo?.SaldoInicial ?? 0;

            // FÓRMULA INTEGRAL:
            var saldoActual = saldoInicial
                + ventasEfectivo   // Estos son los totales de los cierres
                + ventasVirtual
                - gastos           // Gastos admin
                + ingresosManuales
                - egresosManuales;

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
                Movimientos = movimientos.Select(MapMovimientoToDTO).ToList()
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

            // Devuelve el resumen con las fechas del mes actual por defecto
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
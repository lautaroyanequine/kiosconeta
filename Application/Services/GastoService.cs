using Application.DTOs.Gasto;
using Application.Interfaces.Repository;
using Application.Interfaces.Services;
using Domain.Entities;

namespace Application.Services
{
    // ═══════════════════════════════════════════════════
    // GASTO SERVICE
    // ═══════════════════════════════════════════════════

    public class GastoService : IGastoService
    {
        private readonly IGastoRepository _gastoRepository;
        private readonly IEmpleadoRepository _empleadoRepository;
        private readonly ITipoDeGastoRepository _tipoDeGastoRepository;

        public GastoService(
            IGastoRepository gastoRepository,
            IEmpleadoRepository empleadoRepository,
            ITipoDeGastoRepository tipoDeGastoRepository)
        {
            _gastoRepository = gastoRepository;
            _empleadoRepository = empleadoRepository;
            _tipoDeGastoRepository = tipoDeGastoRepository;
        }

        public async Task<GastoResponseDTO?> GetByIdAsync(int id)
        {
            var gasto = await _gastoRepository.GetByIdAsync(id);
            if (gasto == null) return null;

            return MapToResponseDTO(gasto);
        }

        public async Task<IEnumerable<GastoResponseDTO>> GetAllAsync()
        {
            var gastos = await _gastoRepository.GetAllAsync();
            return gastos.Select(MapToResponseDTO);
        }

        public async Task<IEnumerable<GastoResponseDTO>> GetByKioscoIdAsync(int kioscoId)
        {
            var gastos = await _gastoRepository.GetByKioscoIdAsync(kioscoId);
            return gastos.Select(MapToResponseDTO);
        }

        public async Task<IEnumerable<GastoResponseDTO>> GetByEmpleadoIdAsync(int empleadoId)
        {
            var gastos = await _gastoRepository.GetByEmpleadoIdAsync(empleadoId);
            return gastos.Select(MapToResponseDTO);
        }

        public async Task<IEnumerable<GastoResponseDTO>> GetByFechaAsync(DateTime fechaDesde, DateTime fechaHasta)
        {
            var gastos = await _gastoRepository.GetByFechaAsync(fechaDesde, fechaHasta);
            return gastos.Select(MapToResponseDTO);
        }

        public async Task<IEnumerable<GastoResponseDTO>> GetDelDiaAsync(int kioscoId)
        {
            var gastos = await _gastoRepository.GetDelDiaAsync(kioscoId);
            return gastos.Select(MapToResponseDTO);
        }

        public async Task<IEnumerable<GastoResponseDTO>> GetConFiltrosAsync(int kioscoId, GastoFiltrosDTO filtros)
        {
            var gastos = await _gastoRepository.GetConFiltrosAsync(kioscoId, filtros);
            return gastos.Select(MapToResponseDTO);
        }

        public async Task<GastoResponseDTO> CreateAsync(CreateGastoDTO dto)
        {
            // Validaciones
            if (string.IsNullOrWhiteSpace(dto.Nombre))
                throw new InvalidOperationException("El nombre del gasto es obligatorio");

            if (dto.Monto <= 0)
                throw new InvalidOperationException("El monto debe ser mayor a 0");

            // Validar empleado
            var empleado = await _empleadoRepository.GetByIdAsync(dto.EmpleadoId);
            if (empleado == null)
                throw new KeyNotFoundException($"Empleado con ID {dto.EmpleadoId} no encontrado");

            if (!empleado.Activo)
                throw new InvalidOperationException("El empleado está inactivo");

            // Validar tipo de gasto
            var tipoGasto = await _tipoDeGastoRepository.GetByIdAsync(dto.TipoDeGastoId);
            if (tipoGasto == null)
                throw new KeyNotFoundException($"Tipo de gasto con ID {dto.TipoDeGastoId} no encontrado");

            if (!tipoGasto.Activo)
                throw new InvalidOperationException("El tipo de gasto está inactivo");

            var gasto = new Gasto
            {
                Nombre = dto.Nombre.Trim(),
                Descripcion = dto.Descripcion?.Trim() ?? "",
                Monto = dto.Monto,
                EmpleadoId = dto.EmpleadoId,
                KioscoId = dto.KioscoId,
                TipoDeGastoId = dto.TipoDeGastoId,
                Fecha = DateTime.Now
            };

            var creado = await _gastoRepository.CreateAsync(gasto);
            return MapToResponseDTO(creado);
        }

        public async Task<GastoResponseDTO> UpdateAsync(UpdateGastoDTO dto)
        {
            var gasto = await _gastoRepository.GetByIdAsync(dto.GastoId);
            if (gasto == null)
                throw new KeyNotFoundException($"Gasto con ID {dto.GastoId} no encontrado");

            if (string.IsNullOrWhiteSpace(dto.Nombre))
                throw new InvalidOperationException("El nombre del gasto es obligatorio");

            if (dto.Monto <= 0)
                throw new InvalidOperationException("El monto debe ser mayor a 0");

            // Validar tipo de gasto
            var tipoGasto = await _tipoDeGastoRepository.GetByIdAsync(dto.TipoDeGastoId);
            if (tipoGasto == null)
                throw new KeyNotFoundException($"Tipo de gasto con ID {dto.TipoDeGastoId} no encontrado");

            gasto.Nombre = dto.Nombre.Trim();
            gasto.Descripcion = dto.Descripcion?.Trim() ?? "";
            gasto.Monto = dto.Monto;
            gasto.TipoDeGastoId = dto.TipoDeGastoId;

            var actualizado = await _gastoRepository.UpdateAsync(gasto);
            return MapToResponseDTO(actualizado);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existe = await _gastoRepository.ExistsAsync(id);
            if (!existe)
                throw new KeyNotFoundException($"Gasto con ID {id} no encontrado");

            return await _gastoRepository.DeleteAsync(id);
        }

        private GastoResponseDTO MapToResponseDTO(Gasto gasto)
        {
            return new GastoResponseDTO
            {
                GastoId = gasto.GastoId,
                Nombre = gasto.Nombre,
                Descripcion = gasto.Descripcion,
                Monto = gasto.Monto,
                Fecha = gasto.Fecha,

                EmpleadoId = gasto.EmpleadoId,
                EmpleadoNombre = gasto.Empleado?.Nombre ?? "",

                KioscoId = gasto.KioscoId,
                KioscoNombre = gasto.Kiosco?.Nombre ?? "",

                TipoDeGastoId = gasto.TipoDeGastoId,
                TipoDeGastoNombre = gasto.TipoDeGasto?.Nombre ?? ""
            };
        }
    }

    // ═══════════════════════════════════════════════════
    // TIPO DE GASTO SERVICE
    // ═══════════════════════════════════════════════════

    public class TipoDeGastoService : ITipoDeGastoService
    {
        private readonly ITipoDeGastoRepository _tipoDeGastoRepository;
        private readonly IGastoRepository _gastoRepository;

        public TipoDeGastoService(
            ITipoDeGastoRepository tipoDeGastoRepository,
            IGastoRepository gastoRepository)
        {
            _tipoDeGastoRepository = tipoDeGastoRepository;
            _gastoRepository = gastoRepository;
        }

        public async Task<TipoDeGastoResponseDTO?> GetByIdAsync(int id)
        {
            var tipo = await _tipoDeGastoRepository.GetByIdAsync(id);
            if (tipo == null) return null;

            return await MapToResponseDTO(tipo);
        }

        public async Task<IEnumerable<TipoDeGastoResponseDTO>> GetAllAsync()
        {
            var tipos = await _tipoDeGastoRepository.GetAllAsync();
            var result = new List<TipoDeGastoResponseDTO>();
            foreach (var t in tipos)
                result.Add(await MapToResponseDTO(t));
            return result;
        }

        public async Task<IEnumerable<TipoDeGastoResponseDTO>> GetActivosAsync()
        {
            var tipos = await _tipoDeGastoRepository.GetActivosAsync();
            var result = new List<TipoDeGastoResponseDTO>();
            foreach (var t in tipos)
                result.Add(await MapToResponseDTO(t));
            return result;
        }

        public async Task<TipoDeGastoResponseDTO> CreateAsync(CreateTipoDeGastoDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Nombre))
                throw new InvalidOperationException("El nombre del tipo de gasto es obligatorio");

            var existe = await _tipoDeGastoRepository.ExistsNombreAsync(dto.Nombre);
            if (existe)
                throw new InvalidOperationException($"Ya existe un tipo de gasto con el nombre '{dto.Nombre}'");

            var tipo = new TipoDeGasto
            {
                Nombre = dto.Nombre.Trim(),
                Descripcion = dto.Descripcion?.Trim() ?? "",
                Activo = true
            };

            var creado = await _tipoDeGastoRepository.CreateAsync(tipo);
            return await MapToResponseDTO(creado);
        }

        public async Task<TipoDeGastoResponseDTO> UpdateAsync(UpdateTipoDeGastoDTO dto)
        {
            var tipo = await _tipoDeGastoRepository.GetByIdAsync(dto.TipoDeGastoId);
            if (tipo == null)
                throw new KeyNotFoundException($"Tipo de gasto con ID {dto.TipoDeGastoId} no encontrado");

            if (string.IsNullOrWhiteSpace(dto.Nombre))
                throw new InvalidOperationException("El nombre del tipo de gasto es obligatorio");

            // Verificar nombre duplicado solo si cambió
            if (tipo.Nombre.ToLower() != dto.Nombre.ToLower())
            {
                var existe = await _tipoDeGastoRepository.ExistsNombreAsync(dto.Nombre);
                if (existe)
                    throw new InvalidOperationException($"Ya existe un tipo de gasto con el nombre '{dto.Nombre}'");
            }

            tipo.Nombre = dto.Nombre.Trim();
            tipo.Descripcion = dto.Descripcion?.Trim() ?? "";
            tipo.Activo = dto.Activo;

            var actualizado = await _tipoDeGastoRepository.UpdateAsync(tipo);
            return await MapToResponseDTO(actualizado);
        }

        public async Task<bool> ActivarDesactivarAsync(int id, bool activo)
        {
            var existe = await _tipoDeGastoRepository.ExistsAsync(id);
            if (!existe)
                throw new KeyNotFoundException($"Tipo de gasto con ID {id} no encontrado");

            return await _tipoDeGastoRepository.ActivarDesactivarAsync(id, activo);
        }

        private async Task<TipoDeGastoResponseDTO> MapToResponseDTO(TipoDeGasto tipo)
        {
            var cantidadGastos = await _gastoRepository.ContarPorTipoAsync(tipo.TipoDeGastoId);
            var totalGastos = await _gastoRepository.GetTotalPorTipoAsync(tipo.TipoDeGastoId);

            return new TipoDeGastoResponseDTO
            {
                TipoDeGastoId = tipo.TipoDeGastoId,
                Nombre = tipo.Nombre,
                Descripcion = tipo.Descripcion,
                Activo = tipo.Activo,
                CantidadGastos = cantidadGastos,
                TotalGastos = totalGastos
            };
        }
    }
}
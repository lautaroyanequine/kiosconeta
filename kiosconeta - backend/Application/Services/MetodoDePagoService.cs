using Application.DTOs.MetodoDePago;
using Application.Interfaces.Repository;
using Application.Interfaces.Services;
using Domain.Entities;

namespace Application.Services
{
    public class MetodoDePagoService : IMetodoDePagoService
    {
        private readonly IMetodoDePagoRepository _metodoDePagoRepository;

        public MetodoDePagoService(IMetodoDePagoRepository metodoDePagoRepository)
        {
            _metodoDePagoRepository = metodoDePagoRepository;
        }

        public async Task<MetodoDePagoResponseDTO?> GetByIdAsync(int id)
        {
            var metodo = await _metodoDePagoRepository.GetByIdAsync(id);
            if (metodo == null) return null;

            return await MapToResponseDTO(metodo);
        }

        public async Task<IEnumerable<MetodoDePagoResponseDTO>> GetAllAsync()
        {
            var metodos = await _metodoDePagoRepository.GetAllAsync();

            var result = new List<MetodoDePagoResponseDTO>();
            foreach (var metodo in metodos)
                result.Add(await MapToResponseDTO(metodo));

            return result;
        }

        public async Task<MetodoDePagoResponseDTO> CreateAsync(CreateMetodoDePagoDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Nombre))
                throw new InvalidOperationException("El nombre del método de pago es obligatorio");

            var existe = await _metodoDePagoRepository.ExistsNombreAsync(dto.Nombre);
            if (existe)
                throw new InvalidOperationException($"Ya existe un método de pago con el nombre '{dto.Nombre}'");

            var metodo = new MetodoDePago
            {
                Nombre = dto.Nombre.Trim()
            };

            var creado = await _metodoDePagoRepository.CreateAsync(metodo);
            return await MapToResponseDTO(creado);
        }

        public async Task<MetodoDePagoResponseDTO> UpdateAsync(UpdateMetodoDePagoDTO dto)
        {
            var metodo = await _metodoDePagoRepository.GetByIdAsync(dto.MetodoDePagoID);
            if (metodo == null)
                throw new KeyNotFoundException($"No se encontró el método de pago con ID: {dto.MetodoDePagoID}");

            if (string.IsNullOrWhiteSpace(dto.Nombre))
                throw new InvalidOperationException("El nombre del método de pago es obligatorio");

            // Verificar nombre duplicado solo si cambió
            if (metodo.Nombre.ToLower() != dto.Nombre.ToLower())
            {
                var existe = await _metodoDePagoRepository.ExistsNombreAsync(dto.Nombre);
                if (existe)
                    throw new InvalidOperationException($"Ya existe un método de pago con el nombre '{dto.Nombre}'");
            }

            metodo.Nombre = dto.Nombre.Trim();

            var actualizado = await _metodoDePagoRepository.UpdateAsync(metodo);
            return await MapToResponseDTO(actualizado);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existe = await _metodoDePagoRepository.ExistsAsync(id);
            if (!existe)
                throw new KeyNotFoundException($"No se encontró el método de pago con ID: {id}");

            // No se puede eliminar si tiene ventas asociadas
            var tieneVentas = await _metodoDePagoRepository.TieneVentasAsync(id);
            if (tieneVentas)
                throw new InvalidOperationException("No se puede eliminar el método de pago porque tiene ventas registradas");

            return await _metodoDePagoRepository.DeleteAsync(id);
        }

        // ========== MAPEO ==========
        private async Task<MetodoDePagoResponseDTO> MapToResponseDTO(MetodoDePago metodo)
        {
            var cantidadVentas = await _metodoDePagoRepository.ContarVentasAsync(metodo.MetodoDePagoID);

            return new MetodoDePagoResponseDTO
            {
                MetodoDePagoID = metodo.MetodoDePagoID,
                Nombre = metodo.Nombre,
                CantidadVentas = cantidadVentas
            };
        }
    }
}
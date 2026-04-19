using Application.DTOs.Kiosco;
using Application.Interfaces.Repository;
using Application.Interfaces.Services;

namespace Application.Services
{
    public class KioscoService : IKioscoService
    {
        private readonly IKioscoRepository _kioscoRepository;

        public KioscoService(IKioscoRepository kioscoRepository)
        {
            _kioscoRepository = kioscoRepository;
        }

        public async Task<KioscoResponseDTO> GetByIdAsync(int kioscoId)
        {
            var kiosco = await _kioscoRepository.GetByIdAsync(kioscoId)
                ?? throw new KeyNotFoundException($"Kiosco con ID {kioscoId} no encontrado");

            return new KioscoResponseDTO
            {
                KioscoId = kiosco.KioscoID,
                Nombre = kiosco.Nombre,
                Direccion = kiosco.Direccion,
            };
        }

        public async Task<KioscoResponseDTO> UpdateAsync(int kioscoId, UpdateKioscoDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Nombre))
                throw new InvalidOperationException("El nombre del kiosco es obligatorio");

            var kiosco = await _kioscoRepository.UpdateAsync(kioscoId, dto.Nombre, dto.Direccion);

            return new KioscoResponseDTO
            {
                KioscoId = kiosco.KioscoID,
                Nombre = kiosco.Nombre,
                Direccion = kiosco.Direccion,
            };
        }
    }
}
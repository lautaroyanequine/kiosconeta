using Application.DTOs.Categoria;
using Application.Interfaces.Repository;
using Application.Interfaces.Services;
using Domain.Entities;

namespace Application.Services
{
    public class CategoriaService : ICategoriaService
    {
        private readonly ICategoriaRepository _categoriaRepository;

        public CategoriaService(ICategoriaRepository categoriaRepository)
        {
            _categoriaRepository = categoriaRepository;
        }

        public async Task<CategoriaResponseDTO?> GetByIdAsync(int id)
        {
            var categoria = await _categoriaRepository.GetByIdAsync(id);
            if (categoria == null) return null;

            return await MapToResponseDTO(categoria);
        }

        public async Task<IEnumerable<CategoriaResponseDTO>> GetAllAsync()
        {
            var categorias = await _categoriaRepository.GetAllAsync();

            var result = new List<CategoriaResponseDTO>();
            foreach (var categoria in categorias)
                result.Add(await MapToResponseDTO(categoria));

            return result;
        }

        public async Task<CategoriaResponseDTO> CreateAsync(CreateCategoriaDTO dto)
        {
            // Nombre no puede estar vacío
            if (string.IsNullOrWhiteSpace(dto.Nombre))
                throw new InvalidOperationException("El nombre de la categoría es obligatorio");

            // No puede haber categorías con el mismo nombre
            var existe = await _categoriaRepository.ExistsNombreAsync(dto.Nombre);
            if (existe)
                throw new InvalidOperationException($"Ya existe una categoría con el nombre '{dto.Nombre}'");

            var categoria = new Categoria
            {
                Nombre = dto.Nombre.Trim()
            };

            var creada = await _categoriaRepository.CreateAsync(categoria);
            return await MapToResponseDTO(creada);
        }

        public async Task<CategoriaResponseDTO> UpdateAsync(UpdateCategoriaDTO dto)
        {
            var categoria = await _categoriaRepository.GetByIdAsync(dto.CategoriaID);
            if (categoria == null)
                throw new KeyNotFoundException($"No se encontró la categoría con ID: {dto.CategoriaID}");

            if (string.IsNullOrWhiteSpace(dto.Nombre))
                throw new InvalidOperationException("El nombre de la categoría es obligatorio");

            // Verificar nombre duplicado solo si cambió
            if (categoria.Nombre.ToLower() != dto.Nombre.ToLower())
            {
                var existe = await _categoriaRepository.ExistsNombreAsync(dto.Nombre);
                if (existe)
                    throw new InvalidOperationException($"Ya existe una categoría con el nombre '{dto.Nombre}'");
            }

            categoria.Nombre = dto.Nombre.Trim();

            var actualizada = await _categoriaRepository.UpdateAsync(categoria);
            return await MapToResponseDTO(actualizada);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existe = await _categoriaRepository.ExistsAsync(id);
            if (!existe)
                throw new KeyNotFoundException($"No se encontró la categoría con ID: {id}");

            // No se puede eliminar si tiene productos activos
            var tieneProductos = await _categoriaRepository.TieneProductosAsync(id);
            if (tieneProductos)
                throw new InvalidOperationException("No se puede eliminar la categoría porque tiene productos asociados. Desactivá los productos primero.");

            return await _categoriaRepository.DeleteAsync(id);
        }

        // ========== MAPEO ==========
        private async Task<CategoriaResponseDTO> MapToResponseDTO(Categoria categoria)
        {
            var cantidadProductos = await _categoriaRepository.ContarProductosAsync(categoria.CategoriaID);

            return new CategoriaResponseDTO
            {
                CategoriaID = categoria.CategoriaID,
                Nombre = categoria.Nombre,
                CantidadProductos = cantidadProductos
            };
        }
    }
}
using Application.DTOs.Producto;
using Application.Interfaces.Repository;
using Application.Interfaces.Services;
using Domain.Entities;

namespace Application.Services
{
    /// <summary>
    /// Servicio de Productos - Lógica de negocio
    /// </summary>
    public class ProductoService : IProductoService
    {
        private readonly IProductoRepository _productoRepository;

        public ProductoService(IProductoRepository productoRepository)
        {
            _productoRepository = productoRepository;
        }

        // ========== CONSULTAS ==========

        public async Task<ProductoResponseDTO?> GetByIdAsync(int id)
        {
            var producto = await _productoRepository.GetByIdAsync(id);
            return producto != null ? MapToResponseDTO(producto) : null;
        }

        public async Task<IEnumerable<ProductoResponseDTO>> GetAllAsync()
        {
            var productos = await _productoRepository.GetAllAsync();
            return productos.Select(MapToResponseDTO);
        }

        public async Task<IEnumerable<ProductoResponseDTO>> GetByKioscoIdAsync(int kioscoId)
        {
            var productos = await _productoRepository.GetByKioscoIdAsync(kioscoId);
            return productos.Select(MapToResponseDTO);
        }

        public async Task<IEnumerable<ProductoResponseDTO>> GetActivosAsync(int kioscoId)
        {
            var productos = await _productoRepository.GetActivosAsync(kioscoId);
            return productos.Select(MapToResponseDTO);
        }

        public async Task<IEnumerable<ProductoResponseDTO>> GetByCategoriaAsync(int categoriaId)
        {
            var productos = await _productoRepository.GetByCategoriaAsync(categoriaId);
            return productos.Select(MapToResponseDTO);
        }

        public async Task<IEnumerable<ProductoResponseDTO>> GetBajoStockAsync(int kioscoId)
        {
            var productos = await _productoRepository.GetBajoStockAsync(kioscoId);
            return productos.Select(MapToResponseDTO);
        }

        public async Task<IEnumerable<ProductoResponseDTO>> GetProximosAVencerAsync(int kioscoId)
        {
            var productos = await _productoRepository.GetProximosAVencerAsync(kioscoId, 7);
            return productos.Select(MapToResponseDTO);
        }

        public async Task<ProductoResponseDTO?> GetByCodigoBarraAsync(string codigoBarra)
        {
            var producto = await _productoRepository.GetByCodigoBarraAsync(codigoBarra);
            return producto != null ? MapToResponseDTO(producto) : null;
        }

        public async Task<IEnumerable<ProductoResponseDTO>> SearchAsync(string searchTerm, int kioscoId)
        {
            var productos = await _productoRepository.SearchAsync(searchTerm, kioscoId);
            return productos.Select(MapToResponseDTO);
        }

        // ========== COMANDOS ==========

        public async Task<ProductoResponseDTO> CreateAsync(CreateProductoDTO dto)
        {
            // Validaciones de negocio
            if (dto.PrecioVenta <= dto.PrecioCosto)
            {
                throw new InvalidOperationException("El precio de venta debe ser mayor al precio de costo");
            }

            if (!string.IsNullOrEmpty(dto.CodigoBarra))
            {
                var existeCodigo = await _productoRepository.ExistsCodigoBarraAsync(dto.CodigoBarra);
                if (existeCodigo)
                {
                    throw new InvalidOperationException($"Ya existe un producto con el código de barra: {dto.CodigoBarra}");
                }
            }

            // Mapear DTO a Entidad
            var producto = new Producto
            {
                Nombre = dto.Nombre,
                PrecioCosto = dto.PrecioCosto,
                PrecioVenta = dto.PrecioVenta,
                CategoriaId = dto.CategoriaId,
                Distribuidor = dto.Distribuidor,
                CodigoBarra = dto.CodigoBarra,
                Descripcion = dto.Descripcion,
                Imagen = dto.Imagen,
                StockActual = dto.StockActual,
                StockMinimo = dto.StockMinimo,
                KioscoId = dto.KioscoId,
                FechaVencimiento = dto.FechaVencimiento,
                Suelto = dto.Suelto
            };

            var productoCreado = await _productoRepository.CreateAsync(producto);

            // Recargar con relaciones
            var productoCompleto = await _productoRepository.GetByIdAsync(productoCreado.ProductoId);
            return MapToResponseDTO(productoCompleto!);
        }

        public async Task<ProductoResponseDTO> UpdateAsync(UpdateProductoDTO dto)
        {
            // Validar que existe
            var productoExistente = await _productoRepository.GetByIdAsync(dto.ProductoId);
            if (productoExistente == null)
            {
                throw new KeyNotFoundException($"No se encontró el producto con ID: {dto.ProductoId}");
            }

            // Validaciones de negocio
            if (dto.PrecioVenta <= dto.PrecioCosto)
            {
                throw new InvalidOperationException("El precio de venta debe ser mayor al precio de costo");
            }

            // Actualizar campos
            productoExistente.Nombre = dto.Nombre;
            productoExistente.PrecioCosto = dto.PrecioCosto;
            productoExistente.PrecioVenta = dto.PrecioVenta;
            productoExistente.CategoriaId = dto.CategoriaId;
            productoExistente.Distribuidor = dto.Distribuidor;
            productoExistente.CodigoBarra = dto.CodigoBarra;
            productoExistente.Descripcion = dto.Descripcion;
            productoExistente.Imagen = dto.Imagen;
            productoExistente.StockActual = dto.StockActual;
            productoExistente.StockMinimo = dto.StockMinimo;
            productoExistente.FechaVencimiento = dto.FechaVencimiento;
            productoExistente.Suelto = dto.Suelto;
            productoExistente.Activo = dto.Activo;

            var productoActualizado = await _productoRepository.UpdateAsync(productoExistente);

            // Recargar con relaciones
            var productoCompleto = await _productoRepository.GetByIdAsync(productoActualizado.ProductoId);
            return MapToResponseDTO(productoCompleto!);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existe = await _productoRepository.ExistsAsync(id);
            if (!existe)
            {
                throw new KeyNotFoundException($"No se encontró el producto con ID: {id}");
            }

            return await _productoRepository.DeleteAsync(id);
        }

        public async Task<bool> ActivarDesactivarAsync(int id, bool activo)
        {
            var existe = await _productoRepository.ExistsAsync(id);
            if (!existe)
            {
                throw new KeyNotFoundException($"No se encontró el producto con ID: {id}");
            }

            return await _productoRepository.ActivarDesactivarAsync(id, activo);
        }

        public async Task<bool> ActualizarStockAsync(int id, int cantidad)
        {
            var producto = await _productoRepository.GetByIdAsync(id);
            if (producto == null)
            {
                throw new KeyNotFoundException($"No se encontró el producto con ID: {id}");
            }

            // Validar que no quede en negativo
            if (producto.StockActual + cantidad < 0)
            {
                throw new InvalidOperationException("No hay suficiente stock disponible");
            }

            return await _productoRepository.ActualizarStockAsync(id, cantidad);
        }

        // ========== MAPEO ==========

        private ProductoResponseDTO MapToResponseDTO(Producto producto)
        {
            var margen = producto.PrecioVenta - producto.PrecioCosto;
            var bajoStock = producto.StockActual <= producto.StockMinimo;
            var vencido = producto.FechaVencimiento.HasValue && producto.FechaVencimiento.Value < DateTime.Now;
            var proximoAVencer = producto.FechaVencimiento.HasValue
                && producto.FechaVencimiento.Value >= DateTime.Now
                && producto.FechaVencimiento.Value <= DateTime.Now.AddDays(7);

            return new ProductoResponseDTO
            {
                ProductoId = producto.ProductoId,
                Nombre = producto.Nombre,
                PrecioCosto = producto.PrecioCosto,
                PrecioVenta = producto.PrecioVenta,
                MargenGanancia = margen,
                CategoriaId = producto.CategoriaId,
                CategoriaNombre = producto.Categoria?.Nombre ?? "Sin categoría",
                Distribuidor = producto.Distribuidor,
                CodigoBarra = producto.CodigoBarra,
                Descripcion = producto.Descripcion,
                Imagen = producto.Imagen,
                StockActual = producto.StockActual,
                StockMinimo = producto.StockMinimo,
                BajoStock = bajoStock,
                KioscoId = producto.KioscoId,
                FechaCreacion = producto.FechaCreacion,
                FechaModificacion = producto.FechaModificacion,
                Activo = producto.Activo,
                FechaVencimiento = producto.FechaVencimiento,
                Vencido = vencido,
                ProximoAVencer = proximoAVencer,
                Suelto = producto.Suelto
            };
        }
    }
}
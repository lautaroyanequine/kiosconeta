using Application.DTOs.Producto;
using Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace KIOSCONETA.Controllers
{
    /// <summary>
    /// Controlador de API para gestión de Productos
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class ProductosController : ControllerBase
    {
        private readonly IProductoService _productoService;

        public ProductosController(IProductoService productoService)
        {
            _productoService = productoService;
        }

        // ========== GET - CONSULTAS ==========

        /// <summary>
        /// Obtener todos los productos
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductoResponseDTO>>> GetAll()
        {
            try
            {
                var productos = await _productoService.GetAllAsync();
                return Ok(productos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener productos", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener producto por ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductoResponseDTO>> GetById(int id)
        {
            try
            {
                var producto = await _productoService.GetByIdAsync(id);

                if (producto == null)
                    return NotFound(new { message = $"Producto con ID {id} no encontrado" });

                return Ok(producto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener producto", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener productos por kiosco
        /// </summary>
        [HttpGet("kiosco/{kioscoId}")]
        public async Task<ActionResult<IEnumerable<ProductoResponseDTO>>> GetByKiosco(int kioscoId)
        {
            try
            {
                var productos = await _productoService.GetByKioscoIdAsync(kioscoId);
                return Ok(productos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener productos", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener productos activos de un kiosco
        /// </summary>
        [HttpGet("kiosco/{kioscoId}/activos")]
        public async Task<ActionResult<IEnumerable<ProductoResponseDTO>>> GetActivos(int kioscoId)
        {
            try
            {
                var productos = await _productoService.GetActivosAsync(kioscoId);
                return Ok(productos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener productos activos", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener productos por categoría
        /// </summary>
        [HttpGet("categoria/{categoriaId}")]
        public async Task<ActionResult<IEnumerable<ProductoResponseDTO>>> GetByCategoria(int categoriaId)
        {
            try
            {
                var productos = await _productoService.GetByCategoriaAsync(categoriaId);
                return Ok(productos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener productos", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener productos con bajo stock
        /// </summary>
        [HttpGet("kiosco/{kioscoId}/bajo-stock")]
        public async Task<ActionResult<IEnumerable<ProductoResponseDTO>>> GetBajoStock(int kioscoId)
        {
            try
            {
                var productos = await _productoService.GetBajoStockAsync(kioscoId);
                return Ok(productos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener productos con bajo stock", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener productos próximos a vencer
        /// </summary>
        [HttpGet("kiosco/{kioscoId}/proximos-vencer")]
        public async Task<ActionResult<IEnumerable<ProductoResponseDTO>>> GetProximosAVencer(int kioscoId)
        {
            try
            {
                var productos = await _productoService.GetProximosAVencerAsync(kioscoId);
                return Ok(productos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener productos próximos a vencer", error = ex.Message });
            }
        }

        /// <summary>
        /// Buscar producto por código de barras
        /// </summary>
        [HttpGet("codigo-barra/{codigoBarra}")]
        public async Task<ActionResult<ProductoResponseDTO>> GetByCodigoBarra(string codigoBarra)
        {
            try
            {
                var producto = await _productoService.GetByCodigoBarraAsync(codigoBarra);

                if (producto == null)
                    return NotFound(new { message = $"No se encontró producto con código: {codigoBarra}" });

                return Ok(producto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al buscar producto", error = ex.Message });
            }
        }

        /// <summary>
        /// Buscar productos (por nombre, código o descripción)
        /// </summary>
        [HttpGet("kiosco/{kioscoId}/search")]
        public async Task<ActionResult<IEnumerable<ProductoResponseDTO>>> Search(int kioscoId, [FromQuery] string query)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(query))
                    return BadRequest(new { message = "Debe proporcionar un término de búsqueda" });

                var productos = await _productoService.SearchAsync(query, kioscoId);
                return Ok(productos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al buscar productos", error = ex.Message });
            }
        }

        // ========== POST - CREAR ==========

        /// <summary>
        /// Crear un nuevo producto
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ProductoResponseDTO>> Create([FromBody] CreateProductoDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var producto = await _productoService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = producto.ProductoId }, producto);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al crear producto", error = ex.Message });
            }
        }

        // ========== PUT - ACTUALIZAR ==========

        /// <summary>
        /// Actualizar un producto existente
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<ProductoResponseDTO>> Update(int id, [FromBody] UpdateProductoDTO dto)
        {
            try
            {
                if (id != dto.ProductoId)
                    return BadRequest(new { message = "El ID de la URL no coincide con el ID del producto" });

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var producto = await _productoService.UpdateAsync(dto);
                return Ok(producto);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al actualizar producto", error = ex.Message });
            }
        }

        // ========== DELETE - ELIMINAR ==========

        /// <summary>
        /// Eliminar (desactivar) un producto
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                await _productoService.DeleteAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al eliminar producto", error = ex.Message });
            }
        }

        // ========== PATCH - ACCIONES ESPECIALES ==========

        /// <summary>
        /// Activar o desactivar un producto
        /// </summary>
        [HttpPatch("{id}/toggle-activo")]
        public async Task<ActionResult> ToggleActivo(int id, [FromQuery] bool activo)
        {
            try
            {
                await _productoService.ActivarDesactivarAsync(id, activo);
                return Ok(new { message = $"Producto {(activo ? "activado" : "desactivado")} correctamente" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al cambiar estado del producto", error = ex.Message });
            }
        }

        /// <summary>
        /// Actualizar stock de un producto (suma o resta)
        /// </summary>
        [HttpPatch("{id}/stock")]
        public async Task<ActionResult> ActualizarStock(int id, [FromQuery] int cantidad)
        {
            try
            {
                await _productoService.ActualizarStockAsync(id, cantidad);
                return Ok(new { message = "Stock actualizado correctamente", cantidad });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al actualizar stock", error = ex.Message });
            }
        }
    }
}
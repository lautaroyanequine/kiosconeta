using Application.DTOs.Categoria;
using Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace KIOSCONETA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriasController : ControllerBase
    {
        private readonly ICategoriaService _categoriaService;

        public CategoriasController(ICategoriaService categoriaService)
        {
            _categoriaService = categoriaService;
        }

        /// <summary>
        /// Obtener todas las categorías
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoriaResponseDTO>>> GetAll()
        {
            try
            {
                var categorias = await _categoriaService.GetAllAsync();
                return Ok(categorias);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener categorías", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener categoría por ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<CategoriaResponseDTO>> GetById(int id)
        {
            try
            {
                var categoria = await _categoriaService.GetByIdAsync(id);
                if (categoria == null)
                    return NotFound(new { message = $"Categoría con ID {id} no encontrada" });

                return Ok(categoria);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener categoría", error = ex.Message });
            }
        }

        /// <summary>
        /// Crear nueva categoría
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<CategoriaResponseDTO>> Create([FromBody] CreateCategoriaDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var categoria = await _categoriaService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = categoria.CategoriaID }, categoria);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al crear categoría", error = ex.Message });
            }
        }

        /// <summary>
        /// Actualizar categoría
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<CategoriaResponseDTO>> Update(int id, [FromBody] UpdateCategoriaDTO dto)
        {
            try
            {
                if (id != dto.CategoriaID)
                    return BadRequest(new { message = "El ID de la URL no coincide con el ID del cuerpo" });

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var categoria = await _categoriaService.UpdateAsync(dto);
                return Ok(categoria);
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
                return StatusCode(500, new { message = "Error al actualizar categoría", error = ex.Message });
            }
        }

        /// <summary>
        /// Eliminar categoría (solo si no tiene productos)
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                await _categoriaService.DeleteAsync(id);
                return NoContent();
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
                return StatusCode(500, new { message = "Error al eliminar categoría", error = ex.Message });
            }
        }
    }
}
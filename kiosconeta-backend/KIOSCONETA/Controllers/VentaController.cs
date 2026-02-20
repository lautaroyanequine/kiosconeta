using Application.DTOs.Venta;
using Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KIOSCONETA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]  // ← Todos los endpoints requieren autenticación
    public class VentasController : ControllerBase
    {
        private readonly IVentaService _ventaService;

        public VentasController(IVentaService ventaService)
        {
            _ventaService = ventaService;
        }

        // ========== GET - CONSULTAS ==========

        /// <summary>
        /// Obtener todas las ventas
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VentaResponseDTO>>> GetAll()
        {
            try
            {
                var ventas = await _ventaService.GetAllAsync();
                return Ok(ventas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener ventas", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener venta por ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<VentaResponseDTO>> GetById(int id)
        {
            try
            {
                var venta = await _ventaService.GetByIdAsync(id);
                if (venta == null)
                    return NotFound(new { message = $"Venta con ID {id} no encontrada" });

                return Ok(venta);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener venta", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener ventas de un kiosco
        /// </summary>
        [HttpGet("kiosco/{kioscoId}")]
        public async Task<ActionResult<IEnumerable<VentaResponseDTO>>> GetByKiosco(int kioscoId)
        {
            try
            {
                var ventas = await _ventaService.GetByKioscoIdAsync(kioscoId);
                return Ok(ventas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener ventas", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener ventas del día de un kiosco
        /// </summary>
        [HttpGet("kiosco/{kioscoId}/hoy")]
        public async Task<ActionResult<IEnumerable<VentaResponseDTO>>> GetVentasDelDia(int kioscoId)
        {
            try
            {
                var ventas = await _ventaService.GetVentasDelDiaAsync(kioscoId);
                return Ok(ventas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener ventas del día", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener ventas de un empleado
        /// </summary>
        [HttpGet("empleado/{empleadoId}")]
        public async Task<ActionResult<IEnumerable<VentaResponseDTO>>> GetByEmpleado(int empleadoId)
        {
            try
            {
                var ventas = await _ventaService.GetByEmpleadoIdAsync(empleadoId);
                return Ok(ventas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener ventas", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener ventas por rango de fechas
        /// </summary>
        [HttpGet("fecha")]
        public async Task<ActionResult<IEnumerable<VentaResponseDTO>>> GetByFecha(
            [FromQuery] DateTime fechaDesde,
            [FromQuery] DateTime fechaHasta)
        {
            try
            {
                var ventas = await _ventaService.GetByFechaAsync(fechaDesde, fechaHasta);
                return Ok(ventas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener ventas", error = ex.Message });
            }
        }

        /// <summary>
        /// Buscar ventas con filtros
        /// </summary>
        [HttpPost("kiosco/{kioscoId}/buscar")]
        public async Task<ActionResult<IEnumerable<VentaResponseDTO>>> Buscar(
            int kioscoId,
            [FromBody] VentaFiltrosDTO filtros)
        {
            try
            {
                var ventas = await _ventaService.GetConFiltrosAsync(kioscoId, filtros);
                return Ok(ventas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al buscar ventas", error = ex.Message });
            }
        }

        // ========== POST - CREAR ==========

        /// <summary>
        /// Registrar nueva venta
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<VentaResponseDTO>> Create([FromBody] CreateVentaDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var venta = await _ventaService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = venta.VentaId }, venta);
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
                return StatusCode(500, new { message = "Error al crear venta", error = ex.Message });
            }
        }

        // ========== DELETE - ANULAR ==========

        /// <summary>
        /// Anular venta (devuelve stock)
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> Anular(int id)
        {
            try
            {
                await _ventaService.AnularVentaAsync(id);
                return Ok(new { message = "Venta anulada correctamente. Stock devuelto." });
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
                return StatusCode(500, new { message = "Error al anular venta", error = ex.Message });
            }
        }
    }
}
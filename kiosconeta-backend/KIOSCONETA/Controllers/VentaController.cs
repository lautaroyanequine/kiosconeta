using Application.DTOs.Venta;
using Application.Interfaces.Services;
using KIOSCONETA.Attributes;
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
        /// Obtener todas las ventas

        [HttpGet]
        [RequierePermiso("productos.ver_todas")]

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

        /// Obtener venta por ID
        
        [HttpGet("{id}")]
        [RequierePermiso("productos.ver")]
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

        /// Obtener ventas de un kiosco
        [HttpGet("kiosco/{kioscoId}")]
        [RequierePermiso("productos.ver")]

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

        /// Obtener ventas del día de un kiosco
        [HttpGet("kiosco/{kioscoId}/hoy")]
        [RequierePermiso("productos.ver")]

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

        /// Obtener ventas de un empleado
        [HttpGet("empleado/{empleadoId}")]
        [RequierePermiso("productos.ver_por_empleado")]

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

        /// Obtener ventas por rango de fechas
        [HttpGet("fecha")]
        [RequierePermiso("productos.ver")]

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

        /// Buscar ventas con filtros
        [HttpPost("kiosco/{kioscoId}/buscar")]
        [RequierePermiso("productos.ver")]

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

        /// Registrar nueva venta
        [HttpPost]
        [RequierePermiso("ventas.crear")]

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

        /// Anular venta (devuelve stock)
        [HttpDelete("{id}")]
        [RequierePermiso("ventas.anular")]

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
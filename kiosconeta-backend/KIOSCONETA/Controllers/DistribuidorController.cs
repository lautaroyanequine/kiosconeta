using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class DistribuidorController : ControllerBase
{
    private readonly IDistribuidorRepository _repo;
    public DistribuidorController(IDistribuidorRepository repo) => _repo = repo;

    [HttpGet("kiosco/{kioscoId}")]
    public async Task<ActionResult<IEnumerable<DistribuidorResponseDTO>>> GetByKiosco(int kioscoId)
    {
        var data = await _repo.GetByKioscoAsync(kioscoId);
        return Ok(data.Select(MapToDTO));
    }

    [HttpPost("kiosco/{kioscoId}")]
    public async Task<ActionResult<DistribuidorResponseDTO>> Create(int kioscoId, CreateDistribuidorDTO dto)
    {
        var d = new Distribuidor
        {
            Nombre = dto.Nombre.Trim(),
            Telefono = dto.Telefono?.Trim(),
            Email = dto.Email?.Trim(),
            Notas = dto.Notas?.Trim(),
            KioscoId = kioscoId,
            Activo = true,
            FechaCreacion = DateTime.UtcNow,
        };
        var creado = await _repo.CreateAsync(d);
        return CreatedAtAction(nameof(GetByKiosco), new { kioscoId }, MapToDTO(creado));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<DistribuidorResponseDTO>> Update(int id, UpdateDistribuidorDTO dto)
    {
        var d = await _repo.GetByIdAsync(id);
        if (d == null) return NotFound();
        d.Nombre = dto.Nombre.Trim();
        d.Telefono = dto.Telefono?.Trim();
        d.Email = dto.Email?.Trim();
        d.Notas = dto.Notas?.Trim();
        d.Activo = dto.Activo;
        var actualizado = await _repo.UpdateAsync(d);
        return Ok(MapToDTO(actualizado));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var result = await _repo.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private static DistribuidorResponseDTO MapToDTO(Distribuidor d) => new()
    {
        DistribuidorId = d.DistribuidorId,
        Nombre = d.Nombre,
        Telefono = d.Telefono,
        Email = d.Email,
        Notas = d.Notas,
        Activo = d.Activo,
        CantidadProductos = d.Productos?.Count ?? 0,
    };
}
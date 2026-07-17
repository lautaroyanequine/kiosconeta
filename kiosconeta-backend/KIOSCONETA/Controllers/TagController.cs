using Application.DTOs.Tag;
using Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class TagController : ControllerBase
{
    private readonly ITagService _tagService;

    public TagController(ITagService tagService)
    {
        _tagService = tagService;
    }

    [HttpGet("kiosco/{kioscoId}")]
    public async Task<IActionResult> GetByKiosco(int kioscoId)
    {
        var tags = await _tagService.GetByKioscoIdAsync(kioscoId);
        return Ok(tags);
    }

    [HttpPost("kiosco/{kioscoId}")]
    public async Task<IActionResult> Create(int kioscoId, [FromBody] CreateTagDTO dto)
    {
        dto.KioscoId = kioscoId;
        var creado = await _tagService.CreateAsync(dto);
        return Ok(creado);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ok = await _tagService.DeleteAsync(id);
        if (!ok) return NotFound();
        return NoContent();
    }
}
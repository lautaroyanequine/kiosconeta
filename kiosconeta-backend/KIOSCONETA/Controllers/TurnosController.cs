using Application.Interfaces.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KIOSCONETA.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]

    public class TurnosController : Controller
    {
        // GET /api/Turnos — lista Mañana, Tarde, Noche
        [HttpGet]
        public async Task<ActionResult> GetTurnos(
            [FromServices] ITurnoRepository turnoRepository)
        {
            var turnos = await turnoRepository.GetAllAsync();
            return Ok(turnos.Select(t => new
            {
                turnoId = t.TurnoId,
                nombre = t.Nombre
            }));
        }
    }
}

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Application.Interfaces.Repository;
using System.Security.Claims;

namespace KIOSCONETA.Attributes
{
    /// <summary>
    /// Atributo para proteger endpoints con permisos específicos
    /// Uso: [RequierePermiso("productos.crear")]
    /// </summary>
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false)]
    public class RequierePermisoAttribute : Attribute, IAsyncAuthorizationFilter
    {
        private readonly string _permiso;

        public RequierePermisoAttribute(string permiso)
        {
            _permiso = permiso;
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            // Obtener el EmpleadoId del token JWT
            var empleadoIdClaim = context.HttpContext.User.FindFirst("UsuarioID")?.Value;

            if (string.IsNullOrEmpty(empleadoIdClaim) || !int.TryParse(empleadoIdClaim, out int empleadoId))
            {
                context.Result = new UnauthorizedObjectResult(new
                {
                    message = "No autenticado"
                });
                return;
            }

            // Obtener el servicio de permisos
            var permisoRepository = context.HttpContext.RequestServices
                .GetService<IPermisoRepository>();

            if (permisoRepository == null)
            {
                context.Result = new StatusCodeResult(500);
                return;
            }

            // Verificar si el empleado tiene el permiso
            var tienePermiso = await permisoRepository.EmpleadoTienePermisoAsync(empleadoId, _permiso);

            if (!tienePermiso)
            {
                context.Result = new ObjectResult(new
                {
                    message = "No tiene permisos para realizar esta acción",
                    permisoRequerido = _permiso
                })
                {
                    StatusCode = 403 // Forbidden
                };
            }
        }
    }
}
using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestructure.Persistence.DataKiosconeta.Seed
{
    public static class EmpleadoPermisoData
    {
        public static void Seed(EntityTypeBuilder<EmpleadoPermiso> entity)
        {
            var adminPermisos = new List<EmpleadoPermiso>();

            int id = -1; // usar negativos para evitar colisiones

            for (int permisoId = 1; permisoId <= 46; permisoId++)
            {
                adminPermisos.Add(new EmpleadoPermiso
                {
                    EmpleadoPermisoId = id--, // 👈 CLAVE
                    EmpleadoId = 1,
                    PermisoId = permisoId
                });
            }

            entity.HasData(adminPermisos.ToArray());
        }
    }
}
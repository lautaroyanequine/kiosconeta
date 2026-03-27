using Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestructure.Persistence.DataKiosconeta.Seed
{
    public static class TurnoData
    {
        public static void Seed(EntityTypeBuilder<Turno> entity)
        {
            entity.HasData(
                new Turno
                {
                    TurnoId = 1,
                    Nombre = "Mañana"
                },
                new Turno
                {
                    TurnoId = 2,
                    Nombre = "Tarde"
                },
                new Turno
                {
                    TurnoId = 3,
                    Nombre = "Noche"
                }
            );
        }
    }
}

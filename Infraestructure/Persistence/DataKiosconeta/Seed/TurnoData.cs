using Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infraestructure.Persistence.DataKiosconeta.Seed
{
    public static class TurnoData
    {
        public static void Seed(EntityTypeBuilder<Turno> entity)
        {
            entity.HasData(
                new Turno { TurnoID = 1, Nombre = "Mañana" },
                new Turno { TurnoID = 2, Nombre = "Tarde" },
                new Turno { TurnoID = 3, Nombre = "Noche" }
            );
        }
    }

}

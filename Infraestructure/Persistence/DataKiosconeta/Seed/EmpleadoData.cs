using Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infraestructure.Persistence.DataKiosconeta.Seed
{
    public static class EmpleadoData
    {
        public static void Seed(EntityTypeBuilder<Empleado> entity)
        {
            entity.HasData(
                new Empleado
                {
                    EmpleadoId = 1,
                    Nombre = "Luchi <3",
                    KioscoID = 1,
                    Activo = true
                }
            );
        }
    }

}

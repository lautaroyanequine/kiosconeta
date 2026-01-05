using Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infraestructure.Persistence.DataKiosconeta.Seed
{
    public static class MetodoPagoData
    {
        public static void Seed(EntityTypeBuilder<MetodoDePago> entity)
        {
            entity.HasData(
                new MetodoDePago { MetodoDePagoID = 1, Nombre = "Efectivo" },
                new MetodoDePago { MetodoDePagoID = 2, Nombre = "Mercado Pago" },
                new MetodoDePago { MetodoDePagoID = 3, Nombre = "Débito" }
            );
        }
    }

}

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infraestructure.Persistence.DataKiosconeta.Seed
{
    public static class CategoriaData
    {
        public static void Seed(EntityTypeBuilder<Categoria> entity)
        {
            entity.HasData(
                new Categoria { CategoriaID = 1, Nombre = "Bebidas" },
                new Categoria { CategoriaID = 2, Nombre = "Golosinas" },
                new Categoria { CategoriaID = 3, Nombre = "Cigarrillos" }
            );
        }
    }


}

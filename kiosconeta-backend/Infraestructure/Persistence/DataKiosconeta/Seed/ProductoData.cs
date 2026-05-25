using Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestructure.Persistence.DataKiosconeta.Seed
{
    public static class ProductoData
    {
        public static void Seed(EntityTypeBuilder<Producto> entity)
        {
            var fechaBase = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);

            entity.HasData(


                
            );
        }
    }
}
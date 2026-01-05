using Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public static class KioscoData
{
    public static void Seed(EntityTypeBuilder<Kiosco> entityBuilder)
    {
        entityBuilder.HasData(
            new Kiosco
            {
                KioscoID = 1,
                Nombre = "Kiosconeta 1",
                Direccion = "845 2595",
                
            }
        );
    }
}

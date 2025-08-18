using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestructure.Persistence.Config
{
    public class MetodoDePagoConfiguration
    {
        public MetodoDePagoConfiguration(EntityTypeBuilder<MetodoDePago> entityBuilder)
        {
            entityBuilder.ToTable("MetodoDePago");
            entityBuilder.Property(m => m.MetodoDePagoID).ValueGeneratedOnAdd();
            entityBuilder.Property(m => m.Nombre).HasMaxLength(50);
            /*  entityBuilder
                  .HasMany<Mercaderia>(tm => tm.Mercaderias)
                  .WithOne(m => m.TipoMercaderia)
                  .HasForeignKey(m => m.TipoMercaderiaId);*/
        }

    }
}

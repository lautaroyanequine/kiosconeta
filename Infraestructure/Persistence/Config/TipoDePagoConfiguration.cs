using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestructure.Persistence.Config
{
    public class TipoDeGastoConfiguration
    {
        public TipoDeGastoConfiguration(EntityTypeBuilder<TipoDeGasto> entityBuilder)
        {
            entityBuilder.ToTable("TipoDeGasto");
            entityBuilder.Property(m => m.TipoDeGastoID).ValueGeneratedOnAdd();
            entityBuilder.Property(m => m.Nombre).HasMaxLength(50);
        }
    }
}

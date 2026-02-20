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

            entityBuilder.HasKey(t => t.TipoDeGastoId);

            entityBuilder.Property(t => t.TipoDeGastoId)
                .ValueGeneratedOnAdd();

            entityBuilder.Property(t => t.Nombre)
                .HasMaxLength(100)
                .IsRequired();

            entityBuilder.Property(t => t.Descripcion)
                .HasMaxLength(250);

            entityBuilder.Property(t => t.Activo)
                .HasDefaultValue(true)
                .IsRequired();

            // TipoDeGasto (1) -> Gastos (N)
            entityBuilder.HasMany(t => t.Gastos)
                .WithOne(g => g.TipoDeGasto)
                .HasForeignKey(g => g.TipoDeGastoId)
                .OnDelete(DeleteBehavior.Restrict);

            // Evita tipos duplicados
            entityBuilder.HasIndex(t => t.Nombre)
                .IsUnique();
        }

    }
}

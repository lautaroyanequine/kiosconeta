using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestructure.Persistence.Config
{
    public class GastoConfiguration
    {
        public GastoConfiguration(EntityTypeBuilder<Gasto> entityBuilder)
        {
            entityBuilder.ToTable("Gasto");

            entityBuilder.HasKey(g => g.GastoId);

            entityBuilder.Property(g => g.GastoId)
                .ValueGeneratedOnAdd();

            entityBuilder.Property(g => g.Nombre)
        .HasMaxLength(150)
        .IsRequired();

            entityBuilder.Property(g => g.Fecha)
                .HasColumnType("datetime2")
                .HasDefaultValueSql("GETDATE()")
                .IsRequired();

            entityBuilder.Property(g => g.Descripcion)
                .HasMaxLength(300);

            entityBuilder.Property(g => g.Monto)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            entityBuilder.HasIndex(g => g.Fecha);
        }

    }
}

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestructure.Persistence.Config
{
    public class KioscoConfiguration
    {
        public KioscoConfiguration(EntityTypeBuilder<Kiosco> entityBuilder)
        {
            entityBuilder.ToTable("Kiosco");
            entityBuilder.Property(m => m.KioscoID).ValueGeneratedOnAdd();
            entityBuilder.Property(m => m.Nombre).HasMaxLength(50);
            entityBuilder.Property(m => m.Direccion).HasMaxLength(50);
            entityBuilder // KioscoConfiguration
            .HasMany(k => k.Empleados)
            .WithOne(e => e.Kiosco)
            .HasForeignKey(e => e.KioscoID)
            .OnDelete(DeleteBehavior.Cascade);

            entityBuilder.HasMany(k => k.Gastos)
            .WithOne(g => g.Kiosco)
            .HasForeignKey(g => g.KioscoId)
            .OnDelete(DeleteBehavior.Restrict);
            entityBuilder.HasMany(k => k.CierreTurnos)
                .WithOne(ct => ct.Kiosco)
                .HasForeignKey(ct => ct.KioscoId)
                .OnDelete(DeleteBehavior.Restrict);

        }
    }
}

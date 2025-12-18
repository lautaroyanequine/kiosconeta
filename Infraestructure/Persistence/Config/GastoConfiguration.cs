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
            entityBuilder.Property(m => m.GastoId).ValueGeneratedOnAdd();
            entityBuilder.Property(m => m.Fecha);
            entityBuilder.Property(m => m.Descripcion).HasMaxLength(250);
            entityBuilder.HasOne(g => g.Kiosco)
              .WithMany(k => k.Gastos)
              .HasForeignKey(g => g.KioscoId)
              .OnDelete(DeleteBehavior.Restrict);
            entityBuilder.HasOne(g => g.Empleado)
                .WithMany(e => e.Gastos)
                .HasForeignKey(g => g.EmpleadoId)
                .OnDelete(DeleteBehavior.Restrict);
            entityBuilder.HasOne(g => g.TipoDeGasto)
                .WithMany(e => e.Gastos)
                .HasForeignKey(g => g.TipodeGastoId)
                .OnDelete(DeleteBehavior.Restrict);


        }
    }
}

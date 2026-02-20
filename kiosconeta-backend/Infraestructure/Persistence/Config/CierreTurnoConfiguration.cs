using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestructure.Persistence.Config
{
    public class CierreTurnoConfiguration
    {
        public CierreTurnoConfiguration(EntityTypeBuilder<CierreTurno> entityBuilder)
        {
            entityBuilder.HasKey(ct => ct.CierreTurnoId);

            entityBuilder.Property(ct => ct.Fecha)
                .IsRequired();

            entityBuilder.Property(ct => ct.CantidadVentas)
                .IsRequired();

                entityBuilder.Property(ct => ct.MontoEsperado)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            entityBuilder.Property(ct => ct.MontoReal)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            entityBuilder.Property(ct => ct.Diferencia)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            entityBuilder.Property(ct => ct.Efectivo)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            entityBuilder.Property(ct => ct.Virtual)
                .HasColumnType("decimal(18,2)")
                .IsRequired();
            entityBuilder.HasMany(c => c.cierreTurnoEmpleados)
                .WithOne(cte => cte.CierreTurno)
                .HasForeignKey(cte => cte.CierreTurnoId)
                .OnDelete(DeleteBehavior.Restrict);


            entityBuilder.Property(ct => ct.Observaciones)
                .HasMaxLength(500);

            entityBuilder.Property(ct => ct.Estado)
                .IsRequired();


            entityBuilder.HasMany(ct => ct.Ventas)
                .WithOne(v => v.CierreTurno)
                .HasForeignKey(v => v.CierreTurnoId)
                .OnDelete(DeleteBehavior.Restrict);

            
        }
    }
}

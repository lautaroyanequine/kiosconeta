using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestructure.Persistence.Config
{
    public class EmpleadoConfiguration
    {
        public EmpleadoConfiguration(EntityTypeBuilder<Empleado> entityBuilder)
        {
            entityBuilder.ToTable("Empleado");

            entityBuilder.HasKey(e => e.EmpleadoId);

            entityBuilder.Property(e => e.EmpleadoId)
                .ValueGeneratedOnAdd();

            entityBuilder.Property(e => e.Nombre)
                .HasMaxLength(100)
                .IsRequired();

            // Empleado (1) -> CierreTurnoEmpleado (N)
            entityBuilder.HasMany(e => e.CierreTurnoEmpleados)
                .WithOne(cte => cte.Empleado)
                .HasForeignKey(cte => cte.EmpleadoId)
                .OnDelete(DeleteBehavior.Restrict);
            entityBuilder.HasMany(e => e.Ventas)
            .WithOne(v => v.Empleado)
            .HasForeignKey(v => v.EmpleadoId)
            .OnDelete(DeleteBehavior.Restrict);

            entityBuilder.HasMany(e => e.Gastos)
                .WithOne(g => g.Empleado)
                .HasForeignKey(g => g.EmpleadoId)
                .OnDelete(DeleteBehavior.Restrict);
                            entityBuilder.HasMany(e => e.CierreTurnoEmpleados)
                    .WithOne(cte => cte.Empleado)
                    .HasForeignKey(cte => cte.EmpleadoId)
                    .OnDelete(DeleteBehavior.Restrict);

        }
    }
}

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestructure.Persistence.Config
{
    public class VentaConfiguration
    {
        public VentaConfiguration(EntityTypeBuilder<Venta> entityBuilder)
        {
            entityBuilder.ToTable("Venta");

            entityBuilder.HasKey(v => v.VentaId);

            entityBuilder.Property(v => v.VentaId)
                .ValueGeneratedOnAdd();

            entityBuilder.Property(v => v.Fecha)
                .HasColumnType("datetime2")
                .HasDefaultValueSql("GETDATE()")
                .IsRequired();

            entityBuilder.Property(v => v.Total)
                .HasColumnType("decimal(18,2)")
                .IsRequired();
            entityBuilder.Property(v => v.PrecioCosto)
            .HasColumnType("decimal(18,2)")
            .IsRequired();


            entityBuilder.Property(v => v.Detalles)
                .HasMaxLength(300);

            // Índices útiles para consultas reales
            entityBuilder.HasIndex(v => v.Fecha);
            entityBuilder.HasIndex(v => v.EmpleadoId);
            entityBuilder.HasIndex(v => v.CierreTurnoId);
            entityBuilder.HasIndex(v => v.MetodoPagoId);
            entityBuilder.HasIndex(v => v.TurnoId);

        }

    }
}

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class CierreTurnoConfiguration
    {
        public CierreTurnoConfiguration(EntityTypeBuilder<CierreTurno> entityBuilder)
        {
            entityBuilder.HasKey(ct => ct.CierreTurnoId);

            // ───────────── FECHAS ─────────────

            entityBuilder.Property(ct => ct.FechaApertura)
                .IsRequired();

            entityBuilder.Property(ct => ct.FechaCierre);

            // ───────────── MONTOS ─────────────

            entityBuilder.Property(ct => ct.MontoEsperado)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            entityBuilder.Property(ct => ct.MontoReal)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            entityBuilder.Property(ct => ct.Diferencia)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            entityBuilder.Property(ct => ct.EfectivoInicial)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            entityBuilder.Property(ct => ct.EfectivoFinal)
                .HasColumnType("decimal(18,2)");

            entityBuilder.Property(ct => ct.VirtualFinal)
                .HasColumnType("decimal(18,2)");

            

            entityBuilder.Property(ct => ct.CantidadVentas)
                .IsRequired();

            entityBuilder.Property(ct => ct.Estado)
                .IsRequired()
                .HasConversion<int>();

            entityBuilder.Property(ct => ct.Observaciones)
                .HasMaxLength(500);

            // ───────────── RELACIONES ─────────────

            entityBuilder.HasMany(ct => ct.Ventas)
                .WithOne(v => v.CierreTurno)
                .HasForeignKey(v => v.CierreTurnoId)
                .OnDelete(DeleteBehavior.Restrict);

            entityBuilder.HasMany(ct => ct.CierreTurnoEmpleados)
                .WithOne(cte => cte.CierreTurno)
                .HasForeignKey(cte => cte.CierreTurnoId)
                .OnDelete(DeleteBehavior.Restrict);

            // ───────────── ÍNDICE ÚTIL ─────────────

            entityBuilder.HasIndex(ct => new { ct.KioscoId, ct.Estado });
        }
    }
}

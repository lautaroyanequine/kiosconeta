using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestructure.Persistence.Configurations
{
    public class MovimientoCajaConfiguration
    {
        public MovimientoCajaConfiguration(EntityTypeBuilder<MovimientoCaja> entity)
        {
            entity.ToTable("MovimientoCaja");

            entity.HasKey(m => m.MovimientoCajaId);

            entity.Property(m => m.MovimientoCajaId)
                .ValueGeneratedOnAdd();

            entity.Property(m => m.Descripcion)
                .HasMaxLength(300)
                .IsRequired();

            entity.Property(m => m.Monto)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            entity.Property(m => m.Tipo)
                .IsRequired();

            entity.Property(m => m.Fecha)
                .HasColumnType("datetime2")
                .HasDefaultValueSql("GETDATE()")
                .IsRequired();

            entity.HasIndex(m => m.Fecha);
            entity.HasIndex(m => m.KioscoId);

            entity.HasOne(m => m.Kiosco)
                .WithMany()
                .HasForeignKey(m => m.KioscoId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(m => m.Empleado)
                .WithMany()
                .HasForeignKey(m => m.EmpleadoId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }

    public class SaldoCajaConfiguration
    {
        public SaldoCajaConfiguration(EntityTypeBuilder<SaldoCaja> entity)
        {
            entity.ToTable("SaldoCaja");

            entity.HasKey(s => s.SaldoCajaId);

            entity.Property(s => s.SaldoCajaId)
                .ValueGeneratedOnAdd();

            entity.Property(s => s.SaldoInicial)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            entity.Property(s => s.FechaActualizacion)
                .HasColumnType("datetime2")
                .HasDefaultValueSql("GETDATE()")
                .IsRequired();

            // Un kiosco tiene un solo saldo de caja
            entity.HasIndex(s => s.KioscoId).IsUnique();

            entity.HasOne(s => s.Kiosco)
                .WithMany()
                .HasForeignKey(s => s.KioscoId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
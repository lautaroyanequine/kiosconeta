using Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

public class AuditoriaLogConfiguration
{
    public AuditoriaLogConfiguration(EntityTypeBuilder<AuditoriaLog> builder)
    {
        builder.ToTable("AuditoriaLog");

        builder.HasKey(a => a.AuditoriaLogId);

        builder.Property(a => a.AuditoriaLogId).ValueGeneratedOnAdd();

        builder.Property(a => a.Fecha)
            .HasDefaultValueSql("NOW()")
            .IsRequired();

        builder.Property(a => a.TipoEvento).HasMaxLength(50).IsRequired();
        builder.Property(a => a.Descripcion).HasMaxLength(500).IsRequired();
        builder.Property(a => a.DatosJson).HasColumnType("nvarchar(max)");
        builder.Property(a => a.MotivoSospecha).HasMaxLength(300);

        builder.HasIndex(a => a.EmpleadoId);
        builder.HasIndex(a => a.KioscoId);
        builder.HasIndex(a => a.Fecha);
        builder.HasIndex(a => a.EsSospechoso);


        builder.HasOne(a => a.Empleado)
            .WithMany()
            .HasForeignKey(a => a.EmpleadoId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(a => a.Kiosco)
            .WithMany()
            .HasForeignKey(a => a.KioscoId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.Property(a => a.DatosJson).HasColumnType("text");
    }
}
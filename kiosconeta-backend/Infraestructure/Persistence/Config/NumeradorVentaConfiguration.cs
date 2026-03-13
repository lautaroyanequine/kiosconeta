using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class NumeradorVentaConfiguration

{
    public NumeradorVentaConfiguration(EntityTypeBuilder<NumeradorVenta> entityBuilder)
    {

        entityBuilder.ToTable("NumeradoresVenta");

        entityBuilder.HasKey(n => n.NumeradorVentaId);

        entityBuilder.Property(n => n.UltimoNumero)
            .IsRequired();

        entityBuilder.Property(n => n.UltimaActualizacion)
            .IsRequired();

        // FK con Kiosco
        entityBuilder.HasOne(n => n.Kiosco)
            .WithOne(k => k.NumeradorVenta)
            .HasForeignKey<NumeradorVenta>(n => n.KioscoId)
            .OnDelete(DeleteBehavior.Restrict);

        // índice único por kiosco
        entityBuilder.HasIndex(n => n.KioscoId)
            .IsUnique();
    }

}
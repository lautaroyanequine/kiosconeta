using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestructure.Persistence.Config
{
    public class ProductoConfiguration
    {
        public ProductoConfiguration(EntityTypeBuilder<Producto> entityBuilder)
        {
            entityBuilder.ToTable("Producto");

            entityBuilder.HasKey(p => p.ProductoId);

            entityBuilder.Property(p => p.ProductoId)
                .ValueGeneratedOnAdd();

            entityBuilder.Property(p => p.Nombre)
                .HasMaxLength(150)
                .IsRequired();

            entityBuilder.Property(p => p.PrecioCosto)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            entityBuilder.Property(p => p.PrecioVenta)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            entityBuilder.Property(p => p.CodigoBarra)
                .HasMaxLength(50);

            entityBuilder.Property(p => p.Distribuidor)
                .HasMaxLength(100);

            entityBuilder.Property(p => p.Descripcion)
                .HasMaxLength(300);

            entityBuilder.Property(p => p.Imagen)
                .HasMaxLength(300);

            entityBuilder.Property(p => p.StockActual)
                .IsRequired();

            entityBuilder.Property(p => p.StockMinimo)
                .IsRequired();

            entityBuilder.Property(p => p.Activo)
                .HasDefaultValue(true);

            entityBuilder.Property(p => p.Suelto)
                .HasDefaultValue(false);

            entityBuilder.Property(p => p.FechaCreacion)
                .HasColumnType("datetime2")
                .HasDefaultValueSql("GETDATE()");

            entityBuilder.Property(p => p.FechaModificacion)
                .HasColumnType("datetime2");

            entityBuilder.Property(p => p.FechaVencimiento)
                .HasColumnType("datetime2");

            entityBuilder.HasMany(p => p.ProductoVentas)
                .WithOne(pv => pv.Producto)
                .HasForeignKey(pv => pv.ProductoId)
                .OnDelete(DeleteBehavior.Restrict);


        }
    }
}

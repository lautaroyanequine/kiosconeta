using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestructure.Persistence.Config
{
    public class PromocionConfiguration
    {
        public PromocionConfiguration(EntityTypeBuilder<Promocion> builder)
        {
            builder.ToTable("Promocion");
            builder.HasKey(p => p.PromocionId);
            builder.Property(p => p.PromocionId).ValueGeneratedOnAdd();
            builder.Property(p => p.Nombre).HasMaxLength(100).IsRequired();
            builder.Property(p => p.Descripcion).HasMaxLength(300);
            builder.Property(p => p.PrecioCombo).HasColumnType("decimal(18,2)");
            builder.Property(p => p.PorcentajeDescuento).HasColumnType("decimal(5,2)");
            builder.HasIndex(p => p.KioscoId);
            builder.HasIndex(p => p.Activa);

            // Relaciones sin cascade para evitar múltiples paths
            builder.HasOne(p => p.ProductoCantidad)
                .WithMany()
                .HasForeignKey(p => p.ProductoIdCantidad)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(p => p.ProductoPorcentaje)
                .WithMany()
                .HasForeignKey(p => p.ProductoIdPorcentaje)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(p => p.CategoriaPorcentaje)
                .WithMany()
                .HasForeignKey(p => p.CategoriaIdPorcentaje)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }

    public class PromocionProductoConfiguration
    {
        public PromocionProductoConfiguration(EntityTypeBuilder<PromocionProducto> builder)
        {
            builder.ToTable("PromocionProducto");
            builder.HasKey(pp => pp.PromocionProductoId);
            builder.Property(pp => pp.PromocionProductoId).ValueGeneratedOnAdd();
            builder.Property(pp => pp.Cantidad).HasDefaultValue(1);

            // NO ACTION en ambas FKs para evitar cascade paths
            builder.HasOne(pp => pp.Promocion)
                .WithMany(p => p.PromocionProductos)
                .HasForeignKey(pp => pp.PromocionId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(pp => pp.Producto)
                .WithMany()
                .HasForeignKey(pp => pp.ProductoId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
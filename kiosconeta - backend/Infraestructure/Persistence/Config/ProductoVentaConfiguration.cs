using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestructure.Persistence.Config
{
    public class ProductoVentaConfiguration
    {
        public ProductoVentaConfiguration(EntityTypeBuilder<ProductoVenta> entityBuilder)
        {
            entityBuilder.ToTable("ProductoVenta");

            entityBuilder.HasKey(pv => pv.ProductoVentaId);

            entityBuilder.Property(pv => pv.ProductoVentaId)
                .ValueGeneratedOnAdd();

            entityBuilder.Property(pv => pv.Cantidad)
                .IsRequired();

            entityBuilder.Property(pv => pv.PrecioUnitario)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            entityBuilder.HasOne(pv => pv.Producto)
                .WithMany(p => p.ProductoVentas)
                .HasForeignKey(pv => pv.ProductoId);

            entityBuilder.HasOne(pv => pv.Venta)
                .WithMany(v => v.ProductoVentas)
                .HasForeignKey(pv => pv.VentaId);


        }
    }
}

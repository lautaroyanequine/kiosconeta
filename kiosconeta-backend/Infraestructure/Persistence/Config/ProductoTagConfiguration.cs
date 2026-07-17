using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.Reflection.Emit;

namespace Infraestructure.Persistence.Config
{
    public class ProductoTagConfiguration
    {
        public ProductoTagConfiguration(EntityTypeBuilder<ProductoTag> entityBuilder)
        {
            entityBuilder.ToTable("Producto");
            entityBuilder
                .HasKey(pt => new { pt.ProductoId, pt.TagId });

            entityBuilder
                .HasOne(pt => pt.Producto)
                .WithMany(p => p.ProductoTags)
                .HasForeignKey(pt => pt.ProductoId);

            entityBuilder
                .HasOne(pt => pt.Tag)
                .WithMany(t => t.ProductoTags)
                .HasForeignKey(pt => pt.TagId);

           

        }
    }
}

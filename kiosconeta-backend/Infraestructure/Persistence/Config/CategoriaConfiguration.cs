using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.Reflection.Emit;

namespace Infraestructure.Persistence.Config
{
    public class CategoriaConfiguration
    {
        public CategoriaConfiguration(EntityTypeBuilder<Categoria> entityBuilder)
        {
            entityBuilder.ToTable("Categoria");
            entityBuilder.Property(m => m.CategoriaID).ValueGeneratedOnAdd();
            entityBuilder.Property(m => m.Nombre).HasMaxLength(50);
            entityBuilder.HasOne(c => c.Kiosco)
        .WithMany()
        .HasForeignKey(c => c.KioscoId)
        .OnDelete(DeleteBehavior.NoAction);

        }
    }
}

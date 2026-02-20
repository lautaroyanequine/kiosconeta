using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestructure.Persistence.Config
{
    public class CategoriaConfiguration
    {
        public CategoriaConfiguration(EntityTypeBuilder<Categoria> entityBuilder)
        {
            entityBuilder.ToTable("Categoria");
            entityBuilder.Property(m => m.CategoriaID).ValueGeneratedOnAdd();
            entityBuilder.Property(m => m.Nombre).HasMaxLength(50);
        }
    }
}

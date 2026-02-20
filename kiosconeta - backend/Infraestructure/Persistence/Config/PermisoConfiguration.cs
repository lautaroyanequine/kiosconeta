using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestructure.Persistence.Config
{
    public class PermisoConfiguration
    {
        public PermisoConfiguration(EntityTypeBuilder<Permiso> entityBuilder)
        {
            entityBuilder.ToTable("Permiso");
            entityBuilder.Property(m => m.PermisoID).ValueGeneratedOnAdd();
            entityBuilder.Property(m => m.Nombre).HasMaxLength(50);
            entityBuilder.Property(m => m.Descripcion).HasMaxLength(50); ;
        }

    }
}

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestructure.Persistence.Config
{
    public class TurnoConfiguration
    {
        public TurnoConfiguration(EntityTypeBuilder<Turno> entityBuilder)
        {
            entityBuilder.ToTable("Turno");
            entityBuilder.Property(m => m.TurnoID).ValueGeneratedOnAdd();
            entityBuilder.HasMany(t => t.Ventas)
                .WithOne(v => v.Turno)
                .HasForeignKey(v => v.TurnoId)
                .OnDelete(DeleteBehavior.Restrict);

        }
    }
}

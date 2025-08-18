using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infraestructure.Persistence.Config
{
    public class KioscoConfiguration
    {
        public KioscoConfiguration(EntityTypeBuilder<Kiosco> entityBuilder) {
            entityBuilder.ToTable("Kiosco");
            entityBuilder.Property(m => m.KioscoID).ValueGeneratedOnAdd();
            entityBuilder.Property(m => m.Nombre).HasMaxLength(50);
            entityBuilder.Property(m => m.Direccion).HasMaxLength(50);
            entityBuilder // KioscoConfiguration
            .HasMany(k => k.Empleados)
            .WithOne(e => e.Kiosco)
            .HasForeignKey(e => e.KioscoID)
            .OnDelete(DeleteBehavior.Cascade);


        }
    }
}

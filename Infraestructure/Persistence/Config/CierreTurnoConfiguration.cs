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
    public class CierreTurnoConfiguration
    {
        public CierreTurnoConfiguration(EntityTypeBuilder<CierreTurno> entityBuilder)
        {
            entityBuilder.ToTable("CierreTurno");
            entityBuilder.Property(m => m.CierreTurnoId).ValueGeneratedOnAdd();
            entityBuilder.Property(m => m.Fecha);
            entityBuilder.Property(m => m.Observaciones).HasMaxLength(250);
            entityBuilder.HasOne(x => x.Kiosco)
            .WithMany(k => k.CierreTurnos)
            .HasForeignKey(x => x.KioscoId)
            .OnDelete(DeleteBehavior.Restrict);


        }
    }
}

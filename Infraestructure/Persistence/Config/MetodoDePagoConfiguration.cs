using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace Infraestructure.Persistence.Config
{
    public class MetodoDePagoConfiguration
    {
        public MetodoDePagoConfiguration(EntityTypeBuilder<MetodoDePago> entityBuilder)
        {
            entityBuilder.ToTable("MetodoDePago");
            entityBuilder.Property(m => m.MetodoDePagoID).ValueGeneratedOnAdd();
            entityBuilder.Property(foren => foren.Nombre).HasMaxLength(50);
          /*  entityBuilder
                .HasMany<Mercaderia>(tm => tm.Mercaderias)
                .WithOne(m => m.TipoMercaderia)
                .HasForeignKey(m => m.TipoMercaderiaId);*/
        }

    }
}

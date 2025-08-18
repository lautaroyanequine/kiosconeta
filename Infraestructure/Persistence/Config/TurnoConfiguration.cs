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
    public class TurnoConfiguration
    {
        public TurnoConfiguration(EntityTypeBuilder<Turno> entityBuilder) {
            entityBuilder.ToTable("Turno");
            entityBuilder.Property(m => m.TurnoID).ValueGeneratedOnAdd();
           
        }
    }
}

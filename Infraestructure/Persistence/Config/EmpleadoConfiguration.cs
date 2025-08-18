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
    public class EmpleadoConfiguration
    {
        public EmpleadoConfiguration(EntityTypeBuilder<Empleado> entityBuilder)
        {
            entityBuilder.ToTable("Empleado");
            entityBuilder.Property(m => m.EmpleadoID).ValueGeneratedOnAdd();
            entityBuilder.Property(m => m.Nombre).HasMaxLength(50);


        }
    }
}

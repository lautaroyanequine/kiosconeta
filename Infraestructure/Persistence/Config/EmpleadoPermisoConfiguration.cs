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
    public class EmpleadoPermisoConfiguration
    {
        public EmpleadoPermisoConfiguration(EntityTypeBuilder<EmpleadoPermiso> entityBuilder)
        {
            entityBuilder.ToTable("EmpleadoPermiso");
            entityBuilder.HasKey(ep => new { ep.EmpleadoId, ep.PermisoId });
            // 👤 Empleado
            entityBuilder.HasOne(ep => ep.Empleado)
                .WithMany(e => e.EmpleadoPermisos)
                .HasForeignKey(ep => ep.EmpleadoId)
                .OnDelete(DeleteBehavior.Cascade);

            // 🔐 Permiso
            entityBuilder.HasOne(ep => ep.Permiso)
                .WithMany(p => p.EmpleadoPermisos)
                .HasForeignKey(ep => ep.PermisoId)
                .OnDelete(DeleteBehavior.Cascade);


        }
    }
}

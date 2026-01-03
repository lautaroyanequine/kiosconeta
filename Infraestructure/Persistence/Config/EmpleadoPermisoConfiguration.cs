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

            entityBuilder.HasKey(ep => ep.EmpleadoPermisoId);

            entityBuilder.Property(ep => ep.EmpleadoPermisoId)
                .ValueGeneratedOnAdd();

            entityBuilder.Property(ep => ep.FechaAsignacion)
                .HasColumnType("datetime2")
                .HasDefaultValueSql("GETDATE()")
                .IsRequired();

            entityBuilder.Property(ep => ep.Activo)
                .HasDefaultValue(true)
                .IsRequired();

            // Empleado (1) -> EmpleadoPermiso (N)
            entityBuilder.HasOne(ep => ep.Empleado)
                .WithMany(e => e.EmpleadoPermisos)
                .HasForeignKey(ep => ep.EmpleadoId)
                .OnDelete(DeleteBehavior.Restrict);

            // Permiso (1) -> EmpleadoPermiso (N)
            entityBuilder.HasOne(ep => ep.Permiso)
                .WithMany(p => p.EmpleadoPermisos)
                .HasForeignKey(ep => ep.PermisoId)
                .OnDelete(DeleteBehavior.Restrict);

            // Evita permisos duplicados para un empleado
            entityBuilder.HasIndex(ep => new { ep.EmpleadoId, ep.PermisoId })
                .IsUnique();



        }
    }
}

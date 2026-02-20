using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestructure.Persistence.Config
{
    public class UsuarioConfiguration
    {
        public UsuarioConfiguration(EntityTypeBuilder<Usuario> entityBuilder)
        {

            entityBuilder.ToTable("Usuario");

            entityBuilder.Property(m => m.UsuarioID)
                .ValueGeneratedOnAdd();

            entityBuilder.Property(m => m.Nombre)
                .HasMaxLength(50);

            entityBuilder.Property(m => m.Email)
                .HasMaxLength(50);

            entityBuilder.Property(m => m.Password)
                .HasMaxLength(50);

            // USUARIO → KIOSCO (Cascade permitido)
            entityBuilder // UsuarioConfiguration
                .HasMany(u => u.Kioscos)
                .WithOne(k => k.Usuario)
                .HasForeignKey(k => k.UsuarioID)
                .OnDelete(DeleteBehavior.Cascade);   // <-- permitir cascada

            // USUARIO → EMPLEADO (Cortar cascada)
            entityBuilder // UsuarioConfiguration
                .HasMany(u => u.Empleados)
                .WithOne(e => e.Usuario)
                .HasForeignKey(e => e.UsuarioID)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}

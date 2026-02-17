using Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestructure.Persistence.DataKiosconeta.Seed
{
    public static class UsuarioData
    {
        public static void Seed(EntityTypeBuilder<Usuario> entity)
        {
            entity.HasData(
                new Usuario
                {
                    UsuarioID = 1,
                    Nombre = "Admin",
                    Email = "admin@kiosconeta.com",
                    Password = "1234"  // en el futuro esto va hasheado
                }
            );
        }
    }
}
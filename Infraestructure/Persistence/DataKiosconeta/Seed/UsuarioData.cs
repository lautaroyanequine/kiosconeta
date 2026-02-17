// ⚠️ IMPORTANTE - LEER ANTES DE APLICAR
//
// El seed del Usuario tiene Password = "1234" en texto plano.
// Ahora que tenemos hashing, necesitamos actualizar el seed
// con el password ya hasheado.
//
// El hash SHA256 de "1234" en Base64 es:
// A6xnQhbz4Vx2HuGl4lXwZ5U2I8iziLRFnhP5eNfIRvQ=
//
// Actualizá tu UsuarioData.cs así:

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
                    // Password: "1234" (hasheado con SHA256)
                    Password = "A6xnQhbz4Vx2HuGl4lXwZ5U2I8iziLRFnhP5eNfIRvQ="
                }
            );
        }
    }
}

// ─────────────────────────────────────────────────────────────
// DESPUÉS de actualizar UsuarioData.cs, corré la migración:
//
// dotnet ef migrations add UpdateUsuarioPasswordHash
//     --project Infraestructure
//     --startup-project KIOSCONETA
//
// dotnet ef database update
//     --project Infraestructure
//     --startup-project KIOSCONETA
// ─────────────────────────────────────────────────────────────
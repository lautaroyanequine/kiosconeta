using Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.Security.Cryptography;
using System.Text;

namespace Infraestructure.Persistence.DataKiosconeta.Seed
{
    public static class EmpleadoData
    {
        // Helper para hashear (mismo que usa el AuthService)
        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        public static void Seed(EntityTypeBuilder<Empleado> entity)
        {
            entity.HasData(
                // ════════════════════════════════════════════════
                // ADMIN (EmpleadoId = 1)
                // ════════════════════════════════════════════════
                new Empleado
                {
                    EmpleadoId = 1,
                    Nombre = "Kiosconeta24HS",
                    Legajo = "ADMIN001",
                    Telefono = null,
                    EsAdmin = true,           // ← Es admin
                    PIN = null,               // ← Admin NO usa PIN
                    UsuarioID = 1,            // ← Tiene usuario con email
                    Activo = true,
                    KioscoID = 1
                },

                // ════════════════════════════════════════════════
                // EMPLEADOS (con PIN)
                // ════════════════════════════════════════════════

                new Empleado
                {
                    EmpleadoId = 2,
                    Nombre = "Luchi",
                    Legajo = "EMP001",
                    Telefono = "1123456789",
                    EsAdmin = false,
                    PIN = HashPassword("6987"),  // ← PIN hasheado
                    UsuarioID = null,            // ← NO tiene usuario
                    Activo = true,
                    KioscoID = 1
                },

                new Empleado
                {
                    EmpleadoId = 3,
                    Nombre = "Brenda",
                    Legajo = "EMP002",
                    Telefono = "1198765432",
                    EsAdmin = false,
                    PIN = HashPassword("1111"),
                    UsuarioID = null,
                    Activo = true,
                    KioscoID = 1
                },

                new Empleado
                {
                    EmpleadoId = 4,
                    Nombre = "Carlos López",
                    Legajo = "EMP003",
                    Telefono = "1155443322",
                    EsAdmin = false,
                    PIN = HashPassword("9999"),
                    UsuarioID = null,
                    Activo = true,
                    KioscoID = 1
                }
            );
        }
    }
}
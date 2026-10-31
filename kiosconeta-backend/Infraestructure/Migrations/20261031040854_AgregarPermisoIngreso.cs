using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infraestructure.Migrations
{
    /// <inheritdoc />
    public partial class AgregarPermisoIngreso : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
        INSERT INTO ""Permiso"" (""PermisoID"", ""Descripcion"", ""Nombre"")
        SELECT 51, 'Ingresar mercadería sin editar productos', 'productos.ingresar_mercaderia'
        WHERE NOT EXISTS (SELECT 1 FROM ""Permiso"" WHERE ""PermisoID"" = 51);");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DELETE FROM ""Permiso"" WHERE ""PermisoID"" = 51;");
        }
    }
}

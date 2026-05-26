using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infraestructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPrecioFijoDescuento : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "PrecioFijoDescuento",
                table: "Promocion",
                type: "numeric",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Usuario",
                keyColumn: "UsuarioID",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$PK5/m567Q9e/ZmMJ7Q.gouRnIKG2.hLS.YDzcp/KkAQgRDiOcME8u");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PrecioFijoDescuento",
                table: "Promocion");

            migrationBuilder.UpdateData(
                table: "Usuario",
                keyColumn: "UsuarioID",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$ZjOSQiJ8IZrWSn9ubGLvY.a5EMiQsMFhdDxUP7op2jRvGTKmnzTbC");
        }
    }
}

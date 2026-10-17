using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infraestructure.Migrations
{
    /// <inheritdoc />
    public partial class ModVentaCombo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "CostoTotal",
                table: "VentaCombos",
                type: "numeric(18,2)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Usuario",
                keyColumn: "UsuarioID",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$4PbqbknydbueGJIohmC4sO8wog/WqXFm1xQ0Pixl9ToNDBM51gMGG");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CostoTotal",
                table: "VentaCombos");

            migrationBuilder.UpdateData(
                table: "Usuario",
                keyColumn: "UsuarioID",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$CJEB3VAjj9VLCWmZuyTCweWraUqCOmKsXMJUs5gvOMCKmSA9gKA/y");
        }
    }
}

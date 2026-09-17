using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infraestructure.Migrations
{
    /// <inheritdoc />
    public partial class addTipodeGasto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TipoDeGasto_KioscoId",
                table: "TipoDeGasto");

            migrationBuilder.DropIndex(
                name: "IX_TipoDeGasto_Nombre",
                table: "TipoDeGasto");

            migrationBuilder.UpdateData(
                table: "Usuario",
                keyColumn: "UsuarioID",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$db2RMmzMd327Pgq0snwNfevPc36C0tp/uOjJ/PXcWmXw2WQMgmmP6");

            migrationBuilder.CreateIndex(
                name: "IX_TipoDeGasto_KioscoId_Nombre",
                table: "TipoDeGasto",
                columns: new[] { "KioscoId", "Nombre" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TipoDeGasto_KioscoId_Nombre",
                table: "TipoDeGasto");

            migrationBuilder.UpdateData(
                table: "Usuario",
                keyColumn: "UsuarioID",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$nd1642U5fKx36nZmon/DTOxT7JdNzLyklZS7.faJi9yukrBbCyYEu");

            migrationBuilder.CreateIndex(
                name: "IX_TipoDeGasto_KioscoId",
                table: "TipoDeGasto",
                column: "KioscoId");

            migrationBuilder.CreateIndex(
                name: "IX_TipoDeGasto_Nombre",
                table: "TipoDeGasto",
                column: "Nombre",
                unique: true);
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infraestructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFondoAlCierreTurno : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "EfectivoFinalFondo",
                table: "CierresTurno",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "VirtualFinalFondo",
                table: "CierresTurno",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.UpdateData(
                table: "Usuario",
                keyColumn: "UsuarioID",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$5/I1Rmqhm7vWGrzY9SfC9.6It/HhMs/gZPLEWNqxuq3ARCHWXFNoW");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EfectivoFinalFondo",
                table: "CierresTurno");

            migrationBuilder.DropColumn(
                name: "VirtualFinalFondo",
                table: "CierresTurno");

            migrationBuilder.UpdateData(
                table: "Usuario",
                keyColumn: "UsuarioID",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$4fGm2NwW/WydblxLglpR/..d7yoSwb35J2FompmhVEPtxngue7wdy");
        }
    }
}

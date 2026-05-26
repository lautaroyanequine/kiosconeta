using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infraestructure.Migrations
{
    /// <inheritdoc />
    public partial class arregloCierre : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Usuario",
                keyColumn: "UsuarioID",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$oRdvhi.6I69wzqky6near.UnJj5Bd.D1MuXV6wKr.k5m4Q05MO2jq");

            // Corregimos la diferencia para los turnos viejos directo en la BD
            migrationBuilder.Sql(@"
        UPDATE ""CierresTurno"" 
        SET ""Diferencia"" = ""EfectivoFinal"" - (""EfectivoInicial"" + (""MontoEsperado"" - ""VirtualFinal""))
        WHERE ""Estado"" = 1;
    ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Usuario",
                keyColumn: "UsuarioID",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$PK5/m567Q9e/ZmMJ7Q.gouRnIKG2.hLS.YDzcp/KkAQgRDiOcME8u");
        }
    }
}

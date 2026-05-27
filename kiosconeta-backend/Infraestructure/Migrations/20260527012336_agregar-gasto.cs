using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infraestructure.Migrations
{
    /// <inheritdoc />
    public partial class agregargasto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Usuario",
                keyColumn: "UsuarioID",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$4fGm2NwW/WydblxLglpR/..d7yoSwb35J2FompmhVEPtxngue7wdy");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Usuario",
                keyColumn: "UsuarioID",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$oRdvhi.6I69wzqky6near.UnJj5Bd.D1MuXV6wKr.k5m4Q05MO2jq");
        }
    }
}

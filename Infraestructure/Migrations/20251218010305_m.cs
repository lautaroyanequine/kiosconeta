using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infraestructure.Migrations
{
    /// <inheritdoc />
    public partial class m : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CierreTurno",
                columns: table => new
                {
                    CierreTurnoId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CantVentas = table.Column<int>(type: "int", nullable: false),
                    MontoEsperado = table.Column<int>(type: "int", nullable: false),
                    MontoReal = table.Column<int>(type: "int", nullable: false),
                    Diferencia = table.Column<int>(type: "int", nullable: false),
                    Efectivo = table.Column<int>(type: "int", nullable: false),
                    Virtual = table.Column<int>(type: "int", nullable: false),
                    Estado = table.Column<bool>(type: "bit", nullable: false),
                    Observaciones = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    KioscoId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CierreTurno", x => x.CierreTurnoId);
                    table.ForeignKey(
                        name: "FK_CierreTurno_Kiosco_KioscoId",
                        column: x => x.KioscoId,
                        principalTable: "Kiosco",
                        principalColumn: "KioscoID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CierreTurno_KioscoId",
                table: "CierreTurno",
                column: "KioscoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CierreTurno");
        }
    }
}

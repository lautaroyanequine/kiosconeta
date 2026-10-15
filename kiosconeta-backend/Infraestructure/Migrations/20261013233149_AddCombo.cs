using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Infraestructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCombo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "VentaCombos",
                columns: table => new
                {
                    VentaComboId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VentaId = table.Column<int>(type: "integer", nullable: false),
                    PromocionId = table.Column<int>(type: "integer", nullable: true),
                    PromocionNombre = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Cantidad = table.Column<int>(type: "integer", nullable: false),
                    PrecioCombo = table.Column<decimal>(type: "numeric(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VentaCombos", x => x.VentaComboId);
                    table.ForeignKey(
                        name: "FK_VentaCombos_Promocion_PromocionId",
                        column: x => x.PromocionId,
                        principalTable: "Promocion",
                        principalColumn: "PromocionId",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_VentaCombos_Venta_VentaId",
                        column: x => x.VentaId,
                        principalTable: "Venta",
                        principalColumn: "VentaId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Usuario",
                keyColumn: "UsuarioID",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$CJEB3VAjj9VLCWmZuyTCweWraUqCOmKsXMJUs5gvOMCKmSA9gKA/y");

            migrationBuilder.CreateIndex(
                name: "IX_VentaCombos_PromocionId",
                table: "VentaCombos",
                column: "PromocionId");

            migrationBuilder.CreateIndex(
                name: "IX_VentaCombos_VentaId",
                table: "VentaCombos",
                column: "VentaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VentaCombos");

            migrationBuilder.UpdateData(
                table: "Usuario",
                keyColumn: "UsuarioID",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$db2RMmzMd327Pgq0snwNfevPc36C0tp/uOjJ/PXcWmXw2WQMgmmP6");
        }
    }
}

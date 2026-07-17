using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Infraestructure.Migrations
{
    /// <inheritdoc />
    public partial class AgregarTags : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TagIdPorcentaje",
                table: "Promocion",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Tags",
                columns: table => new
                {
                    TagId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    KioscoId = table.Column<int>(type: "integer", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tags", x => x.TagId);
                    table.ForeignKey(
                        name: "FK_Tags_Kiosco_KioscoId",
                        column: x => x.KioscoId,
                        principalTable: "Kiosco",
                        principalColumn: "KioscoID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductosTag",
                columns: table => new
                {
                    ProductoTagId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProductoId = table.Column<int>(type: "integer", nullable: false),
                    TagId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductosTag", x => x.ProductoTagId);
                    table.ForeignKey(
                        name: "FK_ProductosTag_Producto_ProductoId",
                        column: x => x.ProductoId,
                        principalTable: "Producto",
                        principalColumn: "ProductoId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductosTag_Tags_TagId",
                        column: x => x.TagId,
                        principalTable: "Tags",
                        principalColumn: "TagId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Usuario",
                keyColumn: "UsuarioID",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$kuV7cuFsf2US3obEcD6vXewSnYoHdh/M9yp.vAWnU1eU8RSsDLeXC");

            migrationBuilder.CreateIndex(
                name: "IX_Promocion_TagIdPorcentaje",
                table: "Promocion",
                column: "TagIdPorcentaje");

            migrationBuilder.CreateIndex(
                name: "IX_ProductosTag_ProductoId",
                table: "ProductosTag",
                column: "ProductoId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductosTag_TagId",
                table: "ProductosTag",
                column: "TagId");

            migrationBuilder.CreateIndex(
                name: "IX_Tags_KioscoId",
                table: "Tags",
                column: "KioscoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Promocion_Tags_TagIdPorcentaje",
                table: "Promocion",
                column: "TagIdPorcentaje",
                principalTable: "Tags",
                principalColumn: "TagId",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Promocion_Tags_TagIdPorcentaje",
                table: "Promocion");

            migrationBuilder.DropTable(
                name: "ProductosTag");

            migrationBuilder.DropTable(
                name: "Tags");

            migrationBuilder.DropIndex(
                name: "IX_Promocion_TagIdPorcentaje",
                table: "Promocion");

            migrationBuilder.DropColumn(
                name: "TagIdPorcentaje",
                table: "Promocion");

            migrationBuilder.UpdateData(
                table: "Usuario",
                keyColumn: "UsuarioID",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$5/I1Rmqhm7vWGrzY9SfC9.6It/HhMs/gZPLEWNqxuq3ARCHWXFNoW");
        }
    }
}

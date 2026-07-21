using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infraestructure.Migrations
{
    /// <inheritdoc />
    public partial class ComboYCantidadPorTag : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "ProductoId",
                table: "PromocionProducto",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<int>(
                name: "TagId",
                table: "PromocionProducto",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TagCantidadTagId",
                table: "Promocion",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TagIdCantidad",
                table: "Promocion",
                type: "integer",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Usuario",
                keyColumn: "UsuarioID",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$sDIfKF.PW1PWtH36r8i2Ju27WrQSjMmIouiCYX.QiFBFV.MQvfkGe");

            migrationBuilder.CreateIndex(
                name: "IX_PromocionProducto_TagId",
                table: "PromocionProducto",
                column: "TagId");

            migrationBuilder.CreateIndex(
                name: "IX_Promocion_TagCantidadTagId",
                table: "Promocion",
                column: "TagCantidadTagId");

            migrationBuilder.AddForeignKey(
                name: "FK_Promocion_Tags_TagCantidadTagId",
                table: "Promocion",
                column: "TagCantidadTagId",
                principalTable: "Tags",
                principalColumn: "TagId");

            migrationBuilder.AddForeignKey(
                name: "FK_PromocionProducto_Tags_TagId",
                table: "PromocionProducto",
                column: "TagId",
                principalTable: "Tags",
                principalColumn: "TagId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Promocion_Tags_TagCantidadTagId",
                table: "Promocion");

            migrationBuilder.DropForeignKey(
                name: "FK_PromocionProducto_Tags_TagId",
                table: "PromocionProducto");

            migrationBuilder.DropIndex(
                name: "IX_PromocionProducto_TagId",
                table: "PromocionProducto");

            migrationBuilder.DropIndex(
                name: "IX_Promocion_TagCantidadTagId",
                table: "Promocion");

            migrationBuilder.DropColumn(
                name: "TagId",
                table: "PromocionProducto");

            migrationBuilder.DropColumn(
                name: "TagCantidadTagId",
                table: "Promocion");

            migrationBuilder.DropColumn(
                name: "TagIdCantidad",
                table: "Promocion");

            migrationBuilder.AlterColumn<int>(
                name: "ProductoId",
                table: "PromocionProducto",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "Usuario",
                keyColumn: "UsuarioID",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$kuV7cuFsf2US3obEcD6vXewSnYoHdh/M9yp.vAWnU1eU8RSsDLeXC");
        }
    }
}

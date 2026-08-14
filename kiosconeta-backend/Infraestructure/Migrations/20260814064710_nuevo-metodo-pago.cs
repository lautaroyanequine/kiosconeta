using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infraestructure.Migrations
{
    /// <inheritdoc />
    public partial class nuevometodopago : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "MontoEfectivo",
                table: "Venta",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MontoVirtual",
                table: "Venta",
                type: "numeric",
                nullable: true);

            migrationBuilder.InsertData(
                table: "MetodoDePago",
                columns: new[] { "MetodoDePagoID", "Nombre" },
                values: new object[] { 4, "Pago combinado" });

            migrationBuilder.UpdateData(
                table: "Usuario",
                keyColumn: "UsuarioID",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$q6egrfLkWtIRgoa1LODOdea.v14XH3Zsuv95wgmSu/On0qc6TCDq6");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "MetodoDePago",
                keyColumn: "MetodoDePagoID",
                keyValue: 4);

            migrationBuilder.DropColumn(
                name: "MontoEfectivo",
                table: "Venta");

            migrationBuilder.DropColumn(
                name: "MontoVirtual",
                table: "Venta");

            migrationBuilder.UpdateData(
                table: "Usuario",
                keyColumn: "UsuarioID",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$sDIfKF.PW1PWtH36r8i2Ju27WrQSjMmIouiCYX.QiFBFV.MQvfkGe");
        }
    }
}

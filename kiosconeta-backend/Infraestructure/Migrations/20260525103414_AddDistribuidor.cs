using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Infraestructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDistribuidor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Distribuidores",
                columns: table => new
                {
                    DistribuidorId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(nullable: false),
                    Telefono = table.Column<string>(nullable: true),
                    Email = table.Column<string>(nullable: true),
                    Notas = table.Column<string>(nullable: true),
                    Activo = table.Column<bool>(nullable: false),
                    KioscoId = table.Column<int>(nullable: false),
                    FechaCreacion = table.Column<DateTime>(nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Distribuidores", x => x.DistribuidorId);
                    table.ForeignKey(
                        name: "FK_Distribuidores_Kiosco_KioscoId",
                        column: x => x.KioscoId,
                        principalTable: "Kiosco",     // ← nombre exacto
                        principalColumn: "KioscoID",  // ← correr query para confirmar
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.AddColumn<int>(
                name: "DistribuidorId",
                table: "Producto",          // ← nombre exacto
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Distribuidores_KioscoId",
                table: "Distribuidores",
                column: "KioscoId");

            migrationBuilder.CreateIndex(
                name: "IX_Producto_DistribuidorId",
                table: "Producto",          // ← nombre exacto
                column: "DistribuidorId");

            migrationBuilder.AddForeignKey(
                name: "FK_Producto_Distribuidores_DistribuidorId",
                table: "Producto",          // ← nombre exacto
                column: "DistribuidorId",
                principalTable: "Distribuidores",
                principalColumn: "DistribuidorId",
                onDelete: ReferentialAction.SetNull);

            // Migrar datos existentes
            migrationBuilder.Sql(@"
        INSERT INTO ""Distribuidores"" (""Nombre"", ""KioscoId"", ""Activo"", ""FechaCreacion"")
        SELECT DISTINCT ""Distribuidor"", ""KioscoId"", true, NOW()
        FROM ""Producto""
        WHERE ""Distribuidor"" IS NOT NULL AND ""Distribuidor"" != ''
        ON CONFLICT DO NOTHING;

        UPDATE ""Producto"" p
        SET ""DistribuidorId"" = d.""DistribuidorId""
        FROM ""Distribuidores"" d
        WHERE d.""Nombre"" = p.""Distribuidor""
        AND d.""KioscoId"" = p.""KioscoId"";
    ");

            migrationBuilder.DropColumn(
                name: "Distribuidor",
                table: "Producto");         // ← nombre exacto

            migrationBuilder.UpdateData(
                table: "Usuario",
                keyColumn: "UsuarioID",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$W2.FwkfPX9aedFvOZodliOv5Pfzvw6abWIrsv9oetYwN4t22MQQGy");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Distribuidor",
                table: "Producto",
                nullable: true);

            migrationBuilder.DropForeignKey(
                name: "FK_Producto_Distribuidores_DistribuidorId",
                table: "Producto");

            migrationBuilder.DropIndex(
                name: "IX_Producto_DistribuidorId",
                table: "Producto");

            migrationBuilder.DropColumn(
                name: "DistribuidorId",
                table: "Producto");

            migrationBuilder.DropTable(name: "Distribuidores");

            migrationBuilder.UpdateData(
                table: "Usuario",
                keyColumn: "UsuarioID",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$U0.0ke0ZiR6faK3EK61V2Otm50E.e4M4BNpmFtAFs3Zp9VFiQGRl2");
        }
    }
    }


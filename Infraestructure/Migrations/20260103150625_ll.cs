using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infraestructure.Migrations
{
    /// <inheritdoc />
    public partial class ll : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categoria",
                columns: table => new
                {
                    CategoriaID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categoria", x => x.CategoriaID);
                });

            migrationBuilder.CreateTable(
                name: "MetodoDePago",
                columns: table => new
                {
                    MetodoDePagoID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MetodoDePago", x => x.MetodoDePagoID);
                });

            migrationBuilder.CreateTable(
                name: "Permiso",
                columns: table => new
                {
                    PermisoID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permiso", x => x.PermisoID);
                });

            migrationBuilder.CreateTable(
                name: "TipoDeGasto",
                columns: table => new
                {
                    TipoDeGastoId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TipoDeGasto", x => x.TipoDeGastoId);
                });

            migrationBuilder.CreateTable(
                name: "Turno",
                columns: table => new
                {
                    TurnoID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Turno", x => x.TurnoID);
                });

            migrationBuilder.CreateTable(
                name: "Usuario",
                columns: table => new
                {
                    UsuarioID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Password = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuario", x => x.UsuarioID);
                });

            migrationBuilder.CreateTable(
                name: "Kiosco",
                columns: table => new
                {
                    KioscoID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Direccion = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    UsuarioID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Kiosco", x => x.KioscoID);
                    table.ForeignKey(
                        name: "FK_Kiosco_Usuario_UsuarioID",
                        column: x => x.UsuarioID,
                        principalTable: "Usuario",
                        principalColumn: "UsuarioID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CierresTurno",
                columns: table => new
                {
                    CierreTurnoId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CantidadVentas = table.Column<int>(type: "int", nullable: false),
                    MontoEsperado = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MontoReal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Diferencia = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Observaciones = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    KioscoId = table.Column<int>(type: "int", nullable: false),
                    Efectivo = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Virtual = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Estado = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CierresTurno", x => x.CierreTurnoId);
                    table.ForeignKey(
                        name: "FK_CierresTurno_Kiosco_KioscoId",
                        column: x => x.KioscoId,
                        principalTable: "Kiosco",
                        principalColumn: "KioscoID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Empleado",
                columns: table => new
                {
                    EmpleadoId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    UsuarioID = table.Column<int>(type: "int", nullable: false),
                    KioscoID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Empleado", x => x.EmpleadoId);
                    table.ForeignKey(
                        name: "FK_Empleado_Kiosco_KioscoID",
                        column: x => x.KioscoID,
                        principalTable: "Kiosco",
                        principalColumn: "KioscoID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Empleado_Usuario_UsuarioID",
                        column: x => x.UsuarioID,
                        principalTable: "Usuario",
                        principalColumn: "UsuarioID");
                });

            migrationBuilder.CreateTable(
                name: "Producto",
                columns: table => new
                {
                    ProductoId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    PrecioCosto = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PrecioVenta = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CategoriaId = table.Column<int>(type: "int", nullable: false),
                    Distribuidor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CodigoBarra = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Imagen = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    StockActual = table.Column<int>(type: "int", nullable: false),
                    StockMinimo = table.Column<int>(type: "int", nullable: false),
                    KioscoId = table.Column<int>(type: "int", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    FechaVencimiento = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Suelto = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Producto", x => x.ProductoId);
                    table.ForeignKey(
                        name: "FK_Producto_Categoria_CategoriaId",
                        column: x => x.CategoriaId,
                        principalTable: "Categoria",
                        principalColumn: "CategoriaID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Producto_Kiosco_KioscoId",
                        column: x => x.KioscoId,
                        principalTable: "Kiosco",
                        principalColumn: "KioscoID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CierreTurnoEmpleado",
                columns: table => new
                {
                    CierreTurnoId = table.Column<int>(type: "int", nullable: false),
                    EmpleadoId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CierreTurnoEmpleado", x => new { x.CierreTurnoId, x.EmpleadoId });
                    table.ForeignKey(
                        name: "FK_CierreTurnoEmpleado_CierresTurno_CierreTurnoId",
                        column: x => x.CierreTurnoId,
                        principalTable: "CierresTurno",
                        principalColumn: "CierreTurnoId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CierreTurnoEmpleado_Empleado_EmpleadoId",
                        column: x => x.EmpleadoId,
                        principalTable: "Empleado",
                        principalColumn: "EmpleadoId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EmpleadoPermiso",
                columns: table => new
                {
                    EmpleadoPermisoId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmpleadoId = table.Column<int>(type: "int", nullable: false),
                    PermisoId = table.Column<int>(type: "int", nullable: false),
                    FechaAsignacion = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    Activo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmpleadoPermiso", x => x.EmpleadoPermisoId);
                    table.ForeignKey(
                        name: "FK_EmpleadoPermiso_Empleado_EmpleadoId",
                        column: x => x.EmpleadoId,
                        principalTable: "Empleado",
                        principalColumn: "EmpleadoId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmpleadoPermiso_Permiso_PermisoId",
                        column: x => x.PermisoId,
                        principalTable: "Permiso",
                        principalColumn: "PermisoID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Gasto",
                columns: table => new
                {
                    GastoId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    Descripcion = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Monto = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    EmpleadoId = table.Column<int>(type: "int", nullable: false),
                    KioscoId = table.Column<int>(type: "int", nullable: false),
                    TipoDeGastoId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Gasto", x => x.GastoId);
                    table.ForeignKey(
                        name: "FK_Gasto_Empleado_EmpleadoId",
                        column: x => x.EmpleadoId,
                        principalTable: "Empleado",
                        principalColumn: "EmpleadoId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Gasto_Kiosco_KioscoId",
                        column: x => x.KioscoId,
                        principalTable: "Kiosco",
                        principalColumn: "KioscoID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Gasto_TipoDeGasto_TipoDeGastoId",
                        column: x => x.TipoDeGastoId,
                        principalTable: "TipoDeGasto",
                        principalColumn: "TipoDeGastoId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Venta",
                columns: table => new
                {
                    VentaId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    PrecioCosto = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Total = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Detalles = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    EmpleadoId = table.Column<int>(type: "int", nullable: false),
                    CierreTurnoId = table.Column<int>(type: "int", nullable: false),
                    MetodoPagoId = table.Column<int>(type: "int", nullable: false),
                    TurnoId = table.Column<int>(type: "int", nullable: false),
                    NumeroVenta = table.Column<int>(type: "int", nullable: false),
                    Anulada = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Venta", x => x.VentaId);
                    table.ForeignKey(
                        name: "FK_Venta_CierresTurno_CierreTurnoId",
                        column: x => x.CierreTurnoId,
                        principalTable: "CierresTurno",
                        principalColumn: "CierreTurnoId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Venta_Empleado_EmpleadoId",
                        column: x => x.EmpleadoId,
                        principalTable: "Empleado",
                        principalColumn: "EmpleadoId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Venta_MetodoDePago_MetodoPagoId",
                        column: x => x.MetodoPagoId,
                        principalTable: "MetodoDePago",
                        principalColumn: "MetodoDePagoID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Venta_Turno_TurnoId",
                        column: x => x.TurnoId,
                        principalTable: "Turno",
                        principalColumn: "TurnoID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProductoVenta",
                columns: table => new
                {
                    ProductoVentaId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductoId = table.Column<int>(type: "int", nullable: false),
                    VentaId = table.Column<int>(type: "int", nullable: false),
                    Cantidad = table.Column<int>(type: "int", nullable: false),
                    PrecioUnitario = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductoVenta", x => x.ProductoVentaId);
                    table.ForeignKey(
                        name: "FK_ProductoVenta_Producto_ProductoId",
                        column: x => x.ProductoId,
                        principalTable: "Producto",
                        principalColumn: "ProductoId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProductoVenta_Venta_VentaId",
                        column: x => x.VentaId,
                        principalTable: "Venta",
                        principalColumn: "VentaId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CierresTurno_KioscoId",
                table: "CierresTurno",
                column: "KioscoId");

            migrationBuilder.CreateIndex(
                name: "IX_CierreTurnoEmpleado_EmpleadoId",
                table: "CierreTurnoEmpleado",
                column: "EmpleadoId");

            migrationBuilder.CreateIndex(
                name: "IX_Empleado_KioscoID",
                table: "Empleado",
                column: "KioscoID");

            migrationBuilder.CreateIndex(
                name: "IX_Empleado_UsuarioID",
                table: "Empleado",
                column: "UsuarioID");

            migrationBuilder.CreateIndex(
                name: "IX_EmpleadoPermiso_EmpleadoId_PermisoId",
                table: "EmpleadoPermiso",
                columns: new[] { "EmpleadoId", "PermisoId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EmpleadoPermiso_PermisoId",
                table: "EmpleadoPermiso",
                column: "PermisoId");

            migrationBuilder.CreateIndex(
                name: "IX_Gasto_EmpleadoId",
                table: "Gasto",
                column: "EmpleadoId");

            migrationBuilder.CreateIndex(
                name: "IX_Gasto_Fecha",
                table: "Gasto",
                column: "Fecha");

            migrationBuilder.CreateIndex(
                name: "IX_Gasto_KioscoId",
                table: "Gasto",
                column: "KioscoId");

            migrationBuilder.CreateIndex(
                name: "IX_Gasto_TipoDeGastoId",
                table: "Gasto",
                column: "TipoDeGastoId");

            migrationBuilder.CreateIndex(
                name: "IX_Kiosco_UsuarioID",
                table: "Kiosco",
                column: "UsuarioID");

            migrationBuilder.CreateIndex(
                name: "IX_Producto_CategoriaId",
                table: "Producto",
                column: "CategoriaId");

            migrationBuilder.CreateIndex(
                name: "IX_Producto_KioscoId",
                table: "Producto",
                column: "KioscoId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductoVenta_ProductoId",
                table: "ProductoVenta",
                column: "ProductoId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductoVenta_VentaId",
                table: "ProductoVenta",
                column: "VentaId");

            migrationBuilder.CreateIndex(
                name: "IX_TipoDeGasto_Nombre",
                table: "TipoDeGasto",
                column: "Nombre",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Venta_CierreTurnoId",
                table: "Venta",
                column: "CierreTurnoId");

            migrationBuilder.CreateIndex(
                name: "IX_Venta_EmpleadoId",
                table: "Venta",
                column: "EmpleadoId");

            migrationBuilder.CreateIndex(
                name: "IX_Venta_Fecha",
                table: "Venta",
                column: "Fecha");

            migrationBuilder.CreateIndex(
                name: "IX_Venta_MetodoPagoId",
                table: "Venta",
                column: "MetodoPagoId");

            migrationBuilder.CreateIndex(
                name: "IX_Venta_TurnoId",
                table: "Venta",
                column: "TurnoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CierreTurnoEmpleado");

            migrationBuilder.DropTable(
                name: "EmpleadoPermiso");

            migrationBuilder.DropTable(
                name: "Gasto");

            migrationBuilder.DropTable(
                name: "ProductoVenta");

            migrationBuilder.DropTable(
                name: "Permiso");

            migrationBuilder.DropTable(
                name: "TipoDeGasto");

            migrationBuilder.DropTable(
                name: "Producto");

            migrationBuilder.DropTable(
                name: "Venta");

            migrationBuilder.DropTable(
                name: "Categoria");

            migrationBuilder.DropTable(
                name: "CierresTurno");

            migrationBuilder.DropTable(
                name: "Empleado");

            migrationBuilder.DropTable(
                name: "MetodoDePago");

            migrationBuilder.DropTable(
                name: "Turno");

            migrationBuilder.DropTable(
                name: "Kiosco");

            migrationBuilder.DropTable(
                name: "Usuario");
        }
    }
}

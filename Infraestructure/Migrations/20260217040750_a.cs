using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Infraestructure.Migrations
{
    /// <inheritdoc />
    public partial class a : Migration
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
                    Distribuidor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CodigoBarra = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    Imagen = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
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

            migrationBuilder.InsertData(
                table: "Categoria",
                columns: new[] { "CategoriaID", "Nombre" },
                values: new object[,]
                {
                    { 1, "Bebidas" },
                    { 2, "Golosinas" },
                    { 3, "Cigarrillos" },
                    { 4, "Comida" }
                });

            migrationBuilder.InsertData(
                table: "MetodoDePago",
                columns: new[] { "MetodoDePagoID", "Nombre" },
                values: new object[,]
                {
                    { 1, "Efectivo" },
                    { 2, "Mercado Pago" },
                    { 3, "Débito" }
                });

            migrationBuilder.InsertData(
                table: "Turno",
                columns: new[] { "TurnoID", "Nombre" },
                values: new object[,]
                {
                    { 1, "Mañana" },
                    { 2, "Tarde" },
                    { 3, "Noche" }
                });

            migrationBuilder.InsertData(
                table: "Usuario",
                columns: new[] { "UsuarioID", "Email", "Nombre", "Password" },
                values: new object[] { 1, "admin@kiosconeta.com", "Admin", "1234" });

            migrationBuilder.InsertData(
                table: "Kiosco",
                columns: new[] { "KioscoID", "Direccion", "Nombre", "UsuarioID" },
                values: new object[] { 1, "845 2595", "Kiosconeta 1", 1 });

            migrationBuilder.InsertData(
                table: "Empleado",
                columns: new[] { "EmpleadoId", "Activo", "KioscoID", "Nombre", "UsuarioID" },
                values: new object[] { 1, true, 1, "Luchi <3", 1 });

            migrationBuilder.InsertData(
                table: "Producto",
                columns: new[] { "ProductoId", "Activo", "CategoriaId", "CodigoBarra", "Descripcion", "Distribuidor", "FechaCreacion", "FechaModificacion", "FechaVencimiento", "Imagen", "KioscoId", "Nombre", "PrecioCosto", "PrecioVenta", "StockActual", "StockMinimo" },
                values: new object[,]
                {
                    { 1, true, 1, "7790895000017", "Gaseosa Coca Cola sabor original 500ml", "Coca-Cola FEMSA", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Coca Cola 500ml", 1100m, 2000m, 50, 10 },
                    { 2, true, 1, "7790895000024", "Gaseosa Coca Cola sabor original 1.5 litros", "Coca-Cola FEMSA", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Coca Cola 1.5L", 2000m, 3500m, 30, 6 },
                    { 3, true, 1, "7790310980316", "Gaseosa Pepsi sabor original 500ml", "PepsiCo", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Pepsi 500ml", 950m, 1800m, 40, 10 },
                    { 4, true, 1, "7790895001090", "Gaseosa Sprite lima-limón 500ml", "Coca-Cola FEMSA", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Sprite 500ml", 950m, 1800m, 35, 8 },
                    { 5, true, 1, "7790895001083", "Gaseosa Fanta sabor naranja 500ml", "Coca-Cola FEMSA", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Fanta Naranja 500ml", 950m, 1800m, 30, 8 },
                    { 6, true, 1, "7790310980323", "Gaseosa 7UP lima-limón 500ml", "PepsiCo", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "7UP 500ml", 950m, 1800m, 25, 6 },
                    { 7, true, 1, "7798062541016", "Agua mineral sin gas 500ml", "Danone", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Agua Villavicencio 500ml", 600m, 1200m, 60, 15 },
                    { 8, true, 1, "7791813001147", "Agua mineral sin gas Ser 500ml", "PepsiCo", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Agua Ser 500ml", 550m, 1100m, 50, 12 },
                    { 9, true, 1, "5099337012015", "Bebida energizante Monster original lata 473ml", "Coca-Cola FEMSA", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Monster Energy Original 473ml", 2200m, 3800m, 24, 6 },
                    { 10, true, 1, "9002490100070", "Bebida energizante Red Bull lata 250ml", "Red Bull", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Red Bull 250ml", 2500m, 4200m, 18, 6 },
                    { 11, true, 1, "7790895005821", "Jugo Cepita sabor naranja caja 200ml", "Coca-Cola FEMSA", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Jugo Cepita Naranja 200ml", 500m, 950m, 40, 10 },
                    { 12, true, 1, "7790895006804", "Bebida isotónica Powerade Mountain Blast 500ml", "Coca-Cola FEMSA", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Powerade Azul 500ml", 1100m, 2000m, 20, 6 },
                    { 13, true, 1, "7790310980422", "Bebida isotónica Gatorade Cool Blue 500ml", "PepsiCo", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Gatorade Azul 500ml", 1100m, 2000m, 20, 6 },
                    { 14, true, 1, "7790310980521", "Infusión Lipton Ice Tea sabor durazno 500ml", "PepsiCo", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Té Lipton Durazno 500ml", 900m, 1700m, 24, 6 },
                    { 15, true, 1, "7790435000190", "Cerveza Quilmes Cristal lata 473ml", "Quilmes", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Cerveza Quilmes Lata 473ml", 1300m, 2400m, 36, 12 },
                    { 16, true, 2, "7790580054878", "Alfajor triple Guaymallen chocolate", "Arcor", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Alfajor Guaymallen Chocolate", 200m, 500m, 100, 20 },
                    { 17, true, 2, "7790580054885", "Alfajor triple Guaymallen dulce de leche", "Arcor", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Alfajor Guaymallen Leche", 200m, 500m, 100, 20 },
                    { 18, true, 2, "7622210449443", "Alfajor Milka chocolate con leche", "Mondelez", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Alfajor Milka", 500m, 1000m, 50, 10 },
                    { 19, true, 2, "7791240003459", "Alfajor Jorgito dulce de leche", "Jorgito", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Alfajor Jorgito", 180m, 400m, 80, 20 },
                    { 20, true, 2, "7622210421609", "Tableta chocolate Milka con leche 100g", "Mondelez", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Chocolate Milka 100g", 800m, 1500m, 30, 8 },
                    { 21, true, 2, "7622300861032", "Chocolate suizo Toblerone con miel y almendras 100g", "Mondelez", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Chocolate Toblerone 100g", 1200m, 2200m, 20, 5 }
                });

            migrationBuilder.InsertData(
                table: "Producto",
                columns: new[] { "ProductoId", "Activo", "CategoriaId", "CodigoBarra", "Descripcion", "Distribuidor", "FechaCreacion", "FechaModificacion", "FechaVencimiento", "Imagen", "KioscoId", "Nombre", "PrecioCosto", "PrecioVenta", "StockActual", "StockMinimo", "Suelto" },
                values: new object[] { 22, true, 2, "", "Caramelo de menta Menthoplus individual", "Arcor", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Caramelo Menthoplus", 30m, 80m, 300, 100, true });

            migrationBuilder.InsertData(
                table: "Producto",
                columns: new[] { "ProductoId", "Activo", "CategoriaId", "CodigoBarra", "Descripcion", "Distribuidor", "FechaCreacion", "FechaModificacion", "FechaVencimiento", "Imagen", "KioscoId", "Nombre", "PrecioCosto", "PrecioVenta", "StockActual", "StockMinimo" },
                values: new object[,]
                {
                    { 23, true, 2, "7790580007157", "Confites de chocolate Rocklets tubo", "Arcor", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Rocklets Tubo", 350m, 700m, 40, 10 },
                    { 24, true, 2, "7622210358110", "Chicle Beldent sabor menta blister", "Mondelez", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Chicle Beldent Menta", 200m, 450m, 60, 15 },
                    { 25, true, 2, "7622210358127", "Chicle Beldent sabor frutas blister", "Mondelez", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Chicle Beldent Frutas", 200m, 450m, 60, 15 },
                    { 26, true, 2, "7790580030162", "Gomitas frutales Arcor bolsa 100g", "Arcor", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Gomitas Arcor Frutales", 250m, 600m, 50, 10 },
                    { 27, true, 2, "7790580010263", "Paleta Cabsha cubierta de chocolate", "Arcor", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Paleta Cabsha Chocolate", 120m, 300m, 60, 15 }
                });

            migrationBuilder.InsertData(
                table: "Producto",
                columns: new[] { "ProductoId", "Activo", "CategoriaId", "CodigoBarra", "Descripcion", "Distribuidor", "FechaCreacion", "FechaModificacion", "FechaVencimiento", "Imagen", "KioscoId", "Nombre", "PrecioCosto", "PrecioVenta", "StockActual", "StockMinimo", "Suelto" },
                values: new object[,]
                {
                    { 28, true, 2, "7790580004545", "Bombón Bon o Bon relleno de maní 16g", "Arcor", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Bon o Bon Chocolate", 100m, 250m, 80, 20, true },
                    { 29, true, 2, "", "Chupetín Arcor sabores surtidos", "Arcor", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Chupetín Arcor", 50m, 120m, 150, 30, true }
                });

            migrationBuilder.InsertData(
                table: "Producto",
                columns: new[] { "ProductoId", "Activo", "CategoriaId", "CodigoBarra", "Descripcion", "Distribuidor", "FechaCreacion", "FechaModificacion", "FechaVencimiento", "Imagen", "KioscoId", "Nombre", "PrecioCosto", "PrecioVenta", "StockActual", "StockMinimo" },
                values: new object[,]
                {
                    { 30, true, 2, "7791813110231", "Oblea Noel de vainilla", "Noel", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Oblea Noel", 80m, 200m, 60, 15 },
                    { 31, true, 3, "7798073860011", "Cigarrillos Marlboro Red paquete x20", "Philip Morris", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Marlboro Rojo x20", 1500m, 2000m, 50, 10 },
                    { 32, true, 3, "7798073860028", "Cigarrillos Marlboro Gold paquete x20", "Philip Morris", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Marlboro Gold x20", 1500m, 2000m, 50, 10 },
                    { 33, true, 3, "7798073870019", "Cigarrillos Red Point Box paquete x20", "BAT", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Red Point Box 20", 1500m, 2100m, 40, 10 },
                    { 34, true, 3, "7798073880017", "Cigarrillos Lucky Strike Red paquete x20", "BAT", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Lucky Strike Rojo x20", 1500m, 2000m, 40, 10 },
                    { 35, true, 3, "7798073890015", "Cigarrillos Camel paquete x20", "Japan Tobacco", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Camel Azul x20", 1500m, 2000m, 30, 8 },
                    { 36, true, 3, "7798073900019", "Cigarrillos Nevada Blue paquete x20", "Philip Morris", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Nevada Blue x20", 1200m, 1700m, 35, 8 },
                    { 37, true, 3, "0070330700014", "Encendedor BIC maxi colores surtidos", "BIC", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Encendedor BIC", 400m, 800m, 30, 10 },
                    { 38, true, 4, "7791813110248", "Papas fritas Lays sabor original 100g", "PepsiCo", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Papas Lays Original 100g", 700m, 1300m, 30, 8 },
                    { 39, true, 4, "7791813110255", "Papas fritas Lays sabor queso 100g", "PepsiCo", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Papas Lays Queso 100g", 700m, 1300m, 25, 6 },
                    { 40, true, 4, "7791813110262", "Snack de maíz Cheetos sabor queso 50g", "PepsiCo", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Cheetos 50g", 500m, 950m, 30, 8 },
                    { 41, true, 4, "7791813110279", "Chips de maíz Doritos sabor Nacho Cheese 100g", "PepsiCo", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Doritos Nacho 100g", 700m, 1300m, 25, 6 },
                    { 42, true, 4, "7793045001279", "Maní con cobertura de chocolate Georgalos 40g", "Georgalos", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Maní con Chocolate Georgalos", 300m, 600m, 40, 10 },
                    { 43, true, 4, "", "Pancho con salchicha y pan", "", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Pancho Simple", 400m, 1500m, 30, 5 },
                    { 44, true, 4, "", "Pancho con salchicha, pan, ketchup y mayonesa", "", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Pancho Completo", 600m, 2200m, 30, 5 },
                    { 45, true, 4, "", "Sandwich de miga con jamón cocido y queso", "", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Sandwich de Miga Jamón y Queso", 500m, 1800m, 20, 5 },
                    { 46, true, 4, "7622210064097", "Galletitas Oreo con relleno de crema 97g", "Mondelez", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Galletitas Oreo 97g", 600m, 1100m, 30, 8 },
                    { 47, true, 4, "7790580041136", "Galletitas Pepitos chocolate 100g", "Arcor", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Galletitas Pepitos 100g", 400m, 800m, 35, 8 },
                    { 48, true, 4, "7622210368928", "Galletitas de agua Ritz 170g", "Mondelez", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Galletitas Ritz 170g", 700m, 1300m, 25, 6 }
                });

            migrationBuilder.InsertData(
                table: "Producto",
                columns: new[] { "ProductoId", "Activo", "CategoriaId", "CodigoBarra", "Descripcion", "Distribuidor", "FechaCreacion", "FechaModificacion", "FechaVencimiento", "Imagen", "KioscoId", "Nombre", "PrecioCosto", "PrecioVenta", "StockActual", "StockMinimo", "Suelto" },
                values: new object[] { 49, true, 4, "7790580022373", "Turrón de maní Arcor 25g", "Arcor", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Turrón Mani Arcor", 150m, 350m, 60, 15, true });

            migrationBuilder.InsertData(
                table: "Producto",
                columns: new[] { "ProductoId", "Activo", "CategoriaId", "CodigoBarra", "Descripcion", "Distribuidor", "FechaCreacion", "FechaModificacion", "FechaVencimiento", "Imagen", "KioscoId", "Nombre", "PrecioCosto", "PrecioVenta", "StockActual", "StockMinimo" },
                values: new object[] { 50, true, 4, "7790580099748", "Snack de maíz Chizitos queso 50g", "Arcor", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "", 1, "Chizitos 50g", 450m, 900m, 30, 8 });

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

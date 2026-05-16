using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

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
                name: "MetodoDePago",
                columns: table => new
                {
                    MetodoDePagoID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MetodoDePago", x => x.MetodoDePagoID);
                });

            migrationBuilder.CreateTable(
                name: "Permiso",
                columns: table => new
                {
                    PermisoID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permiso", x => x.PermisoID);
                });

            migrationBuilder.CreateTable(
                name: "Turno",
                columns: table => new
                {
                    TurnoId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Turno", x => x.TurnoId);
                });

            migrationBuilder.CreateTable(
                name: "Usuario",
                columns: table => new
                {
                    UsuarioID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Password = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuario", x => x.UsuarioID);
                });

            migrationBuilder.CreateTable(
                name: "Kiosco",
                columns: table => new
                {
                    KioscoID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Direccion = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    UsuarioID = table.Column<int>(type: "integer", nullable: false)
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
                name: "Categoria",
                columns: table => new
                {
                    CategoriaID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    KioscoId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categoria", x => x.CategoriaID);
                    table.ForeignKey(
                        name: "FK_Categoria_Kiosco_KioscoId",
                        column: x => x.KioscoId,
                        principalTable: "Kiosco",
                        principalColumn: "KioscoID");
                });

            migrationBuilder.CreateTable(
                name: "CierresTurno",
                columns: table => new
                {
                    CierreTurnoId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FechaApertura = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaCierre = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Estado = table.Column<int>(type: "integer", nullable: false),
                    KioscoId = table.Column<int>(type: "integer", nullable: false),
                    EfectivoInicial = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    EfectivoFinal = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    VirtualFinal = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    VirtualInicial = table.Column<decimal>(type: "numeric", nullable: false),
                    MontoEsperado = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    MontoReal = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Diferencia = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    CantidadVentas = table.Column<int>(type: "integer", nullable: false),
                    Observaciones = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    TurnoId = table.Column<int>(type: "integer", nullable: false)
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
                    table.ForeignKey(
                        name: "FK_CierresTurno_Turno_TurnoId",
                        column: x => x.TurnoId,
                        principalTable: "Turno",
                        principalColumn: "TurnoId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Empleado",
                columns: table => new
                {
                    EmpleadoId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Legajo = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Telefono = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: true),
                    PIN = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    EsAdmin = table.Column<bool>(type: "boolean", nullable: false),
                    UsuarioID = table.Column<int>(type: "integer", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    KioscoID = table.Column<int>(type: "integer", nullable: false)
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
                name: "NumeradoresVenta",
                columns: table => new
                {
                    NumeradorVentaId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    KioscoId = table.Column<int>(type: "integer", nullable: false),
                    UltimoNumero = table.Column<int>(type: "integer", nullable: false),
                    UltimaActualizacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NumeradoresVenta", x => x.NumeradorVentaId);
                    table.ForeignKey(
                        name: "FK_NumeradoresVenta_Kiosco_KioscoId",
                        column: x => x.KioscoId,
                        principalTable: "Kiosco",
                        principalColumn: "KioscoID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SaldoCaja",
                columns: table => new
                {
                    SaldoCajaId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    KioscoId = table.Column<int>(type: "integer", nullable: false),
                    SaldoInicial = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    FechaActualizacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SaldoCaja", x => x.SaldoCajaId);
                    table.ForeignKey(
                        name: "FK_SaldoCaja_Kiosco_KioscoId",
                        column: x => x.KioscoId,
                        principalTable: "Kiosco",
                        principalColumn: "KioscoID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TipoDeGasto",
                columns: table => new
                {
                    TipoDeGastoId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    KioscoId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TipoDeGasto", x => x.TipoDeGastoId);
                    table.ForeignKey(
                        name: "FK_TipoDeGasto_Kiosco_KioscoId",
                        column: x => x.KioscoId,
                        principalTable: "Kiosco",
                        principalColumn: "KioscoID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Producto",
                columns: table => new
                {
                    ProductoId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    PrecioCosto = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    PrecioVenta = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    CategoriaId = table.Column<int>(type: "integer", nullable: false),
                    Distribuidor = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CodigoBarra = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    Imagen = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    StockActual = table.Column<int>(type: "integer", nullable: false),
                    StockMinimo = table.Column<int>(type: "integer", nullable: false),
                    KioscoId = table.Column<int>(type: "integer", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    FechaModificacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    FechaVencimiento = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Suelto = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Producto", x => x.ProductoId);
                    table.ForeignKey(
                        name: "FK_Producto_Categoria_CategoriaId",
                        column: x => x.CategoriaId,
                        principalTable: "Categoria",
                        principalColumn: "CategoriaID");
                    table.ForeignKey(
                        name: "FK_Producto_Kiosco_KioscoId",
                        column: x => x.KioscoId,
                        principalTable: "Kiosco",
                        principalColumn: "KioscoID");
                });

            migrationBuilder.CreateTable(
                name: "AuditoriaLog",
                columns: table => new
                {
                    AuditoriaLogId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Fecha = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    EmpleadoId = table.Column<int>(type: "integer", nullable: false),
                    KioscoId = table.Column<int>(type: "integer", nullable: false),
                    TipoEvento = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    DatosJson = table.Column<string>(type: "text", nullable: true),
                    EsSospechoso = table.Column<bool>(type: "boolean", nullable: false),
                    MotivoSospecha = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditoriaLog", x => x.AuditoriaLogId);
                    table.ForeignKey(
                        name: "FK_AuditoriaLog_Empleado_EmpleadoId",
                        column: x => x.EmpleadoId,
                        principalTable: "Empleado",
                        principalColumn: "EmpleadoId");
                    table.ForeignKey(
                        name: "FK_AuditoriaLog_Kiosco_KioscoId",
                        column: x => x.KioscoId,
                        principalTable: "Kiosco",
                        principalColumn: "KioscoID");
                });

            migrationBuilder.CreateTable(
                name: "CierreTurnoEmpleado",
                columns: table => new
                {
                    CierreTurnoId = table.Column<int>(type: "integer", nullable: false),
                    EmpleadoId = table.Column<int>(type: "integer", nullable: false)
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
                    EmpleadoPermisoId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EmpleadoId = table.Column<int>(type: "integer", nullable: false),
                    PermisoId = table.Column<int>(type: "integer", nullable: false),
                    FechaAsignacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    Activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
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
                name: "MovimientoCaja",
                columns: table => new
                {
                    MovimientoCajaId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Fecha = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    Descripcion = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Monto = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Tipo = table.Column<int>(type: "integer", nullable: false),
                    KioscoId = table.Column<int>(type: "integer", nullable: false),
                    EmpleadoId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MovimientoCaja", x => x.MovimientoCajaId);
                    table.ForeignKey(
                        name: "FK_MovimientoCaja_Empleado_EmpleadoId",
                        column: x => x.EmpleadoId,
                        principalTable: "Empleado",
                        principalColumn: "EmpleadoId");
                    table.ForeignKey(
                        name: "FK_MovimientoCaja_Kiosco_KioscoId",
                        column: x => x.KioscoId,
                        principalTable: "Kiosco",
                        principalColumn: "KioscoID");
                });

            migrationBuilder.CreateTable(
                name: "Venta",
                columns: table => new
                {
                    VentaId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Fecha = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    PrecioCosto = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Subtotal = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Descuento = table.Column<decimal>(type: "numeric(18,2)", nullable: false, defaultValue: 0m),
                    Total = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Detalles = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    EmpleadoId = table.Column<int>(type: "integer", nullable: false),
                    CierreTurnoId = table.Column<int>(type: "integer", nullable: false),
                    MetodoPagoId = table.Column<int>(type: "integer", nullable: false),
                    TurnoId = table.Column<int>(type: "integer", nullable: false),
                    NumeroVenta = table.Column<int>(type: "integer", nullable: false),
                    Anulada = table.Column<bool>(type: "boolean", nullable: false)
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
                        principalColumn: "TurnoId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Gasto",
                columns: table => new
                {
                    GastoId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Fecha = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    Descripcion = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Monto = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    EmpleadoId = table.Column<int>(type: "integer", nullable: false),
                    KioscoId = table.Column<int>(type: "integer", nullable: false),
                    CierreTurnoId = table.Column<int>(type: "integer", nullable: true),
                    TipoDeGastoId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Gasto", x => x.GastoId);
                    table.ForeignKey(
                        name: "FK_Gasto_CierresTurno_CierreTurnoId",
                        column: x => x.CierreTurnoId,
                        principalTable: "CierresTurno",
                        principalColumn: "CierreTurnoId");
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
                name: "Promocion",
                columns: table => new
                {
                    PromocionId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    Tipo = table.Column<int>(type: "integer", nullable: false),
                    Activa = table.Column<bool>(type: "boolean", nullable: false),
                    FechaDesde = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FechaHasta = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    KioscoId = table.Column<int>(type: "integer", nullable: false),
                    PrecioCombo = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    CantidadRequerida = table.Column<int>(type: "integer", nullable: true),
                    CantidadPaga = table.Column<int>(type: "integer", nullable: true),
                    ProductoIdCantidad = table.Column<int>(type: "integer", nullable: true),
                    PorcentajeDescuento = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                    ProductoIdPorcentaje = table.Column<int>(type: "integer", nullable: true),
                    CategoriaIdPorcentaje = table.Column<int>(type: "integer", nullable: true),
                    CantidadMinimaDescuento = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Promocion", x => x.PromocionId);
                    table.ForeignKey(
                        name: "FK_Promocion_Categoria_CategoriaIdPorcentaje",
                        column: x => x.CategoriaIdPorcentaje,
                        principalTable: "Categoria",
                        principalColumn: "CategoriaID");
                    table.ForeignKey(
                        name: "FK_Promocion_Kiosco_KioscoId",
                        column: x => x.KioscoId,
                        principalTable: "Kiosco",
                        principalColumn: "KioscoID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Promocion_Producto_ProductoIdCantidad",
                        column: x => x.ProductoIdCantidad,
                        principalTable: "Producto",
                        principalColumn: "ProductoId");
                    table.ForeignKey(
                        name: "FK_Promocion_Producto_ProductoIdPorcentaje",
                        column: x => x.ProductoIdPorcentaje,
                        principalTable: "Producto",
                        principalColumn: "ProductoId");
                });

            migrationBuilder.CreateTable(
                name: "ProductoVenta",
                columns: table => new
                {
                    ProductoVentaId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProductoId = table.Column<int>(type: "integer", nullable: false),
                    VentaId = table.Column<int>(type: "integer", nullable: false),
                    Cantidad = table.Column<int>(type: "integer", nullable: false),
                    PrecioUnitario = table.Column<decimal>(type: "numeric(18,2)", nullable: false)
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

            migrationBuilder.CreateTable(
                name: "PromocionProducto",
                columns: table => new
                {
                    PromocionProductoId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PromocionId = table.Column<int>(type: "integer", nullable: false),
                    ProductoId = table.Column<int>(type: "integer", nullable: false),
                    Cantidad = table.Column<int>(type: "integer", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PromocionProducto", x => x.PromocionProductoId);
                    table.ForeignKey(
                        name: "FK_PromocionProducto_Producto_ProductoId",
                        column: x => x.ProductoId,
                        principalTable: "Producto",
                        principalColumn: "ProductoId");
                    table.ForeignKey(
                        name: "FK_PromocionProducto_Promocion_PromocionId",
                        column: x => x.PromocionId,
                        principalTable: "Promocion",
                        principalColumn: "PromocionId");
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
                table: "Permiso",
                columns: new[] { "PermisoID", "Descripcion", "Nombre" },
                values: new object[,]
                {
                    { 1, "Ver listado de productos", "productos.ver" },
                    { 2, "Crear nuevos productos", "productos.crear" },
                    { 3, "Editar productos existentes", "productos.editar" },
                    { 4, "Eliminar productos", "productos.eliminar" },
                    { 5, "Activar o desactivar productos", "productos.activar_desactivar" },
                    { 6, "Ajustar stock manualmente", "productos.ajustar_stock" },
                    { 7, "Ver productos con stock bajo", "productos.ver_stock_bajo" },
                    { 8, "Editar precios de venta y costo", "productos.editar_precios" },
                    { 9, "Ver categorías", "categorias.ver" },
                    { 10, "Crear categorías", "categorias.crear" },
                    { 11, "Editar categorías", "categorias.editar" },
                    { 12, "Eliminar categorías", "categorias.eliminar" },
                    { 13, "Crear ventas (usar POS)", "ventas.crear" },
                    { 14, "Ver todas las ventas del kiosco", "ventas.ver_todas" },
                    { 15, "Ver solo sus propias ventas", "ventas.ver_propias" },
                    { 16, "Ver detalle completo de ventas", "ventas.ver_detalle" },
                    { 17, "Anular ventas", "ventas.anular" },
                    { 18, "Ver ventas por empleado", "ventas.ver_por_empleado" },
                    { 19, "Registrar gastos", "gastos.crear" },
                    { 20, "Ver todos los gastos", "gastos.ver_todos" },
                    { 21, "Ver solo sus propios gastos", "gastos.ver_propios" },
                    { 22, "Editar gastos", "gastos.editar" },
                    { 23, "Eliminar gastos", "gastos.eliminar" },
                    { 24, "Crear y editar tipos de gasto", "gastos.gestionar_tipos" },
                    { 25, "Abrir turnos", "turnos.abrir" },
                    { 26, "Cerrar turnos", "turnos.cerrar" },
                    { 27, "Ver todos los turnos del kiosco", "turnos.ver_todos" },
                    { 28, "Ver solo su turno actual", "turnos.ver_propio" },
                    { 29, "Ver historial de turnos", "turnos.ver_historial" },
                    { 30, "Ajustar diferencias en cierres", "turnos.ajustar" },
                    { 31, "Ver listado de empleados", "empleados.ver" },
                    { 32, "Crear nuevos empleados", "empleados.crear" },
                    { 33, "Editar empleados", "empleados.editar" },
                    { 34, "Eliminar empleados", "empleados.eliminar" },
                    { 35, "Asignar y quitar permisos a empleados", "empleados.asignar_permisos" },
                    { 36, "Ver estadísticas de rendimiento", "empleados.ver_rendimiento" },
                    { 37, "Ver dashboard completo", "reportes.dashboard_completo" },
                    { 38, "Ver dashboard básico del día", "reportes.dashboard_basico" },
                    { 39, "Ver reportes de ventas", "reportes.ventas" },
                    { 40, "Ver reportes de productos", "reportes.productos" },
                    { 41, "Ver reportes financieros", "reportes.financiero" },
                    { 42, "Ver métodos de pago", "metodos_pago.ver" },
                    { 43, "Crear métodos de pago", "metodos_pago.crear" },
                    { 44, "Editar métodos de pago", "metodos_pago.editar" },
                    { 45, "Configurar datos del kiosco", "configuracion.kiosco" },
                    { 46, "Crear respaldos de datos", "configuracion.respaldos" },
                    { 47, "Eliminar métodos de pago", "metodos_pago.eliminar" },
                    { 48, "Ver promociones del kiosco", "promociones.ver" },
                    { 49, "Crear nuevas promociones", "promociones.crear" },
                    { 50, "Activar, desactivar y eliminar promociones", "promociones.editar" }
                });

            migrationBuilder.InsertData(
                table: "Turno",
                columns: new[] { "TurnoId", "Nombre" },
                values: new object[,]
                {
                    { 1, "Mañana" },
                    { 2, "Tarde" },
                    { 3, "Noche" }
                });

            migrationBuilder.InsertData(
                table: "Usuario",
                columns: new[] { "UsuarioID", "Email", "Nombre", "Password" },
                values: new object[] { 1, "admin@kiosconeta.com", "Admin", "$2a$11$Z66rXj1RWhDZD7977zpc.umjnKr17GY2GEin/ceL8.revuuSOIpjq" });

            migrationBuilder.InsertData(
                table: "Kiosco",
                columns: new[] { "KioscoID", "Direccion", "Nombre", "UsuarioID" },
                values: new object[] { 1, "845 2595", "Kiosconeta 1", 1 });

            migrationBuilder.InsertData(
                table: "Categoria",
                columns: new[] { "CategoriaID", "KioscoId", "Nombre" },
                values: new object[,]
                {
                    { 1, 1, "Bebidas" },
                    { 2, 1, "Golosinas" },
                    { 3, 1, "Cigarrillos" },
                    { 4, 1, "Comida" }
                });

            migrationBuilder.InsertData(
                table: "Empleado",
                columns: new[] { "EmpleadoId", "Activo", "EsAdmin", "KioscoID", "Legajo", "Nombre", "PIN", "Telefono", "UsuarioID" },
                values: new object[,]
                {
                    { 1, true, true, 1, "ADMIN001", "Kiosconeta24HS", null, null, 1 },
                    { 2, true, false, 1, "EMP001", "Luchi", "QTKFqtmpXhrIj8iA8M8G8/ql8bxK63p2oRpzrJTTHNM=", "1123456789", null },
                    { 3, true, false, 1, "EMP002", "Brenda", "D/4avRoIIVNTwjPW4AlhPpXuxCU4Mqdhryj/N6xaFQw=", "1198765432", null },
                    { 4, true, false, 1, "EMP003", "Carlos López", "iI3yWuNXckJKVgxxUqHeeURA4Opc/uYoKDM6RWpQbgU=", "1155443322", null }
                });

            migrationBuilder.InsertData(
                table: "EmpleadoPermiso",
                columns: new[] { "EmpleadoPermisoId", "EmpleadoId", "PermisoId" },
                values: new object[,]
                {
                    { -46, 1, 46 },
                    { -45, 1, 45 },
                    { -44, 1, 44 },
                    { -43, 1, 43 },
                    { -42, 1, 42 },
                    { -41, 1, 41 },
                    { -40, 1, 40 },
                    { -39, 1, 39 },
                    { -38, 1, 38 },
                    { -37, 1, 37 },
                    { -36, 1, 36 },
                    { -35, 1, 35 },
                    { -34, 1, 34 },
                    { -33, 1, 33 },
                    { -32, 1, 32 },
                    { -31, 1, 31 },
                    { -30, 1, 30 },
                    { -29, 1, 29 },
                    { -28, 1, 28 },
                    { -27, 1, 27 },
                    { -26, 1, 26 },
                    { -25, 1, 25 },
                    { -24, 1, 24 },
                    { -23, 1, 23 },
                    { -22, 1, 22 },
                    { -21, 1, 21 },
                    { -20, 1, 20 },
                    { -19, 1, 19 },
                    { -18, 1, 18 },
                    { -17, 1, 17 },
                    { -16, 1, 16 },
                    { -15, 1, 15 },
                    { -14, 1, 14 },
                    { -13, 1, 13 },
                    { -12, 1, 12 },
                    { -11, 1, 11 },
                    { -10, 1, 10 },
                    { -9, 1, 9 },
                    { -8, 1, 8 },
                    { -7, 1, 7 },
                    { -6, 1, 6 },
                    { -5, 1, 5 },
                    { -4, 1, 4 },
                    { -3, 1, 3 },
                    { -2, 1, 2 },
                    { -1, 1, 1 }
                });

            migrationBuilder.InsertData(
                table: "Producto",
                columns: new[] { "ProductoId", "Activo", "CategoriaId", "CodigoBarra", "Descripcion", "Distribuidor", "FechaCreacion", "FechaModificacion", "FechaVencimiento", "Imagen", "KioscoId", "Nombre", "PrecioCosto", "PrecioVenta", "StockActual", "StockMinimo" },
                values: new object[,]
                {
                    { 3, true, 1, "7790310980316", "Gaseosa Pepsi sabor original 500ml", "PepsiCo", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "", 1, "Pepsi 500ml", 950m, 1800m, 40, 10 },
                    { 4, true, 1, "7790895001090", "Gaseosa Sprite lima-limón 500ml", "Coca-Cola FEMSA", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "", 1, "Sprite 500ml", 950m, 1800m, 35, 8 },
                    { 5, true, 1, "7790895001083", "Gaseosa Fanta sabor naranja 500ml", "Coca-Cola FEMSA", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "", 1, "Fanta Naranja 500ml", 950m, 1800m, 30, 8 },
                    { 6, true, 1, "7790310980323", "Gaseosa 7UP lima-limón 500ml", "PepsiCo", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "", 1, "7UP 500ml", 950m, 1800m, 25, 6 },
                    { 7, true, 1, "7798062541016", "Agua mineral sin gas 500ml", "Danone", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "", 1, "Agua Villavicencio 500ml", 600m, 1200m, 60, 15 },
                    { 8, true, 1, "7791813001147", "Agua mineral sin gas Ser 500ml", "PepsiCo", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "", 1, "Agua Ser 500ml", 550m, 1100m, 50, 12 },
                    { 9, true, 1, "5099337012015", "Bebida energizante Monster original lata 473ml", "Coca-Cola FEMSA", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "", 1, "Monster Energy Original 473ml", 2200m, 3800m, 24, 6 },
                    { 10, true, 1, "9002490100070", "Bebida energizante Red Bull lata 250ml", "Red Bull", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "", 1, "Red Bull 250ml", 2500m, 4200m, 18, 6 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AuditoriaLog_EmpleadoId",
                table: "AuditoriaLog",
                column: "EmpleadoId");

            migrationBuilder.CreateIndex(
                name: "IX_AuditoriaLog_EsSospechoso",
                table: "AuditoriaLog",
                column: "EsSospechoso");

            migrationBuilder.CreateIndex(
                name: "IX_AuditoriaLog_Fecha",
                table: "AuditoriaLog",
                column: "Fecha");

            migrationBuilder.CreateIndex(
                name: "IX_AuditoriaLog_KioscoId",
                table: "AuditoriaLog",
                column: "KioscoId");

            migrationBuilder.CreateIndex(
                name: "IX_Categoria_KioscoId",
                table: "Categoria",
                column: "KioscoId");

            migrationBuilder.CreateIndex(
                name: "IX_CierresTurno_KioscoId_Estado",
                table: "CierresTurno",
                columns: new[] { "KioscoId", "Estado" });

            migrationBuilder.CreateIndex(
                name: "IX_CierresTurno_TurnoId",
                table: "CierresTurno",
                column: "TurnoId");

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
                name: "IX_Gasto_CierreTurnoId",
                table: "Gasto",
                column: "CierreTurnoId");

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
                name: "IX_MovimientoCaja_EmpleadoId",
                table: "MovimientoCaja",
                column: "EmpleadoId");

            migrationBuilder.CreateIndex(
                name: "IX_MovimientoCaja_Fecha",
                table: "MovimientoCaja",
                column: "Fecha");

            migrationBuilder.CreateIndex(
                name: "IX_MovimientoCaja_KioscoId",
                table: "MovimientoCaja",
                column: "KioscoId");

            migrationBuilder.CreateIndex(
                name: "IX_NumeradoresVenta_KioscoId",
                table: "NumeradoresVenta",
                column: "KioscoId",
                unique: true);

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
                name: "IX_Promocion_Activa",
                table: "Promocion",
                column: "Activa");

            migrationBuilder.CreateIndex(
                name: "IX_Promocion_CategoriaIdPorcentaje",
                table: "Promocion",
                column: "CategoriaIdPorcentaje");

            migrationBuilder.CreateIndex(
                name: "IX_Promocion_KioscoId",
                table: "Promocion",
                column: "KioscoId");

            migrationBuilder.CreateIndex(
                name: "IX_Promocion_ProductoIdCantidad",
                table: "Promocion",
                column: "ProductoIdCantidad");

            migrationBuilder.CreateIndex(
                name: "IX_Promocion_ProductoIdPorcentaje",
                table: "Promocion",
                column: "ProductoIdPorcentaje");

            migrationBuilder.CreateIndex(
                name: "IX_PromocionProducto_ProductoId",
                table: "PromocionProducto",
                column: "ProductoId");

            migrationBuilder.CreateIndex(
                name: "IX_PromocionProducto_PromocionId",
                table: "PromocionProducto",
                column: "PromocionId");

            migrationBuilder.CreateIndex(
                name: "IX_SaldoCaja_KioscoId",
                table: "SaldoCaja",
                column: "KioscoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TipoDeGasto_KioscoId",
                table: "TipoDeGasto",
                column: "KioscoId");

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
                name: "AuditoriaLog");

            migrationBuilder.DropTable(
                name: "CierreTurnoEmpleado");

            migrationBuilder.DropTable(
                name: "EmpleadoPermiso");

            migrationBuilder.DropTable(
                name: "Gasto");

            migrationBuilder.DropTable(
                name: "MovimientoCaja");

            migrationBuilder.DropTable(
                name: "NumeradoresVenta");

            migrationBuilder.DropTable(
                name: "ProductoVenta");

            migrationBuilder.DropTable(
                name: "PromocionProducto");

            migrationBuilder.DropTable(
                name: "SaldoCaja");

            migrationBuilder.DropTable(
                name: "Permiso");

            migrationBuilder.DropTable(
                name: "TipoDeGasto");

            migrationBuilder.DropTable(
                name: "Venta");

            migrationBuilder.DropTable(
                name: "Promocion");

            migrationBuilder.DropTable(
                name: "CierresTurno");

            migrationBuilder.DropTable(
                name: "Empleado");

            migrationBuilder.DropTable(
                name: "MetodoDePago");

            migrationBuilder.DropTable(
                name: "Producto");

            migrationBuilder.DropTable(
                name: "Turno");

            migrationBuilder.DropTable(
                name: "Categoria");

            migrationBuilder.DropTable(
                name: "Kiosco");

            migrationBuilder.DropTable(
                name: "Usuario");
        }
    }
}

using Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestructure.Persistence.DataKiosconeta.Seed
{
    public static class ProductoData
    {
        public static void Seed(EntityTypeBuilder<Producto> entity)
        {
            var fechaBase = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);

            entity.HasData(

                new Producto
                {
                    ProductoId = 3,
                    Nombre = "Pepsi 500ml",
                    PrecioCosto = 950,
                    PrecioVenta = 1800,
                    CategoriaId = 1,
                    CodigoBarra = "7790310980316",
                    Descripcion = "Gaseosa Pepsi sabor original 500ml",
                    Distribuidor = "PepsiCo",
                    Imagen = "",
                    StockActual = 40,
                    StockMinimo = 10,
                    KioscoId = 1,
                    Activo = true,
                    Suelto = false,
                    FechaCreacion = fechaBase
                },

                new Producto
                {
                    ProductoId = 4,
                    Nombre = "Sprite 500ml",
                    PrecioCosto = 950,
                    PrecioVenta = 1800,
                    CategoriaId = 1,
                    CodigoBarra = "7790895001090",
                    Descripcion = "Gaseosa Sprite lima-limón 500ml",
                    Distribuidor = "Coca-Cola FEMSA",
                    Imagen = "",
                    StockActual = 35,
                    StockMinimo = 8,
                    KioscoId = 1,
                    Activo = true,
                    Suelto = false,
                    FechaCreacion = fechaBase
                },

                new Producto
                {
                    ProductoId = 5,
                    Nombre = "Fanta Naranja 500ml",
                    PrecioCosto = 950,
                    PrecioVenta = 1800,
                    CategoriaId = 1,
                    CodigoBarra = "7790895001083",
                    Descripcion = "Gaseosa Fanta sabor naranja 500ml",
                    Distribuidor = "Coca-Cola FEMSA",
                    Imagen = "",
                    StockActual = 30,
                    StockMinimo = 8,
                    KioscoId = 1,
                    Activo = true,
                    Suelto = false,
                    FechaCreacion = fechaBase
                },

                new Producto
                {
                    ProductoId = 6,
                    Nombre = "7UP 500ml",
                    PrecioCosto = 950,
                    PrecioVenta = 1800,
                    CategoriaId = 1,
                    CodigoBarra = "7790310980323",
                    Descripcion = "Gaseosa 7UP lima-limón 500ml",
                    Distribuidor = "PepsiCo",
                    Imagen = "",
                    StockActual = 25,
                    StockMinimo = 6,
                    KioscoId = 1,
                    Activo = true,
                    Suelto = false,
                    FechaCreacion = fechaBase
                },

                new Producto
                {
                    ProductoId = 7,
                    Nombre = "Agua Villavicencio 500ml",
                    PrecioCosto = 600,
                    PrecioVenta = 1200,
                    CategoriaId = 1,
                    CodigoBarra = "7798062541016",
                    Descripcion = "Agua mineral sin gas 500ml",
                    Distribuidor = "Danone",
                    Imagen = "",
                    StockActual = 60,
                    StockMinimo = 15,
                    KioscoId = 1,
                    Activo = true,
                    Suelto = false,
                    FechaCreacion = fechaBase
                },

                new Producto
                {
                    ProductoId = 8,
                    Nombre = "Agua Ser 500ml",
                    PrecioCosto = 550,
                    PrecioVenta = 1100,
                    CategoriaId = 1,
                    CodigoBarra = "7791813001147",
                    Descripcion = "Agua mineral sin gas Ser 500ml",
                    Distribuidor = "PepsiCo",
                    Imagen = "",
                    StockActual = 50,
                    StockMinimo = 12,
                    KioscoId = 1,
                    Activo = true,
                    Suelto = false,
                    FechaCreacion = fechaBase
                },

                new Producto
                {
                    ProductoId = 9,
                    Nombre = "Monster Energy Original 473ml",
                    PrecioCosto = 2200,
                    PrecioVenta = 3800,
                    CategoriaId = 1,
                    CodigoBarra = "5099337012015",
                    Descripcion = "Bebida energizante Monster original lata 473ml",
                    Distribuidor = "Coca-Cola FEMSA",
                    Imagen = "",
                    StockActual = 24,
                    StockMinimo = 6,
                    KioscoId = 1,
                    Activo = true,
                    Suelto = false,
                    FechaCreacion = fechaBase
                },

                new Producto
                {
                    ProductoId = 10,
                    Nombre = "Red Bull 250ml",
                    PrecioCosto = 2500,
                    PrecioVenta = 4200,
                    CategoriaId = 1,
                    CodigoBarra = "9002490100070",
                    Descripcion = "Bebida energizante Red Bull lata 250ml",
                    Distribuidor = "Red Bull",
                    Imagen = "",
                    StockActual = 18,
                    StockMinimo = 6,
                    KioscoId = 1,
                    Activo = true,
                    Suelto = false,
                    FechaCreacion = fechaBase
                }

                
            );
        }
    }
}
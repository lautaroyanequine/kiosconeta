using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infraestructure.Persistence.DataKiosconeta.Seed
{
    public static class ProductoData
    {
        public static void Seed(EntityTypeBuilder<Producto> entity)
        {
            entity.HasData(
                new Producto
                {
                    ProductoId = 1,
                    Nombre = "Coca Cola 500ml",
                    PrecioCosto = 1100,
                    PrecioVenta = 2000,
                    CategoriaId = 1,
                    CodigoBarra = "7790895000017",
                    StockActual = 50,
                    StockMinimo = 10,
                    KioscoId = 1,
                    Activo = true
                },
                new Producto
                {
                    ProductoId = 2,
                    Nombre = "Alfajor Guaymallen Chocolate",
                    PrecioCosto = 200,
                    PrecioVenta = 500,
                    CategoriaId = 2,
                    StockActual = 100,
                    StockMinimo = 20,
                    KioscoId = 1,
                    Activo = true
                },
                  new Producto
                  {
                      ProductoId = 3,
                      Nombre = "Red point box 20",
                      PrecioCosto = 1500,
                      PrecioVenta = 2100,
                      CategoriaId = 2,
                      StockActual = 100,
                      StockMinimo = 20,
                      KioscoId = 1,
                      Activo = true
                  },
                    new Producto
                    {
                        ProductoId = 2,
                        Nombre = "Alfajor Guaymallen leche",
                        PrecioCosto = 200,
                        PrecioVenta = 500,
                        CategoriaId = 2,
                        StockActual = 100,
                        StockMinimo = 20,
                        KioscoId = 1,
                        Activo = true
                    },
                      new Producto
                      {
                          ProductoId = 4,
                          Nombre = "Pancho simple",
                          PrecioCosto = 400,
                          PrecioVenta = 1500,
                          CategoriaId = 2,
                          StockActual = 100,
                          StockMinimo = 20,
                          KioscoId = 1,
                          Activo = true
                      }
            );
        }
    }


}

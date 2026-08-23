using Application.DTOs.Producto;
using Application.Interfaces.Repository;
using Application.Interfaces.Services;
using ClosedXML.Excel;
using Domain.Entities;

namespace Application.Services
{
    public class ProductoImportExportService : IProductoImportExportService
    {
        private readonly IProductoRepository _productoRepository;
        private readonly ICategoriaRepository _categoriaRepository;
        private readonly IDistribuidorRepository _distribuidorRepository;

        // Columnas fijas del template (fila 1 = encabezados, datos desde fila 2)
        private const int COL_CODIGO_BARRA = 1;
        private const int COL_NOMBRE = 2;
        private const int COL_CATEGORIA = 3;
        private const int COL_DISTRIBUIDOR = 4;
        private const int COL_PRECIO_COSTO = 5;
        private const int COL_PRECIO_VENTA = 6;
        private const int COL_STOCK_ACTUAL = 7;
        private const int COL_STOCK_MINIMO = 8;
        private const int COL_SUELTO = 9;

        public ProductoImportExportService(
            IProductoRepository productoRepository,
            ICategoriaRepository categoriaRepository,
            IDistribuidorRepository distribuidorRepository)
        {
            _productoRepository = productoRepository;
            _categoriaRepository = categoriaRepository;
            _distribuidorRepository = distribuidorRepository;
        }

        // ═══════════════════════════════════════════════════
        // EXPORTAR
        // ═══════════════════════════════════════════════════

        public async Task<byte[]> ExportarExcelAsync(int kioscoId)
        {
            var productos = (await _productoRepository.GetByKioscoIdAsync(kioscoId))
                .OrderBy(p => p.Categoria?.Nombre)
                .ThenBy(p => p.Nombre)
                .ToList();

            using var workbook = new XLWorkbook();
            var hoja = workbook.Worksheets.Add("Productos");

            // Encabezados
            hoja.Cell(1, COL_CODIGO_BARRA).Value = "CodigoBarra";
            hoja.Cell(1, COL_NOMBRE).Value = "Nombre";
            hoja.Cell(1, COL_CATEGORIA).Value = "Categoria";
            hoja.Cell(1, COL_DISTRIBUIDOR).Value = "Distribuidor";
            hoja.Cell(1, COL_PRECIO_COSTO).Value = "PrecioCosto";
            hoja.Cell(1, COL_PRECIO_VENTA).Value = "PrecioVenta";
            hoja.Cell(1, COL_STOCK_ACTUAL).Value = "StockActual";
            hoja.Cell(1, COL_STOCK_MINIMO).Value = "StockMinimo";
            hoja.Cell(1, COL_SUELTO).Value = "Suelto";

            var headerRow = hoja.Row(1);
            headerRow.Style.Font.Bold = true;
            headerRow.Style.Fill.BackgroundColor = XLColor.FromHtml("#EFF6FF");

            // Datos
            var fila = 2;
            foreach (var p in productos)
            {
                hoja.Cell(fila, COL_CODIGO_BARRA).Value = p.CodigoBarra ?? "";
                hoja.Cell(fila, COL_NOMBRE).Value = p.Nombre;
                hoja.Cell(fila, COL_CATEGORIA).Value = p.Categoria?.Nombre ?? "";
                hoja.Cell(fila, COL_DISTRIBUIDOR).Value = p.DistribuidorNav?.Nombre ?? "";
                hoja.Cell(fila, COL_PRECIO_COSTO).Value = p.PrecioCosto;
                hoja.Cell(fila, COL_PRECIO_VENTA).Value = p.PrecioVenta;
                hoja.Cell(fila, COL_STOCK_ACTUAL).Value = p.StockActual;
                hoja.Cell(fila, COL_STOCK_MINIMO).Value = p.StockMinimo;
                hoja.Cell(fila, COL_SUELTO).Value = p.Suelto ? "Si" : "No";
                fila++;
            }

            hoja.Columns().AdjustToContents();
            hoja.SheetView.FreezeRows(1);

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }

        // ═══════════════════════════════════════════════════
        // PREVIEW (no persiste nada)
        // ═══════════════════════════════════════════════════

        public async Task<ImportarProductosPreviewResponseDTO> PreviewImportacionAsync(int kioscoId, Stream archivoExcel)
        {
            var filas = LeerFilasDelExcel(archivoExcel);
            var (categorias, distribuidores, productosPorCodigo) = await CargarDiccionariosAsync(kioscoId);

            var response = new ImportarProductosPreviewResponseDTO();
            var codigosVistos = new HashSet<string>();

            foreach (var filaDto in filas)
            {
                var item = new ImportarProductoPreviewItemDTO
                {
                    NumeroFila = filaDto.NumeroFila,
                    Datos = filaDto,
                };

                ValidarFila(filaDto, item.Errores);

                // Código de barras duplicado dentro del mismo archivo
                if (!string.IsNullOrWhiteSpace(filaDto.CodigoBarra))
                {
                    if (!codigosVistos.Add(filaDto.CodigoBarra.Trim().ToLower()))
                        item.Errores.Add($"Código de barras '{filaDto.CodigoBarra}' repetido en otra fila del archivo");
                }

                // ¿Categoría / distribuidor nuevos?
                item.CategoriaNueva = !string.IsNullOrWhiteSpace(filaDto.Categoria)
                    && !categorias.ContainsKey(filaDto.Categoria.Trim().ToLower());

                item.DistribuidorNuevo = !string.IsNullOrWhiteSpace(filaDto.Distribuidor)
                    && !distribuidores.ContainsKey(filaDto.Distribuidor.Trim().ToLower());

                // ¿Crear o actualizar?
                if (item.Errores.Count == 0)
                {
                    if (!string.IsNullOrWhiteSpace(filaDto.CodigoBarra)
                        && productosPorCodigo.TryGetValue(filaDto.CodigoBarra.Trim().ToLower(), out var existente))
                    {
                        item.Accion = "Actualizar";
                        item.ProductoIdExistente = existente.ProductoId;
                        item.PrecioCostoAnterior = existente.PrecioCosto;
                        item.PrecioVentaAnterior = existente.PrecioVenta;
                        item.StockActualAnterior = existente.StockActual;
                        item.StockMinimoAnterior = existente.StockMinimo;
                    }
                    else
                    {
                        item.Accion = "Crear";
                    }
                }
                else
                {
                    item.Accion = "Error";
                }

                response.Items.Add(item);
            }

            response.TotalCrear = response.Items.Count(i => i.Accion == "Crear");
            response.TotalActualizar = response.Items.Count(i => i.Accion == "Actualizar");
            response.TotalErrores = response.Items.Count(i => i.Accion == "Error");

            return response;
        }

        // ═══════════════════════════════════════════════════
        // CONFIRMAR (persiste)
        // ═══════════════════════════════════════════════════

        public async Task<ImportarProductosResultadoDTO> ConfirmarImportacionAsync(int kioscoId, ConfirmarImportacionDTO dto)
        {
            var resultado = new ImportarProductosResultadoDTO();
            var (categorias, distribuidores, productosPorCodigo) = await CargarDiccionariosAsync(kioscoId);

            foreach (var filaDto in dto.Filas)
            {
                var errores = new List<string>();
                ValidarFila(filaDto, errores);
                if (errores.Count > 0)
                {
                    resultado.Errores.Add($"Fila {filaDto.NumeroFila}: {string.Join(" / ", errores)}");
                    continue;
                }

                try
                {
                    // ── Resolver categoría (crear si no existe) ──────────────────
                    var nombreCategoria = filaDto.Categoria.Trim();
                    if (!categorias.TryGetValue(nombreCategoria.ToLower(), out var categoria))
                    {
                        categoria = await _categoriaRepository.CreateAsync(new Categoria
                        {
                            Nombre = nombreCategoria,
                            KioscoId = kioscoId
                        });
                        categorias[nombreCategoria.ToLower()] = categoria;
                        resultado.CategoriasCreadas++;
                    }

                    // ── Resolver distribuidor (crear si no existe, opcional) ─────
                    Distribuidor? distribuidor = null;
                    if (!string.IsNullOrWhiteSpace(filaDto.Distribuidor))
                    {
                        var nombreDistribuidor = filaDto.Distribuidor.Trim();
                        if (!distribuidores.TryGetValue(nombreDistribuidor.ToLower(), out distribuidor))
                        {
                            distribuidor = await _distribuidorRepository.CreateAsync(new Distribuidor
                            {
                                Nombre = nombreDistribuidor,
                                KioscoId = kioscoId,
                                Activo = true,
                                FechaCreacion = DateTime.UtcNow
                            });
                            distribuidores[nombreDistribuidor.ToLower()] = distribuidor;
                            resultado.DistribuidoresCreados++;
                        }
                    }

                    // ── Crear o actualizar el producto ───────────────────────────
                    Producto? existente = null;
                    if (!string.IsNullOrWhiteSpace(filaDto.CodigoBarra))
                        productosPorCodigo.TryGetValue(filaDto.CodigoBarra.Trim().ToLower(), out existente);

                    if (existente != null)
                    {
                        existente.Nombre = filaDto.Nombre.Trim();
                        existente.CategoriaId = categoria.CategoriaID;
                        existente.DistribuidorId = distribuidor?.DistribuidorId;
                        existente.PrecioCosto = filaDto.PrecioCosto;
                        existente.PrecioVenta = filaDto.PrecioVenta;
                        existente.StockActual = filaDto.StockActual;
                        existente.StockMinimo = filaDto.StockMinimo;
                        existente.Suelto = filaDto.Suelto;

                        await _productoRepository.UpdateAsync(existente);
                        resultado.Actualizados++;
                    }
                    else
                    {
                        var nuevo = new Producto
                        {
                            Nombre = filaDto.Nombre.Trim(),
                            CodigoBarra = string.IsNullOrWhiteSpace(filaDto.CodigoBarra) ? null : filaDto.CodigoBarra.Trim(),
                            CategoriaId = categoria.CategoriaID,
                            DistribuidorId = distribuidor?.DistribuidorId,
                            PrecioCosto = filaDto.PrecioCosto,
                            PrecioVenta = filaDto.PrecioVenta,
                            StockActual = filaDto.StockActual,
                            StockMinimo = filaDto.StockMinimo,
                            Suelto = filaDto.Suelto,
                            KioscoId = kioscoId,
                        };

                        var creado = await _productoRepository.CreateAsync(nuevo);
                        if (!string.IsNullOrWhiteSpace(creado.CodigoBarra))
                            productosPorCodigo[creado.CodigoBarra.Trim().ToLower()] = creado;

                        resultado.Creados++;
                    }
                }
                catch (Exception ex)
                {
                    resultado.Errores.Add($"Fila {filaDto.NumeroFila} ('{filaDto.Nombre}'): {ex.Message}");
                }
            }

            return resultado;
        }

        // ═══════════════════════════════════════════════════
        // HELPERS
        // ═══════════════════════════════════════════════════

        private async Task<(
            Dictionary<string, Categoria> categorias,
            Dictionary<string, Distribuidor> distribuidores,
            Dictionary<string, Producto> productosPorCodigo)>
            CargarDiccionariosAsync(int kioscoId)
        {
            var categorias = (await _categoriaRepository.GetAllByKioscoAsync(kioscoId))
                .ToDictionary(c => c.Nombre.Trim().ToLower(), c => c);

            var distribuidores = (await _distribuidorRepository.GetByKioscoAsync(kioscoId))
                .ToDictionary(d => d.Nombre.Trim().ToLower(), d => d);

            var productosPorCodigo = (await _productoRepository.GetByKioscoIdAsync(kioscoId))
                .Where(p => !string.IsNullOrWhiteSpace(p.CodigoBarra))
                .GroupBy(p => p.CodigoBarra!.Trim().ToLower())
                .ToDictionary(g => g.Key, g => g.First()); // por si hubiera códigos duplicados viejos en la base

            return (categorias, distribuidores, productosPorCodigo);
        }

        private static void ValidarFila(ImportarProductoFilaDTO fila, List<string> errores)
        {
            if (string.IsNullOrWhiteSpace(fila.Nombre))
                errores.Add("El nombre es obligatorio");

            if (string.IsNullOrWhiteSpace(fila.Categoria))
                errores.Add("La categoría es obligatoria");

            if (fila.PrecioCosto < 0)
                errores.Add("El precio de costo no puede ser negativo");

            if (fila.PrecioVenta < 0)
                errores.Add("El precio de venta no puede ser negativo");

            if (fila.PrecioVenta <= fila.PrecioCosto)
                errores.Add("El precio de venta debe ser mayor al precio de costo");

            if (fila.StockActual < 0)
                errores.Add("El stock actual no puede ser negativo");

            if (fila.StockMinimo < 0)
                errores.Add("El stock mínimo no puede ser negativo");
        }

        private static List<ImportarProductoFilaDTO> LeerFilasDelExcel(Stream archivoExcel)
        {
            using var workbook = new XLWorkbook(archivoExcel);
            var hoja = workbook.Worksheet(1);

            var filas = new List<ImportarProductoFilaDTO>();
            var filaActual = 2; // la fila 1 es el encabezado

            while (true)
            {
                var celdaNombre = hoja.Cell(filaActual, COL_NOMBRE);
                var esFilaVacia = celdaNombre.IsEmpty()
                    && hoja.Cell(filaActual, COL_CODIGO_BARRA).IsEmpty()
                    && hoja.Cell(filaActual, COL_CATEGORIA).IsEmpty();

                if (esFilaVacia) break; // llegamos al final de los datos

                filas.Add(new ImportarProductoFilaDTO
                {
                    NumeroFila = filaActual,
                    CodigoBarra = LeerTexto(hoja.Cell(filaActual, COL_CODIGO_BARRA)),
                    Nombre = LeerTexto(hoja.Cell(filaActual, COL_NOMBRE)) ?? "",
                    Categoria = LeerTexto(hoja.Cell(filaActual, COL_CATEGORIA)) ?? "",
                    Distribuidor = LeerTexto(hoja.Cell(filaActual, COL_DISTRIBUIDOR)),
                    PrecioCosto = LeerDecimal(hoja.Cell(filaActual, COL_PRECIO_COSTO)),
                    PrecioVenta = LeerDecimal(hoja.Cell(filaActual, COL_PRECIO_VENTA)),
                    StockActual = (int)LeerDecimal(hoja.Cell(filaActual, COL_STOCK_ACTUAL)),
                    StockMinimo = (int)LeerDecimal(hoja.Cell(filaActual, COL_STOCK_MINIMO)),
                    Suelto = LeerBooleano(hoja.Cell(filaActual, COL_SUELTO)),
                });

                filaActual++;
            }

            return filas;
        }

        private static string? LeerTexto(IXLCell celda)
        {
            if (celda.IsEmpty()) return null;
            var texto = celda.GetString().Trim();
            return string.IsNullOrWhiteSpace(texto) ? null : texto;
        }

        private static decimal LeerDecimal(IXLCell celda)
        {
            if (celda.IsEmpty()) return 0;
            try { return celda.GetValue<decimal>(); }
            catch { return 0; } // se reporta como error de validación (precio/stock en 0 no tiene sentido, pero no rompe el parseo)
        }

        private static bool LeerBooleano(IXLCell celda)
        {
            if (celda.IsEmpty()) return false;
            var texto = celda.GetString().Trim().ToLower();
            return texto is "si" or "sí" or "true" or "1" or "x";
        }
    }
}
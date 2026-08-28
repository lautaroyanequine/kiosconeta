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

        // Columnas fijas SOLO para el archivo que nosotros generamos en "Exportar"
        // (el import ahora es libre: no depende de este orden)
        private const int EXPORT_COL_CODIGO_BARRA = 1;
        private const int EXPORT_COL_NOMBRE = 2;
        private const int EXPORT_COL_CATEGORIA = 3;
        private const int EXPORT_COL_DISTRIBUIDOR = 4;
        private const int EXPORT_COL_PRECIO_COSTO = 5;
        private const int EXPORT_COL_PRECIO_VENTA = 6;
        private const int EXPORT_COL_STOCK_ACTUAL = 7;
        private const int EXPORT_COL_STOCK_MINIMO = 8;
        private const int EXPORT_COL_SUELTO = 9;

        // Máximo de filas de muestra que devolvemos en "leer estructura"
        private const int FILAS_EJEMPLO = 5;

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
        // EXPORTAR (sigue con el formato fijo de siempre)
        // ═══════════════════════════════════════════════════

        public async Task<byte[]> ExportarExcelAsync(int kioscoId)
        {
            var productos = (await _productoRepository.GetByKioscoIdAsync(kioscoId))
                .OrderBy(p => p.Categoria?.Nombre)
                .ThenBy(p => p.Nombre)
                .ToList();

            using var workbook = new XLWorkbook();
            var hoja = workbook.Worksheets.Add("Productos");

            hoja.Cell(1, EXPORT_COL_CODIGO_BARRA).Value = "CodigoBarra";
            hoja.Cell(1, EXPORT_COL_NOMBRE).Value = "Nombre";
            hoja.Cell(1, EXPORT_COL_CATEGORIA).Value = "Categoria";
            hoja.Cell(1, EXPORT_COL_DISTRIBUIDOR).Value = "Distribuidor";
            hoja.Cell(1, EXPORT_COL_PRECIO_COSTO).Value = "PrecioCosto";
            hoja.Cell(1, EXPORT_COL_PRECIO_VENTA).Value = "PrecioVenta";
            hoja.Cell(1, EXPORT_COL_STOCK_ACTUAL).Value = "StockActual";
            hoja.Cell(1, EXPORT_COL_STOCK_MINIMO).Value = "StockMinimo";
            hoja.Cell(1, EXPORT_COL_SUELTO).Value = "Suelto";

            var headerRow = hoja.Row(1);
            headerRow.Style.Font.Bold = true;
            headerRow.Style.Fill.BackgroundColor = XLColor.FromHtml("#EFF6FF");

            var fila = 2;
            foreach (var p in productos)
            {
                hoja.Cell(fila, EXPORT_COL_CODIGO_BARRA).Value = p.CodigoBarra ?? "";
                hoja.Cell(fila, EXPORT_COL_NOMBRE).Value = p.Nombre;
                hoja.Cell(fila, EXPORT_COL_CATEGORIA).Value = p.Categoria?.Nombre ?? "";
                hoja.Cell(fila, EXPORT_COL_DISTRIBUIDOR).Value = p.DistribuidorNav?.Nombre ?? "";
                hoja.Cell(fila, EXPORT_COL_PRECIO_COSTO).Value = p.PrecioCosto;
                hoja.Cell(fila, EXPORT_COL_PRECIO_VENTA).Value = p.PrecioVenta;
                hoja.Cell(fila, EXPORT_COL_STOCK_ACTUAL).Value = p.StockActual;
                hoja.Cell(fila, EXPORT_COL_STOCK_MINIMO).Value = p.StockMinimo;
                hoja.Cell(fila, EXPORT_COL_SUELTO).Value = p.Suelto ? "Si" : "No";
                fila++;
            }

            hoja.Columns().AdjustToContents();
            hoja.SheetView.FreezeRows(1);

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }

        // ═══════════════════════════════════════════════════
        // LEER ESTRUCTURA (cualquier Excel) + sugerencia de mapeo
        // ═══════════════════════════════════════════════════

        public Task<LeerEstructuraExcelResponseDTO> LeerEstructuraAsync(Stream archivoExcel)
        {
            using var workbook = new XLWorkbook(archivoExcel);
            var hoja = workbook.Worksheet(1);
            var rangoUsado = hoja.RangeUsed();

            if (rangoUsado == null)
                return Task.FromResult(new LeerEstructuraExcelResponseDTO());

            var primeraFila = rangoUsado.FirstRow().RowNumber();
            var ultimaFila = rangoUsado.LastRow().RowNumber();
            var ultimaColumna = rangoUsado.LastColumn().ColumnNumber();

            var columnas = new List<ColumnaExcelDTO>();
            for (int col = 1; col <= ultimaColumna; col++)
            {
                var celdaEncabezado = hoja.Cell(primeraFila, col);
                columnas.Add(new ColumnaExcelDTO
                {
                    Indice = col,
                    Letra = ColumnaALetra(col),
                    Encabezado = celdaEncabezado.IsEmpty() ? null : celdaEncabezado.GetString().Trim()
                });
            }

            // Filas de ejemplo (desde la primera fila con datos, hasta 5)
            var filasEjemplo = new List<Dictionary<int, string>>();
            var hastaFila = Math.Min(ultimaFila, primeraFila + FILAS_EJEMPLO - 1);
            for (int fila = primeraFila; fila <= hastaFila; fila++)
            {
                var dict = new Dictionary<int, string>();
                for (int col = 1; col <= ultimaColumna; col++)
                {
                    var celda = hoja.Cell(fila, col);
                    dict[col] = celda.IsEmpty() ? "" : celda.GetString();
                }
                filasEjemplo.Add(dict);
            }

            var sugerido = SugerirMapeo(columnas);

            return Task.FromResult(new LeerEstructuraExcelResponseDTO
            {
                Columnas = columnas,
                FilasEjemplo = filasEjemplo,
                MapeoSugerido = sugerido
            });
        }

        /// <summary>
        /// Adivina a qué campo corresponde cada columna mirando el texto del encabezado.
        /// El usuario siempre puede corregir esto a mano en el frontend.
        /// </summary>
        private static ColumnaMapeoDTO SugerirMapeo(List<ColumnaExcelDTO> columnas)
        {
            int? Buscar(params string[] palabrasClave)
            {
                foreach (var col in columnas)
                {
                    if (string.IsNullOrWhiteSpace(col.Encabezado)) continue;
                    var texto = col.Encabezado.Trim().ToLower();
                    if (palabrasClave.Any(p => texto.Contains(p)))
                        return col.Indice;
                }
                return null;
            }

            return new ColumnaMapeoDTO
            {
                CodigoBarraColumna = Buscar("codigo de barra", "codigo barra", "cod. barra", "cod barra", "ean", "barcode"),
                NombreColumna = Buscar("nombre", "producto", "descripcion") ?? 0,
                CategoriaColumna = Buscar("categoria", "categoría", "rubro", "linea", "línea") ?? 0,
                DistribuidorColumna = Buscar("distribuidor", "proveedor"),
                PrecioCostoColumna = Buscar("precio costo", "precio de costo", "costo") ?? 0,
                PrecioVentaColumna = Buscar("precio venta", "precio de venta", "venta", "pvp") ?? 0,
                StockActualColumna = Buscar("stock actual", "stock") ?? 0,
                StockMinimoColumna = Buscar("stock minimo", "stock mínimo", "minimo", "mínimo") ?? 0,
                SueltoColumna = Buscar("suelto"),
                TieneEncabezados = columnas.Any(c => !string.IsNullOrWhiteSpace(c.Encabezado)),
            };
        }

        // ═══════════════════════════════════════════════════
        // PREVIEW (usa el mapeo de columnas, no persiste nada)
        // ═══════════════════════════════════════════════════

        public async Task<ImportarProductosPreviewResponseDTO> PreviewImportacionAsync(
            int kioscoId, Stream archivoExcel, ColumnaMapeoDTO mapeo)
        {
            var filas = LeerFilasConMapeo(archivoExcel, mapeo);
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

                if (!string.IsNullOrWhiteSpace(filaDto.CodigoBarra))
                {
                    if (!codigosVistos.Add(filaDto.CodigoBarra.Trim().ToLower()))
                        item.Errores.Add($"Código de barras '{filaDto.CodigoBarra}' repetido en otra fila del archivo");
                }

                item.CategoriaNueva = !string.IsNullOrWhiteSpace(filaDto.Categoria)
                    && !categorias.ContainsKey(filaDto.Categoria.Trim().ToLower());

                item.DistribuidorNuevo = !string.IsNullOrWhiteSpace(filaDto.Distribuidor)
                    && !distribuidores.ContainsKey(filaDto.Distribuidor.Trim().ToLower());

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

                        // ← AGREGAR ESTE IF
                        if (string.IsNullOrWhiteSpace(filaDto.CodigoBarra))
                        {
                            item.Advertencias.Add(
                                "Sin código de barras: no se puede detectar si ya existe, así que se va a " +
                                "crear como producto nuevo cada vez que reimportes este archivo (riesgo de duplicados).");
                        }
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
        // CONFIRMAR (persiste) — sin cambios respecto a antes
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
                            CodigoBarra = string.IsNullOrWhiteSpace(filaDto.CodigoBarra) ? "" : filaDto.CodigoBarra.Trim(),
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
                    // ex.Message solo trae el mensaje genérico de EF ("An error occurred
                    // while saving..."); el motivo real vive en InnerException.
                    var detalle = ex.InnerException?.Message ?? ex.Message;
                    resultado.Errores.Add($"Fila {filaDto.NumeroFila} ('{filaDto.Nombre}'): {detalle}");

                    // Si SaveChanges falló, la entidad rota puede quedar "pegada" en el
                    // ChangeTracker y arruinar el guardado de las filas siguientes.
                    // La limpiamos para que el resto del import pueda seguir sin problemas.
                    await _productoRepository.LimpiarSeguimientoAsync();
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
                .ToDictionary(g => g.Key, g => g.First());

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

        /// <summary>
        /// Lee las filas del Excel usando el mapeo de columnas indicado por el usuario
        /// (en vez de columnas fijas). Saltea filas vacías sin cortar el recorrido,
        /// por si hay huecos en el medio del archivo.
        /// </summary>
        private static List<ImportarProductoFilaDTO> LeerFilasConMapeo(Stream archivoExcel, ColumnaMapeoDTO mapeo)
        {
            using var workbook = new XLWorkbook(archivoExcel);
            var hoja = workbook.Worksheet(1);
            var rangoUsado = hoja.RangeUsed();
            if (rangoUsado == null) return new List<ImportarProductoFilaDTO>();

            var primeraFila = rangoUsado.FirstRow().RowNumber();
            var ultimaFila = rangoUsado.LastRow().RowNumber();
            var filaInicio = mapeo.TieneEncabezados ? primeraFila + 1 : primeraFila;

            var filas = new List<ImportarProductoFilaDTO>();

            for (int fila = filaInicio; fila <= ultimaFila; fila++)
            {
                var nombre = LeerTexto(hoja.Cell(fila, mapeo.NombreColumna));
                var codigoBarra = mapeo.CodigoBarraColumna.HasValue
                    ? LeerTexto(hoja.Cell(fila, mapeo.CodigoBarraColumna.Value))
                    : null;
                var categoria = LeerTexto(hoja.Cell(fila, mapeo.CategoriaColumna));

                var filaVacia = string.IsNullOrWhiteSpace(nombre)
                    && string.IsNullOrWhiteSpace(codigoBarra)
                    && string.IsNullOrWhiteSpace(categoria);

                if (filaVacia) continue; // hueco en el medio del archivo: lo saltea, no corta

                filas.Add(new ImportarProductoFilaDTO
                {
                    NumeroFila = fila,
                    CodigoBarra = codigoBarra,
                    Nombre = nombre ?? "",
                    Categoria = categoria ?? "",
                    Distribuidor = mapeo.DistribuidorColumna.HasValue
                        ? LeerTexto(hoja.Cell(fila, mapeo.DistribuidorColumna.Value))
                        : null,
                    PrecioCosto = LeerDecimal(hoja.Cell(fila, mapeo.PrecioCostoColumna)),
                    PrecioVenta = LeerDecimal(hoja.Cell(fila, mapeo.PrecioVentaColumna)),
                    StockActual = (int)LeerDecimal(hoja.Cell(fila, mapeo.StockActualColumna)),
                    StockMinimo = (int)LeerDecimal(hoja.Cell(fila, mapeo.StockMinimoColumna)),
                    Suelto = mapeo.SueltoColumna.HasValue
                        ? LeerBooleano(hoja.Cell(fila, mapeo.SueltoColumna.Value))
                        : false,
                });
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
            catch { return 0; } // fila queda en 0 → la validación de precios la marca como error si corresponde
        }

        private static bool LeerBooleano(IXLCell celda)
        {
            if (celda.IsEmpty()) return false;
            var texto = celda.GetString().Trim().ToLower();
            return texto is "si" or "sí" or "true" or "1" or "x";
        }

        /// <summary>Convierte un índice de columna 1-based a su letra ("A", "B", ..., "AA", ...)</summary>
        private static string ColumnaALetra(int col)
        {
            var letra = "";
            while (col > 0)
            {
                var resto = (col - 1) % 26;
                letra = (char)('A' + resto) + letra;
                col = (col - 1) / 26;
            }
            return letra;
        }
    }
}
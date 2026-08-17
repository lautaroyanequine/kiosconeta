import React, { useState } from 'react'
import {
  Package, TrendingUp, TrendingDown, AlertTriangle,
  ShoppingCart, RefreshCw, ChevronUp, ChevronDown,
  Clock, DollarSign, Trash2, CheckSquare, Square, X
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import apiClient, { handleResponse } from '@/apis/client'
import { formatCurrency } from '@/utils/formatters'
import { ProductoDetalleModal } from './ProductoDetalleModal'
import type { ProductoDetalleData } from './ProductoDetalleModal'

// ── Tipos ──────────────────────────────────────────────────────────────────

interface AnalisisProducto {
  productoId: number
  nombre: string
  categoria: string
  unidadesVendidas: number
  totalIngresos: number
  totalCosto: number
  ganancia: number
  margenGanancia: number
  stockActual: number
  diasAnalizados: number
  promedioVentasDiarias: number
  recomendacionCompra: number
  costoTotalRecomendado: number
  diasStockRestante: number
  ultimaVenta?: string
}

interface AnalisisResponse {
  diasAnalizados: number
  totalProductosVendidos: number
  totalIngresos: number
  totalGanancia: number
  totalInversionNecesaria: number
  productos: AnalisisProducto[]
}

interface Props {
  ventasFiltradas: any[]
  productos: any[]
  productosSinMov: any[]
  productosSinStock: any[]
  stockBajo: any[]
  desde: Date  
  hasta: Date
}

type SortKey = 'unidadesVendidas' | 'ganancia' | 'margenGanancia' | 'recomendacionCompra' | 'diasStockRestante'
type Periodo = 7 | 30 | 90

// ── Helpers ────────────────────────────────────────────────────────────────

const diasStockColor = (dias: number) => {
  if (dias <= 3)  return 'text-danger bg-danger-50'
  if (dias <= 7)  return 'text-warning-700 bg-warning-50'
  if (dias <= 14) return 'text-blue-600 bg-blue-50'
  return 'text-success-700 bg-success-50'
}

// ── Presupuesto de reposición ────────────────────────────────────────────
// Compara stock mínimo (semanal) vs stock actual, calcula el faltante y su
// costo, y permite ir seleccionando productos para armar un presupuesto.

interface ProductoConFaltante {
  productoId: number
  nombre: string
  categoria: string
  distribuidor: string
  stockActual: number
  stockMinimo: number
  precioCosto: number
  faltante: number
}

const PresupuestoReposicion: React.FC<{ productos: any[] }> = ({ productos }) => {
  // productoId -> cantidad elegida a comprar
  const [seleccionados, setSeleccionados] = useState<Record<number, number>>({})
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [filtroDistribuidor, setFiltroDistribuidor] = useState('todos')
  const [soloFaltantes, setSoloFaltantes] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [modalExportar, setModalExportar] = useState(false)
  const [incluirPrecios, setIncluirPrecios] = useState(true)
  const [copiado, setCopiado] = useState(false)

  const productosConFaltante: ProductoConFaltante[] = React.useMemo(() =>
    productos.map((p: any) => ({
      productoId: p.productoId,
      nombre: p.nombre,
      categoria: p.categoria || 'Sin categoría',
      distribuidor: p.distribuidorNombre || 'Sin distribuidor',
      stockActual: p.stockActual ?? 0,
      stockMinimo: p.stockMinimo ?? 0,
      precioCosto: p.precioCosto ?? 0,
      faltante: Math.max(0, (p.stockMinimo ?? 0) - (p.stockActual ?? 0)),
    }))
  , [productos])

  const categorias = React.useMemo(() =>
    [...new Set(productosConFaltante.map(p => p.categoria))].sort()
  , [productosConFaltante])

  const distribuidores = React.useMemo(() =>
    [...new Set(productosConFaltante.map(p => p.distribuidor))].sort()
  , [productosConFaltante])

  const listaFiltrada = React.useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return productosConFaltante
      .filter(p => !soloFaltantes || p.faltante > 0)
      .filter(p => filtroCategoria === 'todas' || p.categoria === filtroCategoria)
      .filter(p => filtroDistribuidor === 'todos' || p.distribuidor === filtroDistribuidor)
      .filter(p => !q || p.nombre.toLowerCase().includes(q))
      .sort((a, b) => a.categoria.localeCompare(b.categoria) || a.nombre.localeCompare(b.nombre))
  }, [productosConFaltante, soloFaltantes, filtroCategoria, filtroDistribuidor, busqueda])

  const grupos = React.useMemo(() => {
    const mapa: Record<string, ProductoConFaltante[]> = {}
    listaFiltrada.forEach(p => {
      if (!mapa[p.categoria]) mapa[p.categoria] = []
      mapa[p.categoria].push(p)
    })
    return mapa
  }, [listaFiltrada])

  const toggleSeleccion = (p: ProductoConFaltante) => {
    setSeleccionados(prev => {
      const next = { ...prev }
      if (next[p.productoId] != null) delete next[p.productoId]
      else next[p.productoId] = p.faltante > 0 ? p.faltante : 1
      return next
    })
  }

  const actualizarCantidad = (productoId: number, cantidad: number) => {
    setSeleccionados(prev => ({ ...prev, [productoId]: Math.max(0, cantidad) }))
  }

  const seleccionarTodoFaltante = () => {
    const nuevo: Record<number, number> = {}
    productosConFaltante.forEach(p => { if (p.faltante > 0) nuevo[p.productoId] = p.faltante })
    setSeleccionados(nuevo)
  }

  const limpiarSeleccion = () => setSeleccionados({})

  const itemsPresupuesto = React.useMemo(() =>
    Object.entries(seleccionados)
      .map(([id, cantidad]) => {
        const p = productosConFaltante.find(pp => pp.productoId === Number(id))
        if (!p) return null
        return { ...p, cantidad, costoTotal: cantidad * p.precioCosto }
      })
      .filter((x): x is ProductoConFaltante & { cantidad: number; costoTotal: number } => x !== null)
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  , [seleccionados, productosConFaltante])

  const totalPresupuesto = itemsPresupuesto.reduce((s, i) => s + i.costoTotal, 0)
  const totalFaltantes = productosConFaltante.filter(p => p.faltante > 0).length

  // ── Exportar como texto (para pegar en WhatsApp / Notas) ────────────────
  const generarTextoPresupuesto = React.useCallback(() => {
    const fecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const porDistribuidor: Record<string, typeof itemsPresupuesto> = {}
    itemsPresupuesto.forEach(i => {
      if (!porDistribuidor[i.distribuidor]) porDistribuidor[i.distribuidor] = []
      porDistribuidor[i.distribuidor].push(i)
    })

    let texto = `🛒 Pedido de compra - ${fecha}\n`
    Object.entries(porDistribuidor)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([distribuidor, items]) => {
        texto += `\n📦 ${distribuidor}\n`
        items.forEach(i => {
          texto += incluirPrecios
            ? `• ${i.nombre} x${i.cantidad} - ${formatCurrency(i.costoTotal)}\n`
            : `• ${i.nombre} x${i.cantidad}\n`
        })
        if (incluirPrecios) {
          const subtotal = items.reduce((s, i) => s + i.costoTotal, 0)
          texto += `Subtotal: ${formatCurrency(subtotal)}\n`
        }
      })

    if (incluirPrecios) {
      texto += `\nTotal: ${formatCurrency(totalPresupuesto)}`
    }
    return texto
  }, [itemsPresupuesto, incluirPrecios, totalPresupuesto])

  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const handleCopiar = async () => {
    const texto = generarTextoPresupuesto()
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // Fallback si el navegador bloquea el acceso al portapapeles:
      // seleccionamos el texto del textarea para que el usuario copie con Ctrl+C
      textareaRef.current?.select()
      try {
        document.execCommand('copy')
        setCopiado(true)
        setTimeout(() => setCopiado(false), 2000)
      } catch {
        // Si tampoco funciona, el texto queda seleccionado y listo para copiar a mano
      }
    }
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <ShoppingCart size={16} className="text-primary" />
          <h3 className="text-sm font-bold text-neutral-700 uppercase tracking-wide">
            Presupuesto de reposición
          </h3>
          {totalFaltantes > 0 && (
            <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              {totalFaltantes} bajo el mínimo
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={seleccionarTodoFaltante}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-primary/30 text-primary
                       text-xs font-medium hover:bg-primary/5 transition-colors">
            <CheckSquare size={13} /> Seleccionar todo lo faltante
          </button>
          {itemsPresupuesto.length > 0 && (
            <button onClick={limpiarSeleccion}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 text-neutral-500
                         text-xs font-medium hover:bg-neutral-50 transition-colors">
              <Trash2 size={13} /> Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="px-5 py-3 border-b border-neutral-100 grid grid-cols-[2fr_1fr_1fr_1fr] gap-2">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="min-w-0 w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-primary"
        />
        <select
          value={filtroCategoria}
          onChange={e => setFiltroCategoria(e.target.value)}
          className="min-w-0 w-full px-2 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-primary bg-white"
        >
          <option value="todas">Todas las categorías</option>
          {categorias.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filtroDistribuidor}
          onChange={e => setFiltroDistribuidor(e.target.value)}
          className="min-w-0 w-full px-2 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-primary bg-white"
        >
          <option value="todos">Todos los distribuidores</option>
          {distribuidores.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <button
          onClick={() => setSoloFaltantes(v => !v)}
          className={`min-w-0 w-full px-2 py-2 rounded-lg text-xs font-medium border transition-all leading-tight text-center
            ${soloFaltantes
              ? 'bg-amber-50 border-amber-300 text-amber-700'
              : 'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300'}`}
        >
          Solo debajo del mínimo
        </button>
      </div>

      {/* Tabla agrupada por categoría */}
      <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
        {listaFiltrada.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-300">
            <Package size={32} className="mb-2 opacity-30" />
            <p className="text-sm text-neutral-400">
              {soloFaltantes ? '¡Todo por encima del stock mínimo! ✓' : 'Sin productos para mostrar'}
            </p>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="sticky top-0 z-10">
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="px-4 py-3 text-left font-semibold text-neutral-500 w-8"></th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-500">Producto</th>
                <th className="px-4 py-3 text-right font-semibold text-neutral-500">Stock mín. (sem.)</th>
                <th className="px-4 py-3 text-right font-semibold text-neutral-500">Stock actual</th>
                <th className="px-4 py-3 text-right font-semibold text-amber-700">Faltante</th>
                <th className="px-4 py-3 text-right font-semibold text-neutral-500">Costo U</th>
                <th className="px-4 py-3 text-right font-semibold text-primary">Cant. a comprar</th>
                <th className="px-4 py-3 text-right font-semibold text-warning-700">Costo total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {Object.entries(grupos).map(([categoria, items]) => (
                <React.Fragment key={categoria}>
                  <tr className="bg-blue-50/60">
                    <td colSpan={8} className="px-4 py-1.5 font-bold text-blue-700 uppercase tracking-wide text-[11px]">
                      {categoria}
                    </td>
                  </tr>
                  {items.map(p => {
                    const seleccionado = seleccionados[p.productoId] != null
                    const cantidad = seleccionados[p.productoId] ?? p.faltante
                    const costoTotal = cantidad * p.precioCosto
                    return (
                      <tr key={p.productoId}
                        className={`transition-colors ${seleccionado ? 'bg-primary/5' : 'hover:bg-neutral-50'}`}>
                        <td className="px-4 py-2.5">
                          <button onClick={() => toggleSeleccion(p)} className="text-primary">
                            {seleccionado ? <CheckSquare size={16} /> : <Square size={16} className="text-neutral-300" />}
                          </button>
                        </td>
                        <td className="px-4 py-2.5 font-medium text-neutral-800">{p.nombre}</td>
                        <td className="px-4 py-2.5 text-right text-neutral-500">{p.stockMinimo}</td>
                        <td className="px-4 py-2.5 text-right text-neutral-600">{p.stockActual}</td>
                        <td className="px-4 py-2.5 text-right">
                          {p.faltante > 0 ? (
                            <span className="font-bold text-amber-700">{p.faltante}u</span>
                          ) : (
                            <span className="text-success-600">OK</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right text-neutral-500">{formatCurrency(p.precioCosto)}</td>
                        <td className="px-4 py-2.5 text-right">
                          <input
                            type="number"
                            min={0}
                            value={cantidad}
                            onChange={e => {
                              const val = Math.max(0, Number(e.target.value) || 0)
                              if (!seleccionado && val > 0) {
                                setSeleccionados(prev => ({ ...prev, [p.productoId]: val }))
                              } else {
                                actualizarCantidad(p.productoId, val)
                              }
                            }}
                            className="w-16 px-2 py-1 text-right border border-neutral-200 rounded-md
                                       focus:outline-none focus:border-primary text-xs"
                          />
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold text-warning-700">
                          {formatCurrency(costoTotal)}
                        </td>
                      </tr>
                    )
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Resumen del presupuesto (siempre visible) */}
      <div className="border-t border-neutral-200 bg-neutral-50">
        {itemsPresupuesto.length > 0 && (
          <div className="px-5 py-3 border-b border-neutral-200 max-h-40 overflow-y-auto space-y-1.5">
            {itemsPresupuesto.map(i => (
              <div key={i.productoId} className="flex items-center justify-between text-xs">
                <span className="text-neutral-600 truncate flex-1">{i.nombre} <span className="text-neutral-400">× {i.cantidad}</span></span>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="font-semibold text-neutral-700">{formatCurrency(i.costoTotal)}</span>
                  <button onClick={() => toggleSeleccion(i)} className="text-neutral-300 hover:text-danger transition-colors">
                    <X size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs text-neutral-400">
              {itemsPresupuesto.length} producto{itemsPresupuesto.length !== 1 ? 's' : ''} seleccionado{itemsPresupuesto.length !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-neutral-400 mt-0.5">Presupuesto de compra</p>
          </div>
          <div className="flex items-center gap-3">
            {itemsPresupuesto.length > 0 && (
              <button
                onClick={() => setModalExportar(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary/30 text-primary
                           text-xs font-medium hover:bg-primary/5 transition-colors"
              >
                📋 Copiar lista
              </button>
            )}
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalPresupuesto)}</p>
          </div>
        </div>
      </div>

      {/* Modal: copiar lista como texto */}
      {modalExportar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) setModalExportar(false) }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">Copiar lista de compra</h3>
              <button onClick={() => setModalExportar(false)} className="text-neutral-400 hover:text-neutral-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer w-fit">
                <input
                  type="checkbox"
                  checked={incluirPrecios}
                  onChange={e => setIncluirPrecios(e.target.checked)}
                  className="rounded border-neutral-300"
                />
                Incluir precios y totales
              </label>
              <textarea
                ref={textareaRef}
                readOnly
                value={generarTextoPresupuesto()}
                rows={12}
                className="w-full px-3 py-2.5 rounded-lg border border-neutral-300 text-sm font-mono
                           outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                onFocus={e => e.target.select()}
              />
              <p className="text-xs text-neutral-400">
                Tocá el botón para copiarlo, o seleccionalo a mano y usá Ctrl+C / Cmd+C.
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setModalExportar(false)}
                className="flex-1 py-2.5 text-sm text-neutral-600 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors">
                Cerrar
              </button>
              <button onClick={handleCopiar}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all
                  ${copiado ? 'bg-success text-white' : 'bg-primary text-white hover:bg-primary-600'}`}>
                {copiado ? '✓ Copiado' : 'Copiar al portapapeles'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Componente ─────────────────────────────────────────────────────────────

export const AnalisisProductosCompleto: React.FC<Props> = ({
  ventasFiltradas, productos, productosSinMov, productosSinStock, stockBajo
}) => {
  const { user } = useAuth()
const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoDetalleData | null>(null)

  const [periodo, setPeriodo]   = useState<Periodo>(30)
  const [data, setData]         = useState<AnalisisResponse | null>(null)
  const [loading, setLoading]   = useState(false)
  const [sortKey, setSortKey]   = useState<SortKey>('unidadesVendidas')
  const [sortAsc, setSortAsc]   = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [cargado, setCargado]   = useState(false)

  // Top productos del período actual (desde ventasFiltradas del dashboard)
  const topProductos = React.useMemo(() => {
    const mapa: Record<number, { nombre: string; cantidad: number; total: number }> = {}
    ventasFiltradas.forEach(v => v.productos?.forEach((p: any) => {
      if (!mapa[p.productoId]) mapa[p.productoId] = { nombre: p.productoNombre, cantidad: 0, total: 0 }
      mapa[p.productoId].cantidad += p.cantidad
      mapa[p.productoId].total += p.precioUnitario * p.cantidad
    }))
    return Object.values(mapa).sort((a, b) => b.cantidad - a.cantidad)
  }, [ventasFiltradas])

  const maxCantidad = topProductos[0]?.cantidad ?? 1

  const cargar = async () => {
    if (!user?.kioscoId) return
    setLoading(true)
    try {
      const hasta = new Date()
      const desde = new Date()
      desde.setDate(desde.getDate() - periodo)
      const res = await apiClient.post(
  `/Dashboard/kiosco/${user.kioscoId}/analisis-productos`,
  { fechaDesde: desde.toISOString(), fechaHasta: hasta.toISOString() }
)
      setData(handleResponse(res))
      setCargado(true)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { cargar() }, [periodo])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(p => !p)
    else { setSortKey(key); setSortAsc(false) }
  }

  const productosFiltrados = (data?.productos ?? [])
    .filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => {
      const diff = a[sortKey] - b[sortKey]
      return sortAsc ? diff : -diff
    })

  const SortIcon: React.FC<{ col: SortKey }> = ({ col }) =>
    sortKey === col
      ? sortAsc ? <ChevronUp size={11} /> : <ChevronDown size={11} />
      : <ChevronDown size={11} className="opacity-30" />

  return (
    <div className="space-y-6">

      {/* ── RESUMEN DE STOCKS ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Sin movimiento */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Package size={15} className="text-neutral-400" />
            <h3 className="text-sm font-bold text-neutral-700 uppercase tracking-wide">
              Sin ventas hace 30+ días
            </h3>
          </div>
          {productosSinMov.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-6">Todos tienen movimiento ✓</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {productosSinMov.map((p: any) => (
                <div key={p.productoId} className="flex items-center justify-between py-1.5 border-b border-neutral-50">
                  <p className="text-sm text-neutral-700 truncate flex-1">{p.nombre}</p>
                  <span className="text-xs text-neutral-400 shrink-0 ml-2">Stock: {p.stockActual}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stock bajo */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={15} className="text-amber-500" />
            <h3 className="text-sm font-bold text-neutral-700 uppercase tracking-wide">
              Stock bajo ({stockBajo.length})
            </h3>
          </div>
          {stockBajo.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-6">Sin alertas de stock ✓</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {stockBajo.map((p: any) => (
                <div key={p.productoId}
                  className="flex items-center justify-between p-2 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-xs font-medium text-amber-800 truncate flex-1">{p.nombre}</p>
                  <span className="text-xs font-bold text-amber-700 ml-2 shrink-0">
                    {p.stockActual}/{p.stockMinimo}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Agotados */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={15} className="text-danger" />
            <h3 className="text-sm font-bold text-neutral-700 uppercase tracking-wide">
              Agotados ({productosSinStock.length})
            </h3>
          </div>
          {productosSinStock.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-6">¡Sin productos agotados! ✓</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {productosSinStock.map((p: any) => (
                <div key={p.productoId}
                  className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-100">
                  <p className="text-xs font-medium text-red-800 truncate flex-1">{p.nombre}</p>
                  <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded ml-2 shrink-0">
                    Sin stock
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── PRESUPUESTO DE REPOSICIÓN ─────────────────────────────────── */}
      <PresupuestoReposicion productos={productos} />

      {/* ── TOP PRODUCTOS (completo) ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-neutral-400" />
            <h3 className="text-sm font-bold text-neutral-700 uppercase tracking-wide">
              Más vendidos (período seleccionado)
            </h3>
          </div>
          {topProductos.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-6">Sin ventas en el período</p>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {topProductos.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                    ${i === 0 ? 'bg-warning-100 text-warning-700'
                    : i === 1 ? 'bg-neutral-200 text-neutral-600'
                    : i === 2 ? 'bg-orange-100 text-orange-600'
                    : 'bg-neutral-50 text-neutral-400'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-neutral-800 truncate">{p.nombre}</p>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-xs text-neutral-400">{formatCurrency(p.total)}</span>
                        <span className="text-xs font-bold text-primary">{p.cantidad}u</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all
                        ${i === 0 ? 'bg-primary' : i < 3 ? 'bg-primary/60' : 'bg-primary/30'}`}
                        style={{ width: `${(p.cantidad / maxCantidad) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown size={15} className="text-neutral-400" />
            <h3 className="text-sm font-bold text-neutral-700 uppercase tracking-wide">
              Menor rotación (período seleccionado)
            </h3>
          </div>
          {topProductos.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-6">Sin ventas en el período</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {[...topProductos].reverse().map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-50">
                  <p className="text-sm text-neutral-700 truncate flex-1">{p.nombre}</p>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-xs text-neutral-400">{formatCurrency(p.total)}</span>
                    <span className="text-sm font-semibold text-warning-700">{p.cantidad}u</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>


      {/* ── ANÁLISIS DETALLADO ─────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-primary" />
            <h3 className="text-sm font-bold text-neutral-700 uppercase tracking-wide">
              Análisis detallado por producto
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-neutral-200 overflow-hidden text-xs">
              {([7, 30, 90] as Periodo[]).map(p => (
                <button key={p} onClick={() => setPeriodo(p)}
                  className={`px-3 py-1.5 font-medium transition-all
                    ${periodo === p ? 'bg-primary text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}>
                  {p} días
                </button>
              ))}
            </div>
            <button onClick={cargar}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-200
                         text-xs text-neutral-500 hover:bg-neutral-50 transition-colors">
              <RefreshCw size={12} /> Actualizar
            </button>
          </div>
        </div>

        {/* Resumen */}
        {data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-b border-neutral-100">
            <div className="px-5 py-4 border-r border-neutral-100">
              <p className="text-xs text-neutral-400 mb-1">Productos vendidos</p>
              <p className="text-2xl font-bold text-neutral-900">{data.totalProductosVendidos}</p>
              <p className="text-xs text-neutral-400 mt-0.5">en {data.diasAnalizados} días</p>
            </div>
            <div className="px-5 py-4 border-r border-neutral-100">
              <p className="text-xs text-neutral-400 mb-1">Total ingresos</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(data.totalIngresos)}</p>
            </div>
            <div className="px-5 py-4 border-r border-neutral-100">
              <p className="text-xs text-neutral-400 mb-1">Ganancia total</p>
              <p className="text-xl font-bold text-success-700">{formatCurrency(data.totalGanancia)}</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs text-neutral-400 mb-1">Inversión recomendada</p>
              <p className="text-xl font-bold text-warning-700">{formatCurrency(data.totalInversionNecesaria)}</p>
            </div>
          </div>
        )}

        {/* Buscador */}
        <div className="px-5 py-3 border-b border-neutral-100">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value) }
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-primary"
          />
        </div>

        {/* Tabla */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-300">
            <Package size={32} className="mb-2 opacity-30" />
            <p className="text-sm text-neutral-400">Sin datos para el período</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500 sticky left-0 bg-neutral-50">Producto</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500">Categoría</th>
                  <th className="px-4 py-3 text-right font-semibold text-neutral-500 cursor-pointer hover:text-primary"
                    onClick={() => toggleSort('unidadesVendidas')}>
                    <span className="flex items-center justify-end gap-1">Vendido(U) <SortIcon col="unidadesVendidas" /></span>
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-neutral-500">Ingresos</th>
                  <th className="px-4 py-3 text-right font-semibold text-neutral-500 cursor-pointer hover:text-primary"
                    onClick={() => toggleSort('ganancia')}>
                    <span className="flex items-center justify-end gap-1">Ganancia <SortIcon col="ganancia" /></span>
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-neutral-500 cursor-pointer hover:text-primary"
                    onClick={() => toggleSort('margenGanancia')}>
                    <span className="flex items-center justify-end gap-1">Margen <SortIcon col="margenGanancia" /></span>
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-neutral-500">Stock</th>
                  <th className="px-4 py-3 text-right font-semibold text-neutral-500 cursor-pointer hover:text-primary"
                    onClick={() => toggleSort('diasStockRestante')}>
                    <span className="flex items-center justify-end gap-1">Días stock <SortIcon col="diasStockRestante" /></span>
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-neutral-500">Prom/día</th>
                  <th className="px-4 py-3 text-right font-semibold text-neutral-500">Última venta</th>
                  <th className="px-4 py-3 text-right font-semibold text-primary cursor-pointer hover:text-primary-600"
                    onClick={() => toggleSort('recomendacionCompra')}>
                    <span className="flex items-center justify-end gap-1">Comprar <SortIcon col="recomendacionCompra" /></span>
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-warning-700">Costo repos.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {productosFiltrados.map(p => (
                  <tr
                    key={p.productoId}
                    className="hover:bg-neutral-50 transition-colors cursor-pointer"
                    onClick={() => setProductoSeleccionado(p)}
                  >                    <td className="px-4 py-3 font-medium text-neutral-800 sticky left-0 bg-white">{p.nombre}</td>
                    <td className="px-4 py-3 text-neutral-400">{p.categoria}</td>
                    <td className="px-4 py-3 text-right font-bold text-neutral-800">{p.unidadesVendidas}</td>
                    <td className="px-4 py-3 text-right text-neutral-600">{formatCurrency(p.totalIngresos)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-success-700">{formatCurrency(p.ganancia)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full font-semibold text-xs
                        ${p.margenGanancia >= 30 ? 'bg-success-50 text-success-700'
                        : p.margenGanancia >= 10 ? 'bg-warning-50 text-warning-700'
                        : 'bg-danger-50 text-danger'}`}>
                        {p.margenGanancia}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-neutral-600">{p.stockActual}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full font-semibold text-xs ${diasStockColor(p.diasStockRestante)}`}>
                        {p.diasStockRestante >= 999 ? '∞' : `${p.diasStockRestante}d`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-400">{p.promedioVentasDiarias}</td>
                    <td className="px-4 py-3 text-right text-neutral-400">
                      {p.ultimaVenta
                        ? new Date(p.ultimaVenta).toLocaleDateString('es-AR', { day:'2-digit', month:'2-digit' })
                        : '—'}
                        
                    </td>
                    
                    <td className="px-4 py-3 text-right">
                      <span className="bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-lg">
                        {p.recomendacionCompra}u
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-warning-700">
                      {formatCurrency(p.costoTotalRecomendado)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50">
          <p className="text-xs text-neutral-400">
            💡 <strong>Días stock</strong>: con el stock actual, cuántos días podés vender al ritmo actual.
            <strong className="ml-2">Comprar</strong>: unidades sugeridas para el próximo período (+10% de margen).
            <strong className="ml-2">Costo repos.</strong>: inversión necesaria para reponer.
          </p>
        </div>
      </div>
      <ProductoDetalleModal
  producto={productoSeleccionado}
  diasAnalizados={periodo}
  onClose={() => setProductoSeleccionado(null)}
/>
    </div>
  )
}
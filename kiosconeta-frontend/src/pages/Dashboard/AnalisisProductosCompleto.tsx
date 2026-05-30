import React, { useState } from 'react'
import {
  Package, TrendingUp, TrendingDown, AlertTriangle,
  ShoppingCart, RefreshCw, ChevronUp, ChevronDown,
  Clock, DollarSign
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import apiClient, { handleResponse } from '@/apis/client'
import { formatCurrency } from '@/utils/formatters'

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

// ── Componente ─────────────────────────────────────────────────────────────

export const AnalisisProductosCompleto: React.FC<Props> = ({
  ventasFiltradas, productos, productosSinMov, productosSinStock, stockBajo
}) => {
  const { user } = useAuth()

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
                    <span className="flex items-center justify-end gap-1">Unidades <SortIcon col="unidadesVendidas" /></span>
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
                  <tr key={p.productoId} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-neutral-800 sticky left-0 bg-white">{p.nombre}</td>
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
    </div>
  )
}
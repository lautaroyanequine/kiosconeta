// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: AnalisisProductos
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react'
import { Package, TrendingUp, ShoppingCart, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react'
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
  stockMinimo: number
  recomendacionCompra: number
  costoTotalRecomendado: number
}

interface AnalisisResponse {
  diasAnalizados: number
  fechaDesde: string
  fechaHasta: string
  totalProductosVendidos: number
  totalIngresos: number
  totalGanancia: number
  totalInversionNecesaria: number
  productos: AnalisisProducto[]
}

type SortKey = 'unidadesVendidas' | 'ganancia' | 'margenGanancia' | 'recomendacionCompra'
type Periodo = 7 | 30 | 90
// ── Componente ─────────────────────────────────────────────────────────────

export const AnalisisProductos: React.FC = () => {
  const { user } = useAuth()
const [soloStockBajo, setSoloStockBajo] = useState(false)
  const [periodo, setPeriodo] = useState<Periodo>(30)
  const [data, setData]       = useState<AnalisisResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('unidadesVendidas')
  const [sortAsc, setSortAsc] = useState(false)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => { cargar() }, [periodo])

  const cargar = async () => {
    if (!user?.kioscoId) return
    setLoading(true)
    try {
      const hasta  = new Date()
      const desde  = new Date()
      desde.setDate(desde.getDate() - periodo)

      const res = await apiClient.post(
        `/Dashboard/kiosco/${user.kioscoId}/analisis-productos`,
        {
          fechaDesde: desde.toISOString(),
          fechaHasta: hasta.toISOString(),
        }
      )
      setData(handleResponse(res))
    } catch (err) {
      console.error('Error cargando análisis:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(prev => !prev)
    else { setSortKey(key); setSortAsc(false) }
  }
// Esta función define la regla de "Crítico"
const esProductoCritico = (p: AnalisisProducto) => {
  // Asegúrate de que los nombres aquí coincidan con tu objeto
  return p.stockActual < p.stockMinimo;
};

  const productosFiltrados = (data?.productos ?? []).filter(p => {
    // 1. Verificación básica
    const esCritico = p.stockActual < p.stockMinimo;
    
    // 2. LOG PARA DEPURAR (Abre la consola F12 en tu navegador)
    console.log(`Producto: ${p.nombre} | Actual: ${p.stockActual} | Mínimo: ${p.stockMinimo} | ¿Es Crítico?: ${esCritico}`);
    
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideFiltroStock = soloStockBajo ? esCritico : true;
    
    return coincideBusqueda && coincideFiltroStock;
})
  .sort((a, b) => {
    const diff = a[sortKey] - b[sortKey];
    return sortAsc ? diff : -diff;
  });

  const SortIcon: React.FC<{ col: SortKey }> = ({ col }) =>
    sortKey === col
      ? sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />
      : <ChevronDown size={12} className="opacity-30" />

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Package size={16} className="text-primary" />
          <h2 className="text-sm font-bold text-neutral-700 uppercase tracking-wide">
            Análisis de productos
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Selector período */}
          <div className="flex rounded-lg border border-neutral-200 overflow-hidden text-xs">
            {([7, 30, 90] as Periodo[]).map(p => (
              <button key={p}
                onClick={() => setPeriodo(p)}
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

      {/* Resumen general */}
      {data && (
        <div className="grid grid-cols-3 gap-0 border-b border-neutral-100">
          <div className="px-5 py-4 border-r border-neutral-100">
            <p className="text-xs text-neutral-400 mb-1">Productos vendidos</p>
            <p className="text-2xl font-bold text-neutral-900">{data.totalProductosVendidos}</p>
            <p className="text-xs text-neutral-400 mt-0.5">en {data.diasAnalizados} días</p>
          </div>
          <div className="px-5 py-4 border-r border-neutral-100">
            <p className="text-xs text-neutral-400 mb-1 flex items-center gap-1">
              <TrendingUp size={11} /> Total ingresos
            </p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(data.totalIngresos)}</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-xs text-neutral-400 mb-1 flex items-center gap-1">
              <ShoppingCart size={11} /> Ganancia total
            </p>
            <p className="text-2xl font-bold text-success-700">{formatCurrency(data.totalGanancia)}</p>
          </div>
          <div className="px-5 py-4">
  <p className="text-xs text-neutral-400 mb-1 flex items-center gap-1">
    <ShoppingCart size={11} /> Inv. necesaria
  </p>
  <p className="text-2xl font-bold text-primary-600">{formatCurrency(data.totalInversionNecesaria)}</p>
</div>
        </div>
      )}

      {/* Buscador */}
      {/* Dentro del bloque del buscador */}
<div className="px-5 py-3 border-b border-neutral-100 flex items-center gap-4">
  <input
    type="text"
    placeholder="Buscar producto..."
    value={busqueda}
    onChange={e => setBusqueda(e.target.value)}
    className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-primary"
  />
  
  <button 
    onClick={() => setSoloStockBajo(!soloStockBajo)}
    className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors border 
      ${soloStockBajo 
        ? 'bg-danger text-white border-danger' 
        : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'}`}
  >
    {soloStockBajo ? 'Mostrando críticos' : 'Ver críticos'}
  </button>
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
                <th className="px-4 py-3 text-left font-semibold text-neutral-500">Producto</th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-500">Categoría</th>
                <th className="px-4 py-3 text-right font-semibold text-neutral-500 cursor-pointer hover:text-primary"
                  onClick={() => toggleSort('unidadesVendidas')}>
                  <span className="flex items-center justify-end gap-1">
                    Unidades <SortIcon col="unidadesVendidas" />
                  </span>
                </th>
                <th className="px-4 py-3 text-right font-semibold text-neutral-500">Ingresos</th>
                <th className="px-4 py-3 text-right font-semibold text-neutral-500 cursor-pointer hover:text-primary"
                  onClick={() => toggleSort('ganancia')}>
                  <span className="flex items-center justify-end gap-1">
                    Ganancia <SortIcon col="ganancia" />
                  </span>
                </th>
                <th className="px-4 py-3 text-right font-semibold text-neutral-500 cursor-pointer hover:text-primary"
                  onClick={() => toggleSort('margenGanancia')}>
                  <span className="flex items-center justify-end gap-1">
                    Margen <SortIcon col="margenGanancia" />
                  </span>
                </th>
                <th className="px-4 py-3 text-right font-semibold text-neutral-500">Stock</th>
                <th className="px-4 py-3 text-right font-semibold text-neutral-500">Prom/día</th>
                <th className="px-4 py-3 text-right font-semibold text-primary cursor-pointer hover:text-primary-600"
                  onClick={() => toggleSort('recomendacionCompra')}>
                  <span className="flex items-center justify-end gap-1">
                    Comprar <SortIcon col="recomendacionCompra" />
                  </span>
                </th>

                <th className="px-4 py-3 text-right font-semibold text-neutral-500">
         Inversión Requerida
</th>

              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {productosFiltrados.map(p => {
                const stockBajo = p.stockActual <= p.recomendacionCompra * 0.3
                return (
                  <tr key={p.productoId} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-neutral-800">{p.nombre}</td>
                    <td className="px-4 py-3 text-neutral-400">{p.categoria}</td>
                    <td className="px-4 py-3 text-right font-bold text-neutral-800">{p.unidadesVendidas}</td>
                    <td className="px-4 py-3 text-right text-neutral-600">{formatCurrency(p.totalIngresos)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-success-700">{formatCurrency(p.ganancia)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full font-semibold
                        ${p.margenGanancia >= 30 ? 'bg-success-50 text-success-700'
                        : p.margenGanancia >= 10 ? 'bg-warning-50 text-warning-700'
                        : 'bg-danger-50 text-danger'}`}>
                        {p.margenGanancia}%
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold
                      ${stockBajo ? 'text-danger' : 'text-neutral-600'}`}>
                      {p.stockActual}
                      {stockBajo && ' ⚠'}
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-400">{p.promedioVentasDiarias}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-lg">
                        {p.recomendacionCompra} u.
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-600 font-medium">
  {formatCurrency(p.costoTotalRecomendado)}
</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer con explicación */}
      <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50">
        <p className="text-xs text-neutral-400">
          💡 La recomendación de compra se calcula como el promedio diario × días del período + 10% de margen de seguridad.
        </p>
      </div>
    </div>
  )
}
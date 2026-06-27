import React, { useState, useEffect } from 'react'
import {
  X, TrendingUp, TrendingDown, Package, Clock,
  DollarSign, ShoppingCart, BarChart2, AlertTriangle,
  Calendar
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import apiClient, { handleResponse } from '@/apis/client'
import { formatCurrency } from '@/utils/formatters'

import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js'
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)

// ── Tipos ──────────────────────────────────────────────────────────────────

interface FranjaHoraria {
  horaInicio: number   // 0–23
  horaFin: number      // horaInicio + 1
  cantidadVentas: number
  porcentaje: number
}

interface DiaSemana {
  dia: string          // "Lunes", "Martes", …
  cantidadVentas: number
  porcentaje: number
}

export interface ProductoDetalleData {
  productoId: number
  nombre: string
  categoria: string
  // métricas (ya vienen del listado, se pasan como prop para mostrar al instante)
  unidadesVendidas: number
  totalIngresos: number
  totalCosto: number
  ganancia: number
  margenGanancia: number
  stockActual: number
  promedioVentasDiarias: number
  recomendacionCompra: number
  costoTotalRecomendado: number
  diasStockRestante: number
  ultimaVenta?: string
   cantidadQuiebresStock?: number
  fechasQuiebresStock?: string[] 
  // extras del endpoint de detalle
  franjasHorarias?: FranjaHoraria[]   // top N franjas ordenadas por volumen
  distribucionHoraria?: number[]      // array[24] con cantidad por hora
  diasSemana?: DiaSemana[]
  ticketPromedio?: number
  productosMasVendidosJunto?: { nombre: string; veces: number }[]
}

interface Props {
  producto: ProductoDetalleData | null
  diasAnalizados: number
  onClose: () => void
}

// ── Helpers ────────────────────────────────────────────────────────────────

const fmt24 = (h: number) => `${String(h).padStart(2, '0')}:00`

const margenColor = (m: number) =>
  m >= 30 ? 'text-emerald-600 bg-emerald-50'
  : m >= 10 ? 'text-amber-600 bg-amber-50'
  : 'text-red-600 bg-red-50'

const diasColor = (d: number) =>
  d <= 3  ? 'text-red-600 bg-red-50'
  : d <= 7  ? 'text-amber-600 bg-amber-50'
  : d <= 14 ? 'text-blue-600 bg-blue-50'
  : 'text-emerald-600 bg-emerald-50'

const rangoHora = (h: number) => `${fmt24(h)} – ${fmt24(h + 1)}`

// Colores para las 3 franjas top
const FRANJA_COLORS = [
  { bar: 'bg-primary', text: 'text-primary', badge: 'bg-primary/10 text-primary' },
  { bar: 'bg-primary/60', text: 'text-primary/80', badge: 'bg-primary/8 text-primary/80' },
  { bar: 'bg-primary/35', text: 'text-primary/60', badge: 'bg-primary/5 text-primary/60' },
]

// ── Subcomponentes ─────────────────────────────────────────────────────────

const MetricCard: React.FC<{
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  accent?: string
}> = ({ icon, label, value, sub, accent = 'text-neutral-900' }) => (
  <div className="bg-neutral-50 rounded-xl p-4 flex flex-col gap-1">
    <div className="flex items-center gap-1.5 text-neutral-400 mb-0.5">
      {icon}
      <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
    </div>
    <p className={`text-xl font-bold ${accent}`}>{value}</p>
    {sub && <p className="text-xs text-neutral-400">{sub}</p>}
  </div>
)

const DistribucionHorariaBar: React.FC<{ data: number[] }> = ({ data }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const chartRef  = React.useRef<Chart | null>(null)

  React.useEffect(() => {
    if (!canvasRef.current) return

    // destruir cualquier instancia previa en el canvas (necesario en StrictMode)
    const existing = Chart.getChart(canvasRef.current)
    if (existing) existing.destroy()
    chartRef.current = null

    const labels = Array.from({ length: 24 }, (_, i) =>
      i.toString().padStart(2, '0') + ':00'
    )
    const max = Math.max(...data, 1)
    const colors = data.map(v =>
      v === max        ? '#2a78d6'
      : v >= max * 0.6 ? '#85B7EB'
      : '#e1e0d9'
    )

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ data, backgroundColor: colors, borderRadius: 4, borderSkipped: 'bottom' }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items: { label: string }[]) => {
                const h = parseInt(items[0].label)
                return `${items[0].label} – ${String(h + 1).padStart(2, '0')}:00`
              },
              label: (item: { raw: unknown }) => `${item.raw} unidades`
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#898781',
              font: { size: 11 },
              maxRotation: 0,
              callback: function(_val: unknown, i: number) {
                return i % 6 === 0 ? labels[i] : ''
              }
            },
            grid: { display: false },
            border: { color: '#c3c2b7' }
          },
          y: {
            ticks: { color: '#898781', font: { size: 11 } },
            grid: { color: '#e1e0d9' },
            border: { display: false },
            beginAtZero: true
          }
        }
      }
    })

    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [data])

  return (
    <div>
      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
        Distribución por hora del día
      </p>
      <div style={{ position: 'relative', height: 160 }}>
        <canvas ref={canvasRef} role="img" aria-label="Distribución de ventas por hora del día" />
      </div>
    </div>
  )
}
// ── Skeleton loading ───────────────────────────────────────────────────────

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-neutral-200 rounded animate-pulse ${className}`} />
)

// ── Modal principal ────────────────────────────────────────────────────────

export const ProductoDetalleModal: React.FC<Props> = ({ producto, diasAnalizados, onClose }) => {
  const { user } = useAuth()
  const [detalle, setDetalle] = useState<Partial<ProductoDetalleData> | null>(null)
  const [loadingDetalle, setLoadingDetalle] = useState(false)

  // Fetch del detalle con franjas horarias
 useEffect(() => {
  if (!producto || !user?.kioscoId) return

  setDetalle(null)
  setLoadingDetalle(true)

  const hasta = new Date()
  const desde = new Date()
  desde.setDate(desde.getDate() - diasAnalizados)

  apiClient
    .post(
      `/Dashboard/kiosco/${user.kioscoId}/analisis-productos/${producto.productoId}/detalle`,
      {
        fechaDesde: desde.toISOString(),
        fechaHasta: hasta.toISOString(),
      }
    )
    .then(res => setDetalle(handleResponse(res)))
    .catch(() => setDetalle({}))
    .finally(() => setLoadingDetalle(false))
}, [producto?.productoId, diasAnalizados, user?.kioscoId])

 useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }

  window.addEventListener('keydown', handler)

  return () => window.removeEventListener('keydown', handler)
}, [onClose])

// Recién ahora
if (!producto) return null

// Merge
const d: ProductoDetalleData = { ...producto, ...detalle }

const top3 = (d.franjasHorarias ?? []).slice(0, 3)
const maxFranja = top3[0]?.cantidadVentas ?? 1

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-neutral-100 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-0.5">
              {d.categoria}
            </p>
            <h2 className="text-lg font-bold text-neutral-900">{d.nombre}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 transition-colors p-1 rounded-lg hover:bg-neutral-100 mt-0.5"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">

          {/* ── Métricas clave ────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard
              icon={<ShoppingCart size={13} />}
              label="Vendido"
              value={`${d.unidadesVendidas}u`}
              sub={`en ${diasAnalizados} días`}
            />
            <MetricCard
              icon={<DollarSign size={13} />}
              label="Ingresos"
              value={formatCurrency(d.totalIngresos)}
              accent="text-primary"
            />
            <MetricCard
              icon={<TrendingUp size={13} />}
              label="Ganancia"
              value={formatCurrency(d.ganancia)}
              accent="text-emerald-600"
            />
            <div className="bg-neutral-50 rounded-xl p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-neutral-400 mb-0.5">
                <BarChart2 size={13} />
                <span className="text-xs font-medium uppercase tracking-wide">Margen</span>
              </div>
              <span className={`text-xl font-bold inline-block px-2 py-0.5 rounded-lg w-fit ${margenColor(d.margenGanancia)}`}>
                {d.margenGanancia}%
              </span>
            </div>
          </div>

          {/* ── Stock ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <MetricCard
              icon={<Package size={13} />}
              label="Stock actual"
              value={`${d.stockActual}u`}
            />
            <div className="bg-neutral-50 rounded-xl p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-neutral-400 mb-0.5">
                <Clock size={13} />
                <span className="text-xs font-medium uppercase tracking-wide">Días de stock</span>
              </div>
              <span className={`text-xl font-bold inline-block px-2 py-0.5 rounded-lg w-fit ${diasColor(d.diasStockRestante)}`}>
                {d.diasStockRestante >= 999 ? '∞' : `${d.diasStockRestante}d`}
              </span>
              <p className="text-xs text-neutral-400">
                {d.promedioVentasDiarias} u/día promedio
              </p>
            </div>
            <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-primary/70 mb-0.5">
                <ShoppingCart size={13} />
                <span className="text-xs font-medium uppercase tracking-wide">Comprar</span>
              </div>
              <p className="text-xl font-bold text-primary">{d.recomendacionCompra}u</p>
              <p className="text-xs text-primary/60">{formatCurrency(d.costoTotalRecomendado)}</p>
            </div>
          </div>

          {/* ── Última venta ──────────────────────────────────────────── */}
          {d.ultimaVenta && (
            <p className="text-xs text-neutral-400 flex items-center gap-1.5">
              <Calendar size={12} />
              Última venta:{' '}
              <strong className="text-neutral-600">
                {new Date(d.ultimaVenta).toLocaleDateString('es-AR', {
                  day: '2-digit', month: 'long', year: 'numeric',
                })}
              </strong>
            </p>
          )}

          {/* ── Franjas horarias ──────────────────────────────────────── */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide flex items-center gap-1.5">
              <Clock size={13} /> Horarios de mayor venta
            </p>

            {loadingDetalle ? (
              <div className="space-y-2">
                {[0, 1, 2].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : top3.length === 0 ? (
              <div className="bg-neutral-50 rounded-xl p-4 text-center">
                <p className="text-sm text-neutral-400">
                  Sin datos de franjas horarias aún
                </p>
                <p className="text-xs text-neutral-300 mt-1">
                  El endpoint de detalle debe devolver <code>franjasHorarias</code>
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {top3.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 bg-neutral-50 rounded-xl px-4 py-3">
                    {/* Ranking */}
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                      ${i === 0 ? 'bg-amber-100 text-amber-700'
                      : i === 1 ? 'bg-neutral-200 text-neutral-600'
                      : 'bg-orange-100 text-orange-600'}`}>
                      {i + 1}
                    </span>
                    {/* Rango */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-semibold text-neutral-700">{rangoHora(f.horaInicio)}</p>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-neutral-400">{f.cantidadVentas}u</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${FRANJA_COLORS[i].badge}`}>
                            {f.porcentaje}%
                          </span>
                        </div>
                      </div>
                      {/* Barra */}
                      <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${FRANJA_COLORS[i].bar}`}
                          style={{ width: `${(f.cantidadVentas / maxFranja) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Distribución horaria completa (si el backend la devuelve) ─ */}
          {!loadingDetalle && d.distribucionHoraria && d.distribucionHoraria.length === 24 && (
            <div className="bg-neutral-50 rounded-xl px-4 py-4">
              <DistribucionHorariaBar data={d.distribucionHoraria} />
            </div>
          )}

          {/* ── Días de la semana ────────────────────────────────────── */}
          {!loadingDetalle && d.diasSemana && d.diasSemana.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                Ventas por día de semana
              </p>
              <div className="grid grid-cols-7 gap-1">
                {d.diasSemana.map((dia, i) => {
                  const max = Math.max(...d.diasSemana!.map(x => x.cantidadVentas), 1)
                  const pct = (dia.cantidadVentas / max) * 100
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="w-full bg-neutral-100 rounded-md overflow-hidden" style={{ height: 48 }}>
                        <div
                          className="w-full bg-primary/40 rounded-md transition-all"
                          style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-neutral-500 font-medium">
                        {dia.dia.slice(0, 2)}
                      </p>
                      <p className="text-[10px] text-neutral-400">{dia.cantidadVentas}u</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>

        {/* ── Quiebres de stock ────────────────────────────────────── */}
{!loadingDetalle && (
  <div className="space-y-3">
    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide flex items-center gap-1.5">
      <AlertTriangle size={13} className="text-amber-500" />
      Quiebres de stock en el período
    </p>
 
    {(d.cantidadQuiebresStock ?? 0) === 0 ? (
      <div className="flex items-center gap-3 bg-emerald-50 rounded-xl px-4 py-3">
        <span className="text-emerald-600 text-lg">✓</span>
        <p className="text-sm text-emerald-700 font-medium">
          Sin quiebres de stock en este período
        </p>
      </div>
    ) : (
      <div className="space-y-2">
        {/* Contador destacado */}
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-amber-700">{d.cantidadQuiebresStock}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {d.cantidadQuiebresStock === 1
                ? '1 vez sin stock'
                : `${d.cantidadQuiebresStock} veces sin stock`}
            </p>
            <p className="text-xs text-amber-600">
              en los últimos {diasAnalizados} días
            </p>
          </div>
        </div>
 
        {/* Listado de fechas */}
        {d.fechasQuiebresStock && d.fechasQuiebresStock.length > 0 && (
          <div className="bg-neutral-50 rounded-xl px-4 py-3 space-y-1.5 max-h-36 overflow-y-auto">
            {d.fechasQuiebresStock.map((fecha, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <span className="text-neutral-600">
                  {new Date(fecha).toLocaleDateString('es-AR', {
                    weekday: 'short',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    )}
  </div>
)}
 

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div className="px-6 py-3 border-t border-neutral-100 bg-neutral-50 rounded-b-2xl">
          <p className="text-xs text-neutral-400">
            💡 Los horarios muestran cuándo se vendió este producto en el período analizado.
          </p>
        </div>
      </div>
    </div>
  )
}
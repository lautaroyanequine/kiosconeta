// ════════════════════════════════════════════════════════════════════════════
// PAGE: Dashboard — Métricas del negocio con selector de período flexible
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo } from 'react'
import {
  TrendingUp, DollarSign, ShoppingCart,
  Package, Clock, Wallet, RefreshCw,
  BarChart2, ArrowUp, ArrowDown, Calendar
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import apiClient, { handleResponse } from '@/apis/client'
import { formatCurrency } from '@/utils/formatters'
import { ResumenMensual } from './ResumenMensual'
import { AnalisisProductosCompleto } from './AnalisisProductosCompleto'

// ────────────────────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────────────────────

const toInputDate = (d: Date) => d.toISOString().split('T')[0]

const periodoPresets = [
  {
    id: 'hoy', label: 'Hoy',
    desde: () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d },
    hasta: () => new Date(),
  },
  {
    id: '7d', label: '7 días',
    desde: () => { const d = new Date(); d.setDate(d.getDate() - 7); return d },
    hasta: () => new Date(),
  },
  {
    id: 'mes', label: 'Este mes',
    desde: () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1) },
    hasta: () => new Date(),
  },
  {
    id: 'mes_ant', label: 'Mes anterior',
    desde: () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth() - 1, 1) },
    hasta: () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 0, 23, 59, 59) },
  },
  { id: 'custom', label: 'Personalizado', desde: () => new Date(), hasta: () => new Date() },
]

// ────────────────────────────────────────────────────────────────────────────
// TIPOS
// ────────────────────────────────────────────────────────────────────────────

interface VentaResumen {
  ventaId: number; fecha: string; total: number
  cierreTurnoId: number
  metodoPagoNombre: string; anulada: boolean; empleadoNombre: string
  productos: { productoId: number; productoNombre: string; cantidad: number; precioUnitario: number }[]
}

interface Producto {
  productoId: number; nombre: string; stockActual: number
  stockMinimo: number; precioCosto: number; precioVenta: number; activo: boolean
}

interface CajaResumen {
  saldoActual: number; gananciaTotal: number; cantidadVentas: number; totalVentas: number
}

interface CierreTurno {
  cierreTurnoId: number; fecha: string; fechaFormateada: string
  estadoNombre: string; turnoNombre: string; cantidadVentas: number
  montoReal: number; virtualFinal: number; efectivoInicial: number
  totalVentas: number; diferencia: number
  empleados: { empleadoNombre: string }[]
}

interface MetricasPeriodo {
  totalVendido: number
  cantidadVentas: number
  ticketPromedio: number
  diferenciaCaja: number
  turnosCerrados: number
  totalEfectivo: number  
  totalVirtual: number    
}

// ────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTES
// ────────────────────────────────────────────────────────────────────────────

const Tarjeta: React.FC<{
  label: string; valor: string | number; icono: React.ReactNode
  color: 'primary' | 'success' | 'danger' | 'warning' | 'neutral'
  variacion?: number | null; subValor?: string
}> = ({ label, valor, icono, color, variacion, subValor }) => {
  const bg = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success-50 text-success-700',
    danger: 'bg-danger-50 text-danger',
    warning: 'bg-warning-50 text-warning-700',
    neutral: 'bg-neutral-100 text-neutral-500',
  }[color]
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>{icono}</div>
        {variacion != null && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full
            ${variacion >= 0 ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger'}`}>
            {variacion >= 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
            {Math.abs(variacion).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-neutral-900">{valor}</p>
      <p className="text-xs text-neutral-500 mt-1">{label}</p>
      {subValor && <p className="text-xs text-neutral-400 mt-0.5">{subValor}</p>}
    </div>
  )
}

const TarjetaSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl border border-neutral-200 p-5">
    <div className="w-10 h-10 rounded-xl bg-neutral-100 animate-pulse mb-3" />
    <div className="h-8 bg-neutral-100 rounded animate-pulse w-32 mb-2" />
    <div className="h-3 bg-neutral-100 rounded animate-pulse w-20" />
  </div>
)

const SeccionTitulo: React.FC<{ titulo: string; icono: React.ReactNode }> = ({ titulo, icono }) => (
  <div className="flex items-center gap-2 mb-4">
    <div className="text-neutral-400">{icono}</div>
    <h2 className="text-sm font-bold text-neutral-700 uppercase tracking-wide">{titulo}</h2>
  </div>
)

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

const DashboardPage: React.FC = () => {
  const { user } = useAuth()

  // ── Período ───────────────────────────────────────────────────────────────
  const [presetId, setPresetId]       = useState('mes')
  const [customDesde, setCustomDesde] = useState(toInputDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)))
  const [customHasta, setCustomHasta] = useState(toInputDate(new Date()))
  const [showCustom, setShowCustom]   = useState(false)

  const { desde, hasta } = useMemo(() => {
    if (presetId === 'custom') {
      return {
        desde: new Date(customDesde + 'T00:00:00'),
        hasta: new Date(customHasta + 'T23:59:59'),
      }
    }
    const preset = periodoPresets.find(p => p.id === presetId)!
    return { desde: preset.desde(), hasta: preset.hasta() }
  }, [presetId, customDesde, customHasta])

  // ── Estados ───────────────────────────────────────────────────────────────
  const [ventas, setVentas]                     = useState<VentaResumen[]>([])
  const [productos, setProductos]               = useState<Producto[]>([])
  const [productosSinMov, setProductosSinMov]   = useState<any[]>([])
  const [productosSinStock, setProductosSinStock] = useState<Producto[]>([])
  const [caja, setCaja]                         = useState<CajaResumen | null>(null)
  const [turnos, setTurnos]                     = useState<CierreTurno[]>([])
  const [metricas, setMetricas]                 = useState<MetricasPeriodo | null>(null)
  const [loadingMetricas, setLoadingMetricas]   = useState(false)
  const [loading, setLoading]                   = useState(true)
  const [tabActiva, setTabActiva]               = useState<'metricas' | 'productos'>('metricas')

  // ── Carga inicial (datos estáticos) ───────────────────────────────────────
  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    if (!user?.kioscoId) return
    setLoading(true)
    const id = user.kioscoId
    try {
      const [ventasRes, productosRes, sinMovRes, cajaRes, turnosRes, sinStockRes] = await Promise.allSettled([
        apiClient.post(`/Ventas/kiosco/${id}/buscar`, {}).then(r => handleResponse(r)),
        apiClient.get(`/Productos/kiosco/${id}`).then(r => handleResponse(r)),
        apiClient.get(`/Productos/kiosco/${id}/sin-movimiento?dias=30`).then(r => handleResponse(r)),
        apiClient.get(`/Caja/kiosco/${id}`).then(r => handleResponse(r)),
        apiClient.get(`/CierreTurnos/kiosco/${id}`).then(r => handleResponse(r)),
        apiClient.get(`/Productos/kiosco/${id}/sin-stock`).then(r => handleResponse(r)),
      ])

      const ventasData = ventasRes.status === 'fulfilled' ? ventasRes.value : []
      setVentas(Array.isArray(ventasData) ? ventasData : (ventasData?.data || ventasData?.items || []))

      const productosData = productosRes.status === 'fulfilled' ? productosRes.value : []
      setProductos(Array.isArray(productosData) ? productosData : (productosData?.data || productosData?.items || []))

      setProductosSinMov(sinMovRes.status === 'fulfilled' ? (sinMovRes.value?.productos ?? []) : [])
      setCaja(cajaRes.status === 'fulfilled' ? cajaRes.value : null)
      setTurnos(turnosRes.status === 'fulfilled' && Array.isArray(turnosRes.value) ? turnosRes.value : [])
      setProductosSinStock(sinStockRes.status === 'fulfilled' && Array.isArray(sinStockRes.value) ? sinStockRes.value : [])
    } catch (err) {
      console.error('Error cargando dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  // ── Métricas del período (se recalculan cuando cambia desde/hasta) ────────
  useEffect(() => {
    if (!user?.kioscoId) return
    setLoadingMetricas(true)
    apiClient
      .post(`/Dashboard/kiosco/${user.kioscoId}/metricas-periodo`, {
        fechaDesde: desde.toISOString(),
        fechaHasta: hasta.toISOString(),
      })
      .then(res => setMetricas(handleResponse(res)))
      .catch(err => console.error('Error métricas período:', err))
      .finally(() => setLoadingMetricas(false))
  }, [desde, hasta, user?.kioscoId])

  // ── Ventas filtradas (para análisis de productos y charts) ────────────────
  const ventasFiltradas = useMemo(() => {
    const desdeStr = desde.toISOString().split('T')[0].replace(/-/g, '')
    const hastaStr = hasta.toISOString().split('T')[0].replace(/-/g, '')
    return ventas.filter(v => {
      if (v.anulada) return false
      const fechaVentaStr = v.fecha.split('T')[0].replace(/-/g, '')
      return parseInt(fechaVentaStr) >= parseInt(desdeStr) &&
             parseInt(fechaVentaStr) <= parseInt(hastaStr)
    })
  }, [ventas, desde, hasta])

  // ── Efectivo vs Virtual (desde turnos, solo para el gráfico) ─────────────
  const totalVentasTurnos = useMemo(() =>
    turnos
      .filter(t => { const f = new Date(t.fecha); return f >= desde && f <= hasta })
      .reduce((s, t) => s + (t.montoReal || 0), 0),
    [turnos, desde, hasta]
  )

  

  // ── Stock bajo ────────────────────────────────────────────────────────────
  const stockBajo = useMemo(
    () => productos.filter(p => p.activo && p.stockActual <= p.stockMinimo),
    [productos]
  )

  // ── Turnos de hoy ─────────────────────────────────────────────────────────
  const turnosHoy = useMemo(() => {
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0)
    const vistos = new Set<number>()
    return turnos
      .filter(t => new Date(t.fecha) >= hoy)
      .filter(t => {
        if (vistos.has(t.cierreTurnoId)) return false
        vistos.add(t.cierreTurnoId)
        return true
      })
  }, [turnos])

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-500">Cargando métricas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-neutral-50 overflow-hidden">

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Dashboard</h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex rounded-lg border border-neutral-200 overflow-hidden text-sm">
              {periodoPresets.map(p => (
                <button key={p.id}
                  onClick={() => { setPresetId(p.id); setShowCustom(p.id === 'custom') }}
                  className={`px-3 py-2 font-medium transition-all whitespace-nowrap
                    ${presetId === p.id ? 'bg-primary text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}>
                  {p.label}
                </button>
              ))}
            </div>
            <button onClick={cargarDatos}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200
                         text-sm text-neutral-500 hover:bg-neutral-50 transition-colors">
              <RefreshCw size={14} /> Actualizar
            </button>
          </div>
        </div>

        {showCustom && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-neutral-100">
            <Calendar size={15} className="text-neutral-400 shrink-0" />
            <div className="flex items-center gap-2 flex-wrap">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Desde</label>
                <input type="date" value={customDesde} onChange={e => setCustomDesde(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-neutral-300 text-sm outline-none
                             focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <span className="text-neutral-400 text-sm mt-4">→</span>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Hasta</label>
                <input type="date" value={customHasta} onChange={e => setCustomHasta(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-neutral-300 text-sm outline-none
                             focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── TABS ────────────────────────────────────────────────────────── */}
      <div className="border-b border-neutral-200 bg-white px-6 shrink-0">
        <div className="flex gap-0">
          <button onClick={() => setTabActiva('metricas')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors
              ${tabActiva === 'metricas' ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}>
            <BarChart2 size={15} /> Métricas
          </button>
          <button onClick={() => setTabActiva('productos')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors
              ${tabActiva === 'productos' ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}>
            <Package size={15} /> Análisis de productos
          </button>
        </div>
      </div>

      {/* ── CONTENIDO ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {tabActiva === 'metricas' && (
          <>
            {/* FILA 1 — Total vendido / Cantidad / Ticket promedio */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {loadingMetricas ? (
                <><TarjetaSkeleton /><TarjetaSkeleton /><TarjetaSkeleton /></>
              ) : (
                <>
                  <Tarjeta
                    label="Total vendido"
                    valor={formatCurrency(metricas?.totalVendido ?? 0)}
                    icono={<TrendingUp size={20} />}
                    color="primary"
                  />
                  <Tarjeta
                    label="Cantidad de ventas"
                    valor={metricas?.cantidadVentas ?? 0}
                    icono={<ShoppingCart size={20} />}
                    color="success"
                  />
                  <Tarjeta
                    label="Ticket promedio"
                    valor={formatCurrency(metricas?.ticketPromedio ?? 0)}
                    icono={<DollarSign size={20} />}
                    color="neutral"
                    subValor={`${metricas?.cantidadVentas ?? 0} transacciones`}
                  />
                </>
              )}
            </div>

            {/* FILA 2 — Saldo / Ganancia / Diferencia de caja */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Tarjeta
                label="Saldo en caja"
                valor={formatCurrency(caja?.saldoActual ?? 0)}
                icono={<Wallet size={20} />}
                color={(caja?.saldoActual ?? 0) >= 0 ? 'success' : 'danger'}
              />
              <Tarjeta
                label="Ganancia total"
                valor={formatCurrency(caja?.gananciaTotal ?? 0)}
                icono={<TrendingUp size={20} />}
                color="success"
              />

              {/* Diferencia de caja — color dinámico */}
              <div className="bg-white rounded-xl border border-neutral-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                    ${loadingMetricas || !metricas || metricas.diferenciaCaja === 0
                      ? 'bg-neutral-100 text-neutral-500'
                      : metricas.diferenciaCaja > 0
                      ? 'bg-success-50 text-success-700'
                      : 'bg-danger-50 text-danger'}`}>
                    <BarChart2 size={20} />
                  </div>
                  {!loadingMetricas && metricas && metricas.diferenciaCaja !== 0 && (
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full
                      ${metricas.diferenciaCaja > 0
                        ? 'bg-success-50 text-success-700'
                        : 'bg-danger-50 text-danger'}`}>
                      {metricas.diferenciaCaja > 0 ? 'Sobrante' : 'Faltante'}
                    </span>
                  )}
                </div>
                {loadingMetricas
                  ? <div className="h-8 bg-neutral-100 rounded animate-pulse w-28 mb-2" />
                  : (
                    <p className={`text-2xl font-bold
                      ${!metricas || metricas.diferenciaCaja === 0
                        ? 'text-neutral-900'
                        : metricas.diferenciaCaja > 0
                        ? 'text-success-700'
                        : 'text-danger'}`}>
                      {metricas && metricas.diferenciaCaja > 0 ? '+' : ''}
                      {formatCurrency(metricas?.diferenciaCaja ?? 0)}
                    </p>
                  )}
                <p className="text-xs text-neutral-500 mt-1">Diferencia de caja</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {loadingMetricas
                    ? '...'
                    : (metricas?.turnosCerrados ?? 0) === 0
                    ? 'Sin turnos cerrados en el período'
                    : `${metricas!.turnosCerrados} turno${metricas!.turnosCerrados !== 1 ? 's' : ''} cerrado${metricas!.turnosCerrados !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>

            {/* EFECTIVO VS VIRTUAL + TURNOS HOY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-neutral-200 p-5">
  <SeccionTitulo titulo="Efectivo vs Virtual" icono={<BarChart2 size={16} />} />
  {loadingMetricas ? (
    <div className="space-y-4">
      {[0, 1].map(i => (
        <div key={i}>
          <div className="h-4 bg-neutral-100 rounded animate-pulse w-24 mb-2" />
          <div className="h-2.5 bg-neutral-100 rounded-full animate-pulse" />
        </div>
      ))}
    </div>
  ) : (
    <div className="space-y-4">
      {[
        { label: 'Efectivo', valor: metricas?.totalEfectivo ?? 0, color: 'bg-primary' },
        { label: 'Virtual',  valor: metricas?.totalVirtual ?? 0,  color: 'bg-success' },
      ].map(item => {
        const total = (metricas?.totalEfectivo ?? 0) + (metricas?.totalVirtual ?? 0)
        const pct = total > 0 ? (item.valor / total) * 100 : 0
        return (
          <div key={item.label}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-neutral-600">{item.label}</span>
              <span className="font-semibold">{formatCurrency(item.valor)}</span>
            </div>
            <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
              <div className={`h-full ${item.color} rounded-full transition-all duration-500`}
                style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              {pct.toFixed(1)}% del total
            </p>
          </div>
        )
      })}
    </div>
  )}
</div>

              {/* Turnos de hoy */}
              <div className="bg-white rounded-xl border border-neutral-200 p-5">
                <SeccionTitulo titulo="Turnos de hoy" icono={<Clock size={16} />} />
                {turnosHoy.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-neutral-300">
                    <Clock size={32} className="mb-2 opacity-30" />
                    <p className="text-sm text-neutral-400">No hay turnos hoy</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {turnosHoy.map(t => (
                      <div key={t.cierreTurnoId}
                        className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-neutral-800">{t.turnoNombre || 'Turno'}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                              ${t.estadoNombre === 'Abierto'
                                ? 'bg-success-50 text-success-700'
                                : 'bg-neutral-100 text-neutral-500'}`}>
                              {t.estadoNombre}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            {t.empleados?.map(e => e.empleadoNombre).join(', ')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">{formatCurrency(t.montoReal || 0)}</p>
                          <p className="text-xs text-neutral-400">{t.cantidadVentas} ventas</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RESUMEN MENSUAL */}
            <ResumenMensual />
          </>
        )}

        {tabActiva === 'productos' && (
          <AnalisisProductosCompleto
            ventasFiltradas={ventasFiltradas}
            productos={productos}
            productosSinMov={productosSinMov}
            productosSinStock={productosSinStock}
            stockBajo={stockBajo}
            desde={desde}
            hasta={hasta}
          />
        )}
      </div>
    </div>
  )
}

export default DashboardPage
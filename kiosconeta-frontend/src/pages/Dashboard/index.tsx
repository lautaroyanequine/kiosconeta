// ════════════════════════════════════════════════════════════════════════════
// PAGE: Dashboard — Métricas del negocio con selector de período flexible
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo } from 'react'
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart,
  Package, AlertTriangle, Clock, Wallet, RefreshCw,
  BarChart2, ArrowUp, ArrowDown, Calendar
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import apiClient, { handleResponse } from '@/apis/client'
import { formatCurrency } from '@/utils/formatters'
import { ResumenMensual } from './ResumenMensual'

// ────────────────────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────────────────────

const toInputDate = (d: Date) => d.toISOString().split('T')[0]

const periodoPresets = [
  {
    id: 'hoy', label: 'Hoy',
    desde: () => { const d = new Date(); d.setHours(0,0,0,0); return d },
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
  empleados: { empleadoNombre: string }[]
}

// ────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTES
// ────────────────────────────────────────────────────────────────────────────

const Tarjeta: React.FC<{
  label: string; valor: string | number; icono: React.ReactNode
  color: 'primary' | 'success' | 'danger' | 'warning' | 'neutral'
  variacion?: number | null; subValor?: string
}> = ({ label, valor, icono, color, variacion, subValor }) => {
  const bg = { primary: 'bg-primary/10 text-primary', success: 'bg-success-50 text-success-700',
    danger: 'bg-danger-50 text-danger', warning: 'bg-warning-50 text-warning-700',
    neutral: 'bg-neutral-100 text-neutral-500' }[color]
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>{icono}</div>
        {variacion != null && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full
            ${variacion >= 0 ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger'}`}>
            {variacion >= 0 ? <ArrowUp size={11}/> : <ArrowDown size={11}/>}
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
  const [presetId, setPresetId]         = useState('mes')
  const [customDesde, setCustomDesde]   = useState(toInputDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)))
  const [customHasta, setCustomHasta]   = useState(toInputDate(new Date()))
  const [showCustom, setShowCustom]     = useState(false)

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

  // ── Datos ─────────────────────────────────────────────────────────────────
  const [ventas, setVentas]             = useState<VentaResumen[]>([])
  const [productos, setProductos]       = useState<Producto[]>([])
  const [productosSinMov, setProductosSinMov] = useState<any[]>([])
  const [caja, setCaja]                 = useState<CajaResumen | null>(null)
  const [turnos, setTurnos]             = useState<CierreTurno[]>([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    if (!user?.kioscoId) return
    setLoading(true)
    const id = user.kioscoId
    try {
      const [ventasRes, productosRes, sinMovRes, cajaRes, turnosRes] = await Promise.allSettled([
        apiClient.post(`/Ventas/kiosco/${id}/buscar`, {}).then(r => handleResponse(r)),
        apiClient.get(`/Productos/kiosco/${id}`).then(r => handleResponse(r)),
        apiClient.get(`/Productos/kiosco/${id}/sin-movimiento?dias=30`).then(r => handleResponse(r)),
        apiClient.get(`/Caja/kiosco/${id}`).then(r => handleResponse(r)),
        apiClient.get(`/CierreTurnos/kiosco/${id}`).then(r => handleResponse(r)),
      ])
      setVentas(ventasRes.status === 'fulfilled' && Array.isArray(ventasRes.value) ? ventasRes.value : [])
      setProductos(productosRes.status === 'fulfilled' && Array.isArray(productosRes.value) ? productosRes.value : [])
      setProductosSinMov(sinMovRes.status === 'fulfilled' ? (sinMovRes.value?.productos ?? []) : [])
      setCaja(cajaRes.status === 'fulfilled' ? cajaRes.value : null)
      setTurnos(turnosRes.status === 'fulfilled' && Array.isArray(turnosRes.value) ? turnosRes.value : [])
    } catch (err) {
      console.error('Error cargando dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  // ── Ventas filtradas por período ──────────────────────────────────────────
  const ventasFiltradas = useMemo(
    () => ventas.filter(v => !v.anulada && new Date(v.fecha) >= desde && new Date(v.fecha) <= hasta),
    [ventas, desde, hasta]
  )

  // ── Métricas ──────────────────────────────────────────────────────────────
  const totalVentas = useMemo(() => ventasFiltradas.reduce((s, v) => s + v.total, 0), [ventasFiltradas])

  const totalEfectivo = useMemo(
    () => ventasFiltradas.filter(v => v.metodoPagoNombre?.toLowerCase().includes('efectivo')).reduce((s, v) => s + v.total, 0),
    [ventasFiltradas]
  )
  const totalVirtual = useMemo(() => totalVentas - totalEfectivo, [totalVentas, totalEfectivo])

  // Top productos más vendidos
  const topProductos = useMemo(() => {
    const mapa: Record<number, { nombre: string; cantidad: number; total: number }> = {}
    ventasFiltradas.forEach(v => v.productos?.forEach(p => {
      if (!mapa[p.productoId]) mapa[p.productoId] = { nombre: p.productoNombre, cantidad: 0, total: 0 }
      mapa[p.productoId].cantidad += p.cantidad
      mapa[p.productoId].total += p.precioUnitario * p.cantidad
    }))
    return Object.values(mapa).sort((a, b) => b.cantidad - a.cantidad).slice(0, 8)
  }, [ventasFiltradas])

  const maxCantidad = useMemo(() => topProductos[0]?.cantidad ?? 1, [topProductos])

  // Menor rotación
  const menorRotacion = useMemo(() => {
    const mapa: Record<number, { nombre: string; cantidad: number }> = {}
    ventasFiltradas.forEach(v => v.productos?.forEach(p => {
      if (!mapa[p.productoId]) mapa[p.productoId] = { nombre: p.productoNombre, cantidad: 0 }
      mapa[p.productoId].cantidad += p.cantidad
    }))
    return Object.values(mapa).sort((a, b) => a.cantidad - b.cantidad).slice(0, 5)
  }, [ventasFiltradas])

  // Pares de productos
  const productosPares = useMemo(() => {
    const pares: Record<string, { nombre1: string; nombre2: string; veces: number }> = {}
    ventasFiltradas.forEach(v => {
      const prods = v.productos ?? []
      for (let i = 0; i < prods.length; i++) {
        for (let j = i + 1; j < prods.length; j++) {
          const ids = [prods[i].productoId, prods[j].productoId].sort()
          const key = ids.join('-')
          if (!pares[key]) pares[key] = { nombre1: prods[i].productoNombre, nombre2: prods[j].productoNombre, veces: 0 }
          pares[key].veces++
        }
      }
    })
    return Object.values(pares).sort((a, b) => b.veces - a.veces).slice(0, 5)
  }, [ventasFiltradas])

  // Productos stock bajo
  const stockBajo = useMemo(
    () => productos.filter(p => p.activo && p.stockActual <= p.stockMinimo),
    [productos]
  )

  // Turnos de hoy
  const turnosHoy = useMemo(() => {
    const hoy = new Date(); hoy.setHours(0,0,0,0)
    return turnos.filter(t => new Date(t.fecha) >= hoy)
  }, [turnos])

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
          <p className="text-neutral-500">Cargando métricas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-neutral-50 overflow-hidden">

      {/* HEADER */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Dashboard</h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              {new Date().toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Presets */}
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
              <RefreshCw size={14}/>
              Actualizar
            </button>
          </div>
        </div>

        {/* Selector de rango personalizado */}
        {showCustom && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-neutral-100">
            <Calendar size={15} className="text-neutral-400 shrink-0"/>
            <div className="flex items-center gap-2 flex-wrap">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Desde</label>
                <input type="date" value={customDesde} onChange={e => setCustomDesde(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-neutral-300 text-sm outline-none
                             focus:ring-2 focus:ring-primary/30 focus:border-primary"/>
              </div>
              <span className="text-neutral-400 text-sm mt-4">→</span>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Hasta</label>
                <input type="date" value={customHasta} onChange={e => setCustomHasta(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-neutral-300 text-sm outline-none
                             focus:ring-2 focus:ring-primary/30 focus:border-primary"/>
              </div>
            </div>
            <p className="text-xs text-neutral-400 mt-4 ml-2">
              {ventasFiltradas.length} ventas en el período
            </p>
          </div>
        )}
      </div>

      {/* CONTENIDO */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* MÉTRICAS PRINCIPALES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Tarjeta label="Total vendido" valor={formatCurrency(totalVentas)}
            icono={<TrendingUp size={20}/>} color="primary"/>
          <Tarjeta label="Cantidad de ventas" valor={ventasFiltradas.length}
            icono={<ShoppingCart size={20}/>} color="success"/>
          <Tarjeta label="Saldo en caja" valor={formatCurrency(caja?.saldoActual ?? 0)}
            icono={<Wallet size={20}/>} color={(caja?.saldoActual ?? 0) >= 0 ? 'success' : 'danger'}/>
          <Tarjeta label="Ganancia total" valor={formatCurrency(caja?.gananciaTotal ?? 0)}
            icono={<DollarSign size={20}/>} color="success"/>
        </div>

        {/* EFECTIVO VS VIRTUAL + TURNOS HOY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Efectivo vs Virtual */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <SeccionTitulo titulo="Efectivo vs Virtual" icono={<BarChart2 size={16}/>}/>
            <div className="space-y-4">
              {[
                { label: 'Efectivo', valor: totalEfectivo, color: 'bg-primary' },
                { label: 'Virtual', valor: totalVirtual, color: 'bg-success' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-neutral-600">{item.label}</span>
                    <span className="font-semibold">{formatCurrency(item.valor)}</span>
                  </div>
                  <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: totalVentas > 0 ? `${(item.valor / totalVentas) * 100}%` : '0%' }}/>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    {totalVentas > 0 ? ((item.valor / totalVentas) * 100).toFixed(1) : 0}% del total
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Turnos de hoy */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <SeccionTitulo titulo="Turnos de hoy" icono={<Clock size={16}/>}/>
            {turnosHoy.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-neutral-300">
                <Clock size={32} className="mb-2 opacity-30"/>
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
                          ${t.estadoNombre === 'Abierto' ? 'bg-success-50 text-success-700' : 'bg-neutral-100 text-neutral-500'}`}>
                          {t.estadoNombre}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {t.empleados?.map(e => e.empleadoNombre).join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">
                        {formatCurrency(t.montoReal + t.virtualFinal - t.efectivoInicial)}
                      </p>
                      <p className="text-xs text-neutral-400">{t.cantidadVentas} ventas</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* TOP PRODUCTOS — con barras visuales */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <SeccionTitulo titulo="Productos más vendidos" icono={<TrendingUp size={16}/>}/>
          {topProductos.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-8">Sin ventas en el período seleccionado</p>
          ) : (
            <div className="space-y-3">
              {topProductos.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  {/* Número/medalla */}
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                    ${i === 0 ? 'bg-warning-100 text-warning-700'
                    : i === 1 ? 'bg-neutral-200 text-neutral-600'
                    : i === 2 ? 'bg-orange-100 text-orange-600'
                    : 'bg-neutral-50 text-neutral-400'}`}>
                    {i + 1}
                  </span>
                  {/* Nombre + barra */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-neutral-800 truncate">{p.nombre}</p>
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <span className="text-xs text-neutral-400">{formatCurrency(p.total)}</span>
                        <span className="text-sm font-bold text-primary w-16 text-right">{p.cantidad} u.</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500
                        ${i === 0 ? 'bg-primary' : i === 1 ? 'bg-primary/70' : 'bg-primary/40'}`}
                        style={{ width: `${(p.cantidad / maxCantidad) * 100}%` }}/>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MENOR ROTACIÓN + PARES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <SeccionTitulo titulo="Menor rotación en el período" icono={<TrendingDown size={16}/>}/>
            {menorRotacion.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-6">Sin datos</p>
            ) : (
              <div className="space-y-2">
                {menorRotacion.map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5">
                    <p className="text-sm text-neutral-700 truncate flex-1">{p.nombre}</p>
                    <span className="text-sm font-semibold text-warning-700 shrink-0 ml-2">{p.cantidad} u.</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <SeccionTitulo titulo="Productos que salen juntos" icono={<ShoppingCart size={16}/>}/>
            {productosPares.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-6">No hay ventas con múltiples productos</p>
            ) : (
              <div className="space-y-2">
                {productosPares.map((par, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-neutral-700 truncate">{par.nombre1}</p>
                      <p className="text-xs text-neutral-400 truncate">+ {par.nombre2}</p>
                    </div>
                    <span className="text-xs font-bold text-primary shrink-0 ml-2">{par.veces}x</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SIN MOVIMIENTO + STOCK BAJO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <SeccionTitulo titulo="Sin ventas hace 30+ días" icono={<Package size={16}/>}/>
            {productosSinMov.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-neutral-300">
                <Package size={28} className="mb-2 opacity-30"/>
                <p className="text-sm text-neutral-400">Todos los productos tienen movimiento</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {productosSinMov.slice(0, 8).map((p: any) => (
                  <div key={p.productoId} className="flex items-center justify-between py-1.5">
                    <p className="text-sm text-neutral-700 truncate flex-1">{p.nombre}</p>
                    <span className="text-xs text-neutral-400 shrink-0 ml-2">Stock: {p.stockActual}</span>
                  </div>
                ))}
                {productosSinMov.length > 8 && (
                  <p className="text-xs text-neutral-400 text-center">+{productosSinMov.length - 8} más</p>
                )}
              </div>
            )}
          </div>

          {stockBajo.length > 0 && (
            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <SeccionTitulo titulo="Alertas de stock bajo" icono={<AlertTriangle size={16}/>}/>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {stockBajo.slice(0, 8).map(p => (
                  <div key={p.productoId}
                    className="flex items-center justify-between p-2.5 bg-danger-50 rounded-xl border border-danger-100">
                    <p className="text-xs font-medium text-danger truncate flex-1">{p.nombre}</p>
                    <span className="text-xs font-bold text-danger ml-2 shrink-0">
                      {p.stockActual} / {p.stockMinimo}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RESUMEN MENSUAL */}
        <ResumenMensual />

      </div>
    </div>
  )
}

export default DashboardPage
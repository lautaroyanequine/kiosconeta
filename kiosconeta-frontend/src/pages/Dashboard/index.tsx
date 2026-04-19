// ════════════════════════════════════════════════════════════════════════════
// PAGE: Dashboard
// Centro de métricas del negocio para el administrador.
// Período por defecto: este mes. Calculado desde endpoints existentes.
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo } from 'react'
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart,
  Package, AlertTriangle, Clock, Wallet, RefreshCw,
  BarChart2, ArrowUp, ArrowDown, Calendar, Users
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import apiClient, { handleResponse, handleError } from '@/apis/client'
import { formatCurrency } from '@/utils/formatters'

// ────────────────────────────────────────────────────────────────────────────
// TIPOS
// ────────────────────────────────────────────────────────────────────────────

interface VentaResumen {
  ventaId: number
  fecha: string
  total: number
  metodoPagoNombre: string
  anulada: boolean
  empleadoNombre: string
  productos: { productoId: number; productoNombre: string; cantidad: number; precioUnitario: number }[]
}

interface Producto {
  productoId: number
  nombre: string
  stockActual: number
  stockMinimo: number
  precioCosto: number
  precioVenta: number
  activo: boolean
  fechaVencimiento?: string
}

interface CajaResumen {
  saldoActual: number
  saldoInicial: number
  totalVentas: number
  totalGastos: number
  gananciaTotal: number
  cantidadVentas: number
}

interface CierreTurno {
  cierreTurnoId: number
  fecha: string
  fechaFormateada: string
  fechaCierre?: string
  fechaCierreFormateada?: string
  estadoNombre: string
  turnoNombre: string
  cantidadVentas: number
  totalVentas: number
  montoReal: number
  virtualFinal: number
  efectivoInicial: number
  gananciaTotal: number
  empleados: { empleadoNombre: string }[]
}

// ────────────────────────────────────────────────────────────────────────────
// HELPERS DE FECHA
// ────────────────────────────────────────────────────────────────────────────

const getInicioMes = () => {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

const getInicioMesAnterior = () => {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth() - 1, 1)
}

const getFinMesAnterior = () => {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 0, 23, 59, 59)
}

const getHoy = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

// ────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTES
// ────────────────────────────────────────────────────────────────────────────

const TarjetaMetrica: React.FC<{
  label: string
  valor: string | number
  icono: React.ReactNode
  color: 'primary' | 'success' | 'danger' | 'warning' | 'neutral'
  variacion?: number   // % vs período anterior
  subValor?: string
}> = ({ label, valor, icono, color, variacion, subValor }) => {
  const bg = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success-50 text-success-700',
    danger:  'bg-danger-50 text-danger',
    warning: 'bg-warning-50 text-warning-700',
    neutral: 'bg-neutral-100 text-neutral-500',
  }[color]

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
          {icono}
        </div>
        {variacion !== undefined && (
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

const SeccionTitulo: React.FC<{ titulo: string; icono: React.ReactNode }> = ({ titulo, icono }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="text-neutral-400">{icono}</div>
    <h2 className="text-sm font-bold text-neutral-700 uppercase tracking-wide">{titulo}</h2>
  </div>
)

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

const DashboardPage: React.FC = () => {
  const { user } = useAuth()

  // ── Estado ────────────────────────────────────────────────────────────────
  const [ventas, setVentas]               = useState<VentaResumen[]>([])
  const [ventasMesAnterior, setVentasMesAnterior] = useState<VentaResumen[]>([])
  const [productos, setProductos]         = useState<Producto[]>([])
  const [productosSinMov, setProductosSinMov] = useState<any[]>([])
  const [caja, setCaja]                   = useState<CajaResumen | null>(null)
  const [turnos, setTurnos]               = useState<CierreTurno[]>([])
  const [loading, setLoading]             = useState(true)
  const [periodo, setPeriodo]             = useState<'hoy' | 'semana' | 'mes'>('mes')

  // ── Cargar datos ──────────────────────────────────────────────────────────
  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    if (!user?.kioscoId) return
    setLoading(true)
    try {
      const kioscoId = user.kioscoId

      // Ventas del mes actual
      const inicioMes = getInicioMes()
      const ventasRes = await apiClient.get(`/Ventas/kiosco/${kioscoId}/buscar`, {
        params: { fechaDesde: inicioMes.toISOString(), fechaHasta: new Date().toISOString() }
      }).then(r => handleResponse(r)).catch(() => [])

      // Ventas mes anterior (para comparativa)
      const ventasAntRes = await apiClient.post(`/Ventas/kiosco/${kioscoId}/buscar`, {
        fechaDesde: getInicioMesAnterior().toISOString(),
        fechaHasta: getFinMesAnterior().toISOString()
      }).then(r => handleResponse(r)).catch(() => [])

      // Productos del kiosco
      const productosRes = await apiClient.get(`/Productos/kiosco/${kioscoId}`)
        .then(r => handleResponse(r)).catch(() => [])

      // Productos sin movimiento (30 días)
      const sinMovRes = await apiClient.get(`/Productos/kiosco/${kioscoId}/sin-movimiento?dias=30`)
        .then(r => handleResponse(r)).catch(() => ({ productos: [] }))

      // Caja
      const cajaRes = await apiClient.get(`/Caja/kiosco/${kioscoId}`)
        .then(r => handleResponse(r)).catch(() => null)

      // Turnos del mes
      const turnosRes = await apiClient.get(`/CierreTurnos/kiosco/${kioscoId}`)
        .then(r => handleResponse(r)).catch(() => [])

      setVentas(Array.isArray(ventasRes) ? ventasRes : [])
      setVentasMesAnterior(Array.isArray(ventasAntRes) ? ventasAntRes : [])
      setProductos(Array.isArray(productosRes) ? productosRes : [])
      setProductosSinMov(sinMovRes?.productos ?? [])
      setCaja(cajaRes)
      setTurnos(Array.isArray(turnosRes) ? turnosRes : [])
    } catch (err) {
      console.error('Error cargando dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  // ── Filtrar ventas por período ─────────────────────────────────────────────
  const ventasFiltradas = useMemo(() => {
    const ahora = new Date()
    let desde: Date

    if (periodo === 'hoy') desde = getHoy()
    else if (periodo === 'semana') {
      desde = new Date()
      desde.setDate(desde.getDate() - 7)
    } else desde = getInicioMes()

    return ventas.filter(v => !v.anulada && new Date(v.fecha) >= desde)
  }, [ventas, periodo])

  // ── Métricas calculadas ───────────────────────────────────────────────────

  const totalVentas = useMemo(
    () => ventasFiltradas.reduce((sum, v) => sum + v.total, 0),
    [ventasFiltradas]
  )

  const totalVentasMesAnterior = useMemo(
    () => ventasMesAnterior.filter(v => !v.anulada).reduce((sum, v) => sum + v.total, 0),
    [ventasMesAnterior]
  )

  const variacionVentas = useMemo(() => {
    if (totalVentasMesAnterior === 0) return null
    return ((totalVentas - totalVentasMesAnterior) / totalVentasMesAnterior) * 100
  }, [totalVentas, totalVentasMesAnterior])

  // Efectivo vs Virtual
  const totalEfectivo = useMemo(
    () => ventasFiltradas
      .filter(v => v.metodoPagoNombre?.toLowerCase().includes('efectivo'))
      .reduce((sum, v) => sum + v.total, 0),
    [ventasFiltradas]
  )
  const totalVirtual = useMemo(() => totalVentas - totalEfectivo, [totalVentas, totalEfectivo])

  // Top productos más vendidos
  const topProductos = useMemo(() => {
    const mapa: Record<number, { nombre: string; cantidad: number; total: number }> = {}
    ventasFiltradas.forEach(v => {
      v.productos?.forEach(p => {
        if (!mapa[p.productoId]) mapa[p.productoId] = { nombre: p.productoNombre, cantidad: 0, total: 0 }
        mapa[p.productoId].cantidad += p.cantidad
        mapa[p.productoId].total += p.precioUnitario * p.cantidad
      })
    })
    return Object.values(mapa).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5)
  }, [ventasFiltradas])

  // Productos con menor rotación (se vendieron pero poco)
  const productosMenorRotacion = useMemo(() => {
    const mapa: Record<number, { nombre: string; cantidad: number }> = {}
    ventasFiltradas.forEach(v => {
      v.productos?.forEach(p => {
        if (!mapa[p.productoId]) mapa[p.productoId] = { nombre: p.productoNombre, cantidad: 0 }
        mapa[p.productoId].cantidad += p.cantidad
      })
    })
    return Object.values(mapa).sort((a, b) => a.cantidad - b.cantidad).slice(0, 5)
  }, [ventasFiltradas])

  // Productos que salen juntos (pares más frecuentes en la misma venta)
  const productosPares = useMemo(() => {
    const pares: Record<string, { nombre1: string; nombre2: string; veces: number }> = {}
    ventasFiltradas.forEach(v => {
      const prods = v.productos ?? []
      for (let i = 0; i < prods.length; i++) {
        for (let j = i + 1; j < prods.length; j++) {
          const ids = [prods[i].productoId, prods[j].productoId].sort()
          const key = ids.join('-')
          if (!pares[key]) pares[key] = {
            nombre1: prods[i].productoNombre,
            nombre2: prods[j].productoNombre,
            veces: 0
          }
          pares[key].veces++
        }
      }
    })
    return Object.values(pares).sort((a, b) => b.veces - a.veces).slice(0, 5)
  }, [ventasFiltradas])

  // Productos bajo stock
  const productosStockBajo = useMemo(
    () => productos.filter(p => p.activo && p.stockActual <= p.stockMinimo),
    [productos]
  )

  // Turnos de hoy
  const turnosHoy = useMemo(() => {
    const hoy = getHoy()
    return turnos.filter(t => new Date(t.fecha) >= hoy)
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Dashboard</h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Selector de período */}
            <div className="flex rounded-lg border border-neutral-200 overflow-hidden text-sm">
              {(['hoy', 'semana', 'mes'] as const).map(p => (
                <button key={p} onClick={() => setPeriodo(p)}
                  className={`px-4 py-2 font-medium transition-all
                    ${periodo === p ? 'bg-primary text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}>
                  {p === 'hoy' ? 'Hoy' : p === 'semana' ? '7 días' : 'Este mes'}
                </button>
              ))}
            </div>
            <button onClick={cargarDatos}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200
                         text-sm text-neutral-500 hover:bg-neutral-50 transition-colors">
              <RefreshCw size={14} />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* ── CONTENIDO ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* ── MÉTRICAS PRINCIPALES ───────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <TarjetaMetrica
            label="Total vendido"
            valor={formatCurrency(totalVentas)}
            icono={<TrendingUp size={20} />}
            color="primary"
            variacion={periodo === 'mes' ? variacionVentas ?? undefined : undefined}
            subValor={periodo === 'mes' && totalVentasMesAnterior > 0
              ? `Mes anterior: ${formatCurrency(totalVentasMesAnterior)}`
              : undefined}
          />
          <TarjetaMetrica
            label="Cantidad de ventas"
            valor={ventasFiltradas.length}
            icono={<ShoppingCart size={20} />}
            color="success"
          />
          <TarjetaMetrica
            label="Saldo en caja"
            valor={formatCurrency(caja?.saldoActual ?? 0)}
            icono={<Wallet size={20} />}
            color={(caja?.saldoActual ?? 0) >= 0 ? 'success' : 'danger'}
          />
          <TarjetaMetrica
            label="Ganancia total"
            valor={formatCurrency(caja?.gananciaTotal ?? 0)}
            icono={<DollarSign size={20} />}
            color="success"
          />
        </div>

        {/* ── EFECTIVO VS VIRTUAL + TURNOS HOY ──────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Efectivo vs Virtual */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <SeccionTitulo titulo="Efectivo vs Virtual" icono={<BarChart2 size={16} />} />
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-neutral-600">Efectivo</span>
                  <span className="font-semibold">{formatCurrency(totalEfectivo)}</span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: totalVentas > 0 ? `${(totalEfectivo / totalVentas) * 100}%` : '0%' }}
                  />
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {totalVentas > 0 ? ((totalEfectivo / totalVentas) * 100).toFixed(1) : 0}% del total
                </p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-neutral-600">Virtual</span>
                  <span className="font-semibold">{formatCurrency(totalVirtual)}</span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success rounded-full transition-all"
                    style={{ width: totalVentas > 0 ? `${(totalVirtual / totalVentas) * 100}%` : '0%' }}
                  />
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {totalVentas > 0 ? ((totalVirtual / totalVentas) * 100).toFixed(1) : 0}% del total
                </p>
              </div>
            </div>
          </div>

          {/* Turnos de hoy */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <SeccionTitulo titulo="Turnos de hoy" icono={<Clock size={16} />} />
            {turnosHoy.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-neutral-300">
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
                      <p className="text-sm font-bold text-primary">{formatCurrency(t.montoReal + t.virtualFinal - t.efectivoInicial)}</p>
                      <p className="text-xs text-neutral-400">{t.cantidadVentas} ventas</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── TOP PRODUCTOS + MENOR ROTACIÓN ────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Top más vendidos */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <SeccionTitulo titulo="Top productos más vendidos" icono={<TrendingUp size={16} />} />
            {topProductos.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-6">Sin datos en el período</p>
            ) : (
              <div className="space-y-2">
                {topProductos.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                      ${i === 0 ? 'bg-warning-100 text-warning-700'
                      : i === 1 ? 'bg-neutral-100 text-neutral-600'
                      : 'bg-neutral-50 text-neutral-400'}`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-800 truncate">{p.nombre}</p>
                      <p className="text-xs text-neutral-400">{formatCurrency(p.total)}</p>
                    </div>
                    <span className="text-sm font-bold text-primary shrink-0">{p.cantidad} u.</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Menor rotación */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <SeccionTitulo titulo="Menor rotación en el período" icono={<TrendingDown size={16} />} />
            {productosMenorRotacion.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-6">Sin datos en el período</p>
            ) : (
              <div className="space-y-2">
                {productosMenorRotacion.map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <p className="text-sm text-neutral-700 truncate flex-1">{p.nombre}</p>
                    <span className="text-sm font-semibold text-warning-700 shrink-0 ml-2">{p.cantidad} u.</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── PRODUCTOS QUE SALEN JUNTOS + SIN MOVIMIENTO ───────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Pares de productos */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <SeccionTitulo titulo="Productos que salen juntos" icono={<ShoppingCart size={16} />} />
            {productosPares.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-6">No hay ventas con múltiples productos</p>
            ) : (
              <div className="space-y-2">
                {productosPares.map((par, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-neutral-700 truncate">{par.nombre1}</p>
                      <p className="text-xs text-neutral-400">+ {par.nombre2}</p>
                    </div>
                    <span className="text-xs font-bold text-primary shrink-0 ml-2">{par.veces}x juntos</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sin movimiento 30 días */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <SeccionTitulo titulo="Sin ventas hace 30+ días" icono={<Package size={16} />} />
            {productosSinMov.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-neutral-300">
                <Package size={28} className="mb-2 opacity-30" />
                <p className="text-sm text-neutral-400">Todos los productos tienen movimiento</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {productosSinMov.slice(0, 8).map((p: any) => (
                  <div key={p.productoId} className="flex items-center justify-between">
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
        </div>

        {/* ── ALERTAS ───────────────────────────────────────────────── */}
        {(productosStockBajo.length > 0) && (
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <SeccionTitulo titulo="Alertas de stock" icono={<AlertTriangle size={16} />} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {productosStockBajo.slice(0, 8).map(p => (
                <div key={p.productoId}
                  className="flex items-center justify-between p-2.5 bg-danger-50 rounded-xl border border-danger-100">
                  <p className="text-xs font-medium text-danger truncate flex-1">{p.nombre}</p>
                  <span className="text-xs font-bold text-danger ml-2 shrink-0">{p.stockActual}</span>
                </div>
              ))}
            </div>
            {productosStockBajo.length > 8 && (
              <p className="text-xs text-neutral-400 mt-2">+{productosStockBajo.length - 8} productos más con stock bajo</p>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default DashboardPage
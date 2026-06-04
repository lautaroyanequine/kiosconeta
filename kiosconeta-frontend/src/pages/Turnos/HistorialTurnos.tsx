// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: HistorialTurnos
// Lista de turnos cerrados con filtros y detalle expandible.
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo } from 'react'
import { Clock, ChevronDown, ChevronUp, Users, Search } from 'lucide-react'
import { turnosApi } from '@/apis/turnosApi'
import { useEmpleadoActivo } from '@/contexts/EmpleadoActivoContext'
import { formatCurrency } from '@/utils/formatters'
import type { CierreTurnoResponse } from '@/types/gastoTurno'

export const HistorialTurnos: React.FC = () => {
  const { empleadoActivo: user } = useEmpleadoActivo()
  const { empleadoActivo } = useEmpleadoActivo()

  const [turnos, setTurnos]       = useState<CierreTurnoResponse[]>([])
  const [loading, setLoading]     = useState(true)
  const [expandido, setExpandido] = useState<number | null>(null)

  // ── Filtros ───────────────────────────────────────────────────────────────
  const [filtroBusqueda, setFiltroBusqueda]   = useState('')
  const [filtroTurno, setFiltroTurno]         = useState('')
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('')
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('')

  useEffect(() => { cargarHistorial() }, [])

  const cargarHistorial = async () => {
    if (!user?.kioscoId) return
    setLoading(true)
    try {
      const data = await turnosApi.getByKiosco(empleadoActivo?.kioscoId ?? user?.kioscoId)
      setTurnos(data)
    } catch (err) {
      console.error('Error cargando historial:', err)
    } finally {
      setLoading(false)
    }
  }

  const turnosDisponibles = useMemo(() => {
    const nombres = [...new Set(turnos.map(t => t.turnoNombre).filter(Boolean))]
    return nombres
  }, [turnos])

  const turnosFiltrados = useMemo(() => {
    return turnos.filter(t => {
      if (filtroBusqueda.trim()) {
        const busq = filtroBusqueda.toLowerCase()
        const tieneEmpleado = t.empleados?.some(e =>
          e.empleadoNombre.toLowerCase().includes(busq)
        )
        if (!tieneEmpleado) return false
      }

      if (filtroTurno && t.turnoNombre !== filtroTurno) return false

      if (filtroFechaDesde) {
        const desde = new Date(filtroFechaDesde)
        const fechaTurno = new Date(t.fecha)
        if (fechaTurno < desde) return false
      }

      if (filtroFechaHasta) {
        const hasta = new Date(filtroFechaHasta)
        hasta.setHours(23, 59, 59)
        const fechaTurno = new Date(t.fecha)
        if (fechaTurno > hasta) return false
      }

      return true
    })
  }, [turnos, filtroBusqueda, filtroTurno, filtroFechaDesde, filtroFechaHasta])

  const limpiarFiltros = () => {
    setFiltroBusqueda('')
    setFiltroTurno('')
    setFiltroFechaDesde('')
    setFiltroFechaHasta('')
  }

  const hayFiltros = filtroBusqueda || filtroTurno || filtroFechaDesde || filtroFechaHasta

  const toggleExpandido = (id: number) => {
    setExpandido(prev => prev === id ? null : id)
  }

  return (
    <div className="space-y-4">

      {/* ── FILTROS ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={filtroBusqueda}
              onChange={e => setFiltroBusqueda(e.target.value)}
              placeholder="Buscar empleado..."
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-neutral-300 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <select
            value={filtroTurno}
            onChange={e => setFiltroTurno(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
          >
            <option value="">Todos los turnos</option>
            {turnosDisponibles.map(nombre => (
              <option key={nombre} value={nombre}>{nombre}</option>
            ))}
            {turnosDisponibles.length === 0 && (
              <>
                <option value="Mañana">Mañana</option>
                <option value="Tarde">Tarde</option>
                <option value="Noche">Noche</option>
              </>
            )}
          </select>

          <input
            type="date"
            value={filtroFechaDesde}
            onChange={e => setFiltroFechaDesde(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />

          <input
            type="date"
            value={filtroFechaHasta}
            onChange={e => setFiltroFechaHasta(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        {hayFiltros && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
            <p className="text-xs text-neutral-500">
              {turnosFiltrados.length} de {turnos.length} turnos
            </p>
            <button onClick={limpiarFiltros} className="text-xs text-primary hover:underline font-medium">
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* ── LISTA ─────────────────────────────────────────────────────────── */}
      {turnosFiltrados.length === 0 ? (
        <div className="text-center py-12 text-neutral-400 bg-white rounded-xl border border-neutral-200">
          <Clock size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            {hayFiltros ? 'No hay turnos que coincidan con los filtros' : 'No hay turnos closed todavía'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {turnosFiltrados.map(turno => {
            const estaExpandido = expandido === turno.cierreTurnoId

            // Calcular el total vendido real sumando los sobrantes no registrados de caja
            const sobranteEfectivo = Math.max(0, turno.diferenciaEfectivo ?? 0)
            const sobranteVirtual = Math.max(0, turno.diferenciaVirtual ?? 0)
            const totalVendidoCalculado = turno.totalVentas + sobranteEfectivo + sobranteVirtual

            return (
              <div key={turno.cierreTurnoId} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                
                {/* ── Fila principal ──────────────────────────────────────── */}
                <button
                  onClick={() => toggleExpandido(turno.cierreTurnoId)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-neutral-50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-neutral-800">
                        {turno.fechaFormateada ? turno.fechaFormateada.split(' ')[0] : (turno.fecha ? turno.fecha.split('T')[0].split('-').reverse().join('/') : '—')}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {turno.fecha ? turno.fecha.split('T')[1].substring(0, 5) : '—'}
                        {turno.fechaCierreFormateada && ` → ${turno.fechaCierreFormateada}`}
                      </span>
                      {turno.turnoNombre && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          {turno.turnoNombre}
                        </span>
                      )}
                    </div>
                    {turno.empleados?.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-neutral-400">
                        <Users size={11} />
                        <span>{turno.empleados.map(e => e.empleadoNombre).join(', ')}</span>
                      </div>
                    )}
                  </div>
<div className="text-right hidden sm:block shrink-0">
  <p className="text-xs text-neutral-400 mb-0.5">Ventas</p>
  {/* Eliminamos turno.amountVentas para quitar el error de TS */}
  <p className="text-sm font-semibold text-neutral-800">{turno.cantidadVentas}</p>
</div>

                  {/* Mostramos el total vendido real incluyendo los sobrantes */}
                  <div className="text-right hidden md:block shrink-0">
  <p className="text-xs text-neutral-400 mb-0.5">Total declarado</p>
  <p className="text-sm font-semibold text-primary">
    {formatCurrency(turno.efectivoFinal + turno.virtualFinal)}
  </p>
</div>

                  <div className="text-right shrink-0">
                    <p className="text-xs text-neutral-400 mb-0.5">Ganancia</p>
                    <p className="text-sm font-bold text-success">{formatCurrency(turno.gananciaTotal)}</p>
                  </div>

                  <div className="text-right shrink-0">
  <p className="text-xs text-neutral-400 mb-0.5">Diferencia</p>
  <p className={`text-sm font-bold
    ${turno.diferencia === 0 ? 'text-success'
    : turno.diferencia > 0  ? 'text-success'
    : 'text-danger'}`}>
    {turno.diferencia === 0
      ? '✓ $0'
      : `${turno.diferencia > 0 ? '+' : ''}${formatCurrency(turno.diferencia)}`}
  </p>
</div>

                  <div className="text-neutral-400 shrink-0">
                    {estaExpandido ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {/* ── Detalle expandido corregido ────────────────────────────────────── */}
                {estaExpandido && (
                  <div className="border-t border-neutral-100 px-5 py-4 bg-neutral-50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">

                      <div>
                        <p className="text-xs text-neutral-400 mb-1">Apertura</p>
                        <p className="text-sm font-semibold text-neutral-800">{turno.fechaFormateada}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400 mb-1">Cierre</p>
                        <p className="text-sm font-semibold text-neutral-800">{turno.fechaCierreFormateada ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400 mb-1">Ganancia total</p>
                        <p className="text-sm font-bold text-success">{formatCurrency(turno.gananciaTotal)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400 mb-1">Gastos del turno</p>
                        <p className="text-sm font-semibold text-danger">-{formatCurrency(turno.totalGastos)}</p>
                      </div>

                      {/* ── VENTAS ── */}
                      <div className="col-span-4">
                        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">
                          Ventas del turno
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400 mb-1">Ventas en efectivo</p>
                        <p className="text-sm font-semibold text-neutral-800">{formatCurrency(turno.totalEfectivo)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400 mb-1">Ventas virtuales</p>
                        <p className="text-sm font-semibold text-neutral-800">{formatCurrency(turno.totalVirtual)}</p>
                      </div>
                      
                      {/* Tarjeta de total vendido recalculado */}
                      <div className="col-span-2 bg-primary/5 rounded-xl px-3 py-2.5">
  <p className="text-xs text-neutral-400 mb-1">Total declarado</p>
  <p className="text-sm font-bold text-primary">
    {formatCurrency(turno.efectivoFinal + turno.virtualFinal)}
  </p>
</div>

<div className="col-span-2">
  <p className="text-xs text-neutral-400 mb-1">Diferencia total</p>
  <p className={`text-sm font-bold
    ${(turno.diferenciaEfectivo + turno.diferenciaVirtual) === 0 ? 'text-success'
    : (turno.diferenciaEfectivo + turno.diferenciaVirtual) > 0  ? 'text-success'
    : 'text-danger'}`}>
    {(turno.diferenciaEfectivo + turno.diferenciaVirtual) === 0
      ? '✓ Cuadra exacto'
      : formatCurrency(turno.diferenciaEfectivo + turno.diferenciaVirtual)}
  </p>
</div>

                      {/* ── CONTROL DE CAJA ── */}
                      <div className="col-span-4">
                        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">
                          Control de caja (sin fondo)
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400 mb-1">Efectivo declarado</p>
                        <p className="text-sm font-semibold text-neutral-800">{formatCurrency(turno.efectivoFinal)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400 mb-1">Virtual declarado</p>
                        <p className="text-sm font-semibold text-neutral-800">{formatCurrency(turno.virtualFinal)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400 mb-1">Diferencia efectivo</p>
                        <p className={`text-sm font-bold
                          ${(turno.diferenciaEfectivo ?? 0) === 0 ? 'text-success'
                          : (turno.diferenciaEfectivo ?? 0) > 0  ? 'text-success'
                          : 'text-danger'}`}>
                          {(turno.diferenciaEfectivo ?? 0) === 0
                            ? '✓ Cuadra'
                            : `${(turno.diferenciaEfectivo ?? 0) > 0 ? '+' : ''}${formatCurrency(turno.diferenciaEfectivo ?? 0)}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400 mb-1">Diferencia virtual</p>
                        <p className={`text-sm font-bold
                          ${(turno.diferenciaVirtual ?? 0) === 0 ? 'text-success'
                          : (turno.diferenciaVirtual ?? 0) > 0   ? 'text-success'
                          : 'text-danger'}`}>
                          {(turno.diferenciaVirtual ?? 0) === 0
                            ? '✓ Cuadra'
                            : `${(turno.diferenciaVirtual ?? 0) > 0 ? '+' : ''}${formatCurrency(turno.diferenciaVirtual ?? 0)}`}
                        </p>
                      </div>

                      {/* ── FONDO ── */}
                      <div className="col-span-4">
                        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">
                          Fondo
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400 mb-1">Efectivo inicial</p>
                        <p className="text-sm font-semibold text-neutral-800">{formatCurrency(turno.efectivoInicial)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400 mb-1">Virtual inicial</p>
                        <p className="text-sm font-semibold text-neutral-800">{formatCurrency(turno.virtualInicial ?? 0)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400 mb-1">Efectivo que dejaron</p>
                        <p className="text-sm font-semibold text-neutral-800">
                          {formatCurrency(turno.efectivoFinalFondo ?? 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400 mb-1">Virtual que dejaron</p>
                        <p className="text-sm font-semibold text-neutral-800">
                          {formatCurrency(turno.virtualFinalFondo ?? 0)}
                        </p>
                      </div>

                    </div>

                    {turno.observaciones && (
                      <div className="bg-white rounded-lg px-4 py-3 border border-neutral-200">
                        <p className="text-xs text-neutral-400 mb-1">Observaciones</p>
                        <p className="text-sm text-neutral-700">{turno.observaciones}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
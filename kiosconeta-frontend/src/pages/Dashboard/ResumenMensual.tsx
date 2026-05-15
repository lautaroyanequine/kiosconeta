// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: ResumenMensual
// Tabla mes con subtotales por turno, gastos y balance por día
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import apiClient, { handleResponse } from '@/apis/client'
import { formatCurrency } from '@/utils/formatters'

// ────────────────────────────────────────────────────────────────────────────
// TIPOS
// ────────────────────────────────────────────────────────────────────────────

interface CierreTurno {
  cierreTurnoId: number
  fecha: string
  fechaCierre?: string
  turnoNombre: string
  montoReal: number
  virtualFinal: number
  efectivoInicial: number
  estadoNombre: string
}

interface Gasto {
  gastoId: number
  fecha: string
  monto: number
  nombre: string
}

interface FilaDia {
  dia: number
  fecha: Date
  manana: number | null
  tarde: number | null
  noche: number | null
  total: number
  gastos: number
  balance: number
  turnoAbierto: boolean
}

// ────────────────────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────────────────────

const facturadoTurno = (t: CierreTurno) =>
  (t.montoReal - t.efectivoInicial) + t.virtualFinal

const NOMBRES_MANANA = ['mañana', 'manana', 'morning']
const NOMBRES_TARDE  = ['tarde', 'afternoon']
const NOMBRES_NOCHE  = ['noche', 'night']

const clasificarTurno = (nombre: string): 'manana' | 'tarde' | 'noche' | null => {
  const n = nombre?.toLowerCase() ?? ''
  if (NOMBRES_MANANA.some(x => n.includes(x))) return 'manana'
  if (NOMBRES_TARDE.some(x => n.includes(x)))  return 'tarde'
  if (NOMBRES_NOCHE.some(x => n.includes(x)))  return 'noche'
  return null
}

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════════════════════

export const ResumenMensual: React.FC = () => {
  const { user } = useAuth()

  const hoy = new Date()
  const [mes, setMes]   = useState(hoy.getMonth())
  const [anio, setAnio] = useState(hoy.getFullYear())

  const [turnos, setTurnos]   = useState<CierreTurno[]>([])
  const [gastos, setGastos]   = useState<Gasto[]>([])
  const [loading, setLoading] = useState(true)

  // ── Cargar datos ──────────────────────────────────────────────────────────
  useEffect(() => { cargar() }, [mes, anio])

  const cargar = async () => {
    if (!user?.kioscoId) return
    setLoading(true)
    try {
      const [turnosRes, gastosRes] = await Promise.allSettled([
        apiClient.get(`/CierreTurnos/kiosco/${user.kioscoId}`).then(r => handleResponse(r)),
        apiClient.get(`/Gastos/kiosco/${user.kioscoId}`).then(r => handleResponse(r)),
      ])
      setTurnos(turnosRes.status === 'fulfilled' ? turnosRes.value ?? [] : [])
      setGastos(gastosRes.status === 'fulfilled' ? gastosRes.value ?? [] : [])
    } catch (err) {
      console.error('Error cargando resumen mensual:', err)
    } finally {
      setLoading(false)
    }
  }

  // ── Filtrar por mes/año ───────────────────────────────────────────────────
  const turnosMes = useMemo(() =>
    turnos.filter(t => {
      const f = new Date(t.fecha)
      return f.getMonth() === mes && f.getFullYear() === anio
    }),
  [turnos, mes, anio])

  const gastosMes = useMemo(() =>
    gastos.filter(g => {
      const f = new Date(g.fecha)
      return f.getMonth() === mes && f.getFullYear() === anio
    }),
  [gastos, mes, anio])

  // ── Armar filas por día ───────────────────────────────────────────────────
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()

  const filas: FilaDia[] = useMemo(() => {
    const rows: FilaDia[] = []

    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fecha = new Date(anio, mes, dia)

      // Turnos del día
      const turnosDia = turnosMes.filter(t => {
        const f = new Date(t.fecha)
        return f.getDate() === dia
      })

      // Gastos del día
      const gastosDia = gastosMes
        .filter(g => new Date(g.fecha).getDate() === dia)
        .reduce((sum, g) => sum + g.monto, 0)

      // Clasificar por turno
      let manana: number | null = null
      let tarde:  number | null = null
      let noche:  number | null = null
      let turnoAbierto = false

      turnosDia.forEach(t => {
        const tipo = clasificarTurno(t.turnoNombre)
        const valor = t.estadoNombre === 'Abierto'
          ? null  // turno abierto, no tiene cierre todavía
          : facturadoTurno(t)

        if (t.estadoNombre === 'Abierto') turnoAbierto = true

        if (tipo === 'manana') manana = valor
        else if (tipo === 'tarde') tarde = valor
        else if (tipo === 'noche') noche = valor
        else {
          // Si no tiene nombre clasificable, ponerlo donde haya espacio
          if (manana === null && !turnosDia.find(x => clasificarTurno(x.turnoNombre) === 'manana'))
            manana = valor
          else if (tarde === null)
            tarde = valor
          else
            noche = valor
        }
      })

      const total   = (manana ?? 0) + (tarde ?? 0) + (noche ?? 0)
      const balance = total - gastosDia

      // Solo agregar días que tengan algo O que sean del pasado/hoy
      if (turnosDia.length > 0 || gastosDia > 0 || fecha <= hoy) {
        rows.push({ dia, fecha, manana, tarde, noche, total, gastos: gastosDia, balance, turnoAbierto })
      }
    }

    return rows
  }, [turnosMes, gastosMes, diasEnMes, mes, anio])

  // ── Totales del mes ───────────────────────────────────────────────────────
  const totalesMes = useMemo(() => ({
    manana:  filas.reduce((s, f) => s + (f.manana ?? 0), 0),
    tarde:   filas.reduce((s, f) => s + (f.tarde ?? 0), 0),
    noche:   filas.reduce((s, f) => s + (f.noche ?? 0), 0),
    total:   filas.reduce((s, f) => s + f.total, 0),
    gastos:  filas.reduce((s, f) => s + f.gastos, 0),
    balance: filas.reduce((s, f) => s + f.balance, 0),
  }), [filas])

  // ── Navegar mes ───────────────────────────────────────────────────────────
  const irMesAnterior = () => {
    if (mes === 0) { setMes(11); setAnio(a => a - 1) }
    else setMes(m => m - 1)
  }

  const irMesSiguiente = () => {
    if (mes === 11) { setMes(0); setAnio(a => a + 1) }
    else setMes(m => m + 1)
  }

  const nombreMes = new Date(anio, mes, 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
        <h2 className="text-sm font-bold text-neutral-800 uppercase tracking-wide">
          Resumen mensual
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={irMesAnterior}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-neutral-200
                       text-neutral-500 hover:bg-neutral-50 transition-colors">
            <ChevronLeft size={14} />
          </button>
          <span className="text-sm font-semibold text-neutral-700 capitalize min-w-36 text-center">
            {nombreMes}
          </span>
          <button onClick={irMesSiguiente}
            disabled={mes === hoy.getMonth() && anio === hoy.getFullYear()}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-neutral-200
                       text-neutral-500 hover:bg-neutral-50 transition-colors
                       disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="px-4 py-2.5 text-left font-semibold text-neutral-500 w-10">DÍA</th>
                <th className="px-4 py-2.5 text-right font-semibold text-blue-600">MAÑANA</th>
                <th className="px-4 py-2.5 text-right font-semibold text-orange-500">TARDE</th>
                <th className="px-4 py-2.5 text-right font-semibold text-indigo-600">NOCHE</th>
                <th className="px-4 py-2.5 text-right font-semibold text-neutral-700">TOTAL</th>
                <th className="px-4 py-2.5 text-right font-semibold text-danger">GASTOS</th>
                <th className="px-4 py-2.5 text-right font-semibold text-neutral-700">BALANCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filas.map(fila => {
                const esHoy = fila.fecha.toDateString() === hoy.toDateString()
                const sinDatos = fila.total === 0 && fila.gastos === 0
                return (
                  <tr key={fila.dia}
                    className={`transition-colors
                      ${esHoy ? 'bg-primary/5 font-semibold' : 'hover:bg-neutral-50'}
                      ${sinDatos ? 'opacity-30' : ''}`}>
                    <td className="px-4 py-2 text-neutral-500 font-medium">
                      {fila.dia}
                      {esHoy && <span className="ml-1 text-primary text-xs">●</span>}
                    </td>
                    <td className="px-4 py-2 text-right text-blue-600">
                      {fila.manana !== null
                        ? formatCurrency(fila.manana)
                        : fila.turnoAbierto ? <span className="text-success-600">●</span> : '—'}
                    </td>
                    <td className="px-4 py-2 text-right text-orange-500">
                      {fila.tarde !== null ? formatCurrency(fila.tarde) : '—'}
                    </td>
                    <td className="px-4 py-2 text-right text-indigo-600">
                      {fila.noche !== null ? formatCurrency(fila.noche) : '—'}
                    </td>
                    <td className="px-4 py-2 text-right font-bold text-neutral-800">
                      {fila.total > 0 ? formatCurrency(fila.total) : '—'}
                    </td>
                    <td className="px-4 py-2 text-right text-danger">
                      {fila.gastos > 0 ? `-${formatCurrency(fila.gastos)}` : '—'}
                    </td>
                    <td className={`px-4 py-2 text-right font-bold
                      ${fila.balance > 0 ? 'text-success-700'
                      : fila.balance < 0 ? 'text-danger'
                      : 'text-neutral-400'}`}>
                      {fila.total > 0 || fila.gastos > 0
                        ? formatCurrency(fila.balance)
                        : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>

            {/* Totales */}
            <tfoot>
              <tr className="bg-neutral-800 text-white font-bold">
                <td className="px-4 py-3 text-xs uppercase tracking-wide">TOTAL</td>
                <td className="px-4 py-3 text-right text-blue-300">
                  {formatCurrency(totalesMes.manana)}
                </td>
                <td className="px-4 py-3 text-right text-orange-300">
                  {formatCurrency(totalesMes.tarde)}
                </td>
                <td className="px-4 py-3 text-right text-indigo-300">
                  {formatCurrency(totalesMes.noche)}
                </td>
                <td className="px-4 py-3 text-right">
                  {formatCurrency(totalesMes.total)}
                </td>
                <td className="px-4 py-3 text-right text-red-300">
                  -{formatCurrency(totalesMes.gastos)}
                </td>
                <td className={`px-4 py-3 text-right
                  ${totalesMes.balance >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {formatCurrency(totalesMes.balance)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Resumen debajo de la tabla */}
      {!loading && (
        <div className="grid grid-cols-3 gap-0 border-t border-neutral-200">
          <div className="px-5 py-4 border-r border-neutral-100">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-success" />
              <p className="text-xs text-neutral-500">Total facturado</p>
            </div>
            <p className="text-lg font-bold text-neutral-900">{formatCurrency(totalesMes.total)}</p>
          </div>
          <div className="px-5 py-4 border-r border-neutral-100">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown size={14} className="text-danger" />
              <p className="text-xs text-neutral-500">Total gastos</p>
            </div>
            <p className="text-lg font-bold text-danger">{formatCurrency(totalesMes.gastos)}</p>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-1">
              <Wallet size={14} className={totalesMes.balance >= 0 ? 'text-success' : 'text-danger'} />
              <p className="text-xs text-neutral-500">Balance del mes</p>
            </div>
            <p className={`text-lg font-bold ${totalesMes.balance >= 0 ? 'text-success-700' : 'text-danger'}`}>
              {formatCurrency(totalesMes.balance)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
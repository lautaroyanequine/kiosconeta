// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: Sueldos
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo } from 'react'
import { Plus, Trash2, AlertCircle, Users, X, ChevronDown, ChevronRight, Calendar, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { gastosApi, tiposGastoApi } from '@/apis/gastosApi'
import { empleadosApi } from '@/apis/otrosApi'
import { formatCurrency } from '@/utils/formatters'
import type { GastoResponse, TipoDeGasto } from '@/types/gastoTurno'
import type { Empleado } from '@/types/empleado'

// Palabras clave para detectar el tipo "Sueldo"
const KEYWORDS_SUELDO = ['sueldo', 'sueldos', 'salario', 'salarios']

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

// "Marzo 2026" → usado como string guardado en la descripción del gasto
const formatearPeriodo = (mes: number, anio: number) => `${MESES[mes]} ${anio}`

export const Sueldos: React.FC = () => {
  const { user } = useAuth()

  const [sueldos, setSueldos]           = useState<GastoResponse[]>([])
  const [empleados, setEmpleados]       = useState<Empleado[]>([])
  const [tipoSueldo, setTipoSueldo]     = useState<TipoDeGasto | null>(null)
  const [loading, setLoading]           = useState(true)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [empleadoIdSeleccionado, setEmpleadoIdSeleccionado] = useState<number | ''>('')
  const [monto, setMonto]               = useState('')
  const hoy = new Date()
  const [mesPeriodo, setMesPeriodo]     = useState(hoy.getMonth())
  const [anioPeriodo, setAnioPeriodo]   = useState(hoy.getFullYear())
  const [descripcion, setDescripcion]   = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError]               = useState('')
  const [eliminando, setEliminando]     = useState<number | null>(null)

  // ── Períodos expandidos en la vista agrupada ──────────────────────────────
  const [periodosAbiertos, setPeriodosAbiertos] = useState<Set<string>>(new Set())
  const [periodosEmpleadoAbiertos, setPeriodosEmpleadoAbiertos] = useState<Set<string>>(new Set())

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    if (!user?.kioscoId) return
    setLoading(true)
    try {
      const [tipos, empleadosData] = await Promise.all([
        tiposGastoApi.getByKiosco(user.kioscoId),
        empleadosApi.getByKiosco(user.kioscoId),
      ])

      setEmpleados(empleadosData.filter((e: Empleado) => e.activo))

      const tipo = tipos.find((t: TipoDeGasto) =>
        KEYWORDS_SUELDO.some(k => t.nombre.toLowerCase().includes(k))
      )
      setTipoSueldo(tipo ?? null)

      if (tipo) {
        const todosGastos = await gastosApi.getByKiosco(user.kioscoId)
        const gastosSueldo = todosGastos.filter(
          g => g.tipoDeGastoId === tipo.tipoDeGastoId
        )
        setSueldos(gastosSueldo)
      }
    } catch (err) {
      console.error('Error cargando sueldos:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalSueldos = useMemo(
    () => sueldos.reduce((sum, s) => sum + s.monto, 0),
    [sueldos]
  )

  // ── Agrupar sueldos por período (extraído de la descripción) ─────────────

  const sueldosPorPeriodo = useMemo(() => {
    const mapa = new Map<string, GastoResponse[]>()

    for (const s of sueldos) {
      // El período se guarda como primer segmento de la descripción, separado por " · "
      const periodo = s.descripcion?.split(' · ')[0]?.trim() || 'Sin período'
      const lista = mapa.get(periodo) ?? []
      lista.push(s)
      mapa.set(periodo, lista)
    }

    // Ordenar períodos del más reciente al más antiguo (best-effort con Date.parse)
    return Array.from(mapa.entries()).sort((a, b) => {
      const da = Date.parse(`1 ${a[0]}`)
      const db = Date.parse(`1 ${b[0]}`)
      if (isNaN(da) || isNaN(db)) return 0
      return db - da
    })
  }, [sueldos])

  // ── Agrupar sueldos por período → empleado (totales acumulados) ──────────

  const empleadoPorPeriodo = useMemo(() => {
    // Map<periodo, Map<empleadoId, { nombre, total, cantidad }>>
    const mapaPeriodos = new Map<string, Map<number, { nombre: string; total: number; cantidad: number }>>()

    for (const s of sueldos) {
      const periodo = s.descripcion?.split(' · ')[0]?.trim() || 'Sin período'
      const mapaEmpleados = mapaPeriodos.get(periodo) ?? new Map()

      const actual = mapaEmpleados.get(s.empleadoId)
      if (actual) {
        actual.total += s.monto
        actual.cantidad += 1
      } else {
        mapaEmpleados.set(s.empleadoId, {
          nombre: s.empleadoNombre || empleados.find(e => e.empleadoId === s.empleadoId)?.nombre || 'Desconocido',
          total: s.monto,
          cantidad: 1,
        })
      }

      mapaPeriodos.set(periodo, mapaEmpleados)
    }

    // Mismo orden que sueldosPorPeriodo: más reciente primero
    return Array.from(mapaPeriodos.entries())
      .map(([periodo, mapaEmpleados]) => [
        periodo,
        Array.from(mapaEmpleados.values()).sort((a, b) => b.total - a.total),
      ] as [string, { nombre: string; total: number; cantidad: number }[]])
      .sort((a, b) => {
        const da = Date.parse(`1 ${a[0]}`)
        const db = Date.parse(`1 ${b[0]}`)
        if (isNaN(da) || isNaN(db)) return 0
        return db - da
      })
  }, [sueldos, empleados])

  const togglePeriodo = (periodo: string) => {
    setPeriodosAbiertos(prev => {
      const next = new Set(prev)
      if (next.has(periodo)) next.delete(periodo)
      else next.add(periodo)
      return next
    })
  }

  const togglePeriodoEmpleado = (periodo: string) => {
    setPeriodosEmpleadoAbiertos(prev => {
      const next = new Set(prev)
      if (next.has(periodo)) next.delete(periodo)
      else next.add(periodo)
      return next
    })
  }

  // ── Crear sueldo ───────────────────────────────────────────────────────────

  const handleRegistrar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !tipoSueldo || !empleadoIdSeleccionado) return

    const empleado = empleados.find(emp => emp.empleadoId === empleadoIdSeleccionado)
    if (!empleado) return

    setIsSubmitting(true)
    setError('')
    try {
      const periodo = formatearPeriodo(mesPeriodo, anioPeriodo)
      const nuevo = await gastosApi.create({
        nombre: `Sueldo — ${empleado.nombre}`,
        descripcion: [periodo, descripcion].filter(Boolean).join(' · '),
        monto: parseFloat(monto),
        empleadoId: empleado.empleadoId, // ✅ el empleado que cobra el sueldo, no quien lo registra
        tipoDeGastoId: tipoSueldo.tipoDeGastoId,
        cierreTurnoId: null,
      })
      setSueldos(prev => [nuevo, ...prev])
      cerrarModal()
    } catch (err: any) {
      setError(err.message || 'Error al registrar el sueldo')
    } finally {
      setIsSubmitting(false)
    }
  }

  const cerrarModal = () => {
    setEmpleadoIdSeleccionado('')
    setMonto('')
    setMesPeriodo(hoy.getMonth())
    setAnioPeriodo(hoy.getFullYear())
    setDescripcion('')
    setError('')
    setModalAbierto(false)
  }

  const handleEliminar = async (gastoId: number) => {
    setEliminando(gastoId)
    try {
      await gastosApi.delete(gastoId)
      setSueldos(prev => prev.filter(s => s.gastoId !== gastoId))
    } catch (err: any) {
      alert(err.message || 'Error al eliminar')
    } finally {
      setEliminando(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-neutral-800">Sueldos pagados</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Registrá los pagos realizados a cada empleado
            </p>
          </div>
          <button
            onClick={() => setModalAbierto(true)}
            disabled={!tipoSueldo || empleados.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all
              ${tipoSueldo && empleados.length > 0
                ? 'bg-primary text-white hover:bg-primary-600 active:scale-[0.98]'
                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'}`}
          >
            <Plus size={16} />
            Registrar sueldo
          </button>
        </div>

        {/* Avisos */}
        {!tipoSueldo && (
          <div className="bg-warning-50 border border-warning-200 rounded-xl p-4 mb-4 text-sm text-warning-700">
            ⚠️ Para registrar sueldos creá un tipo de gasto llamado <strong>"Sueldo"</strong> en la pestaña de Gastos.
          </div>
        )}
        {tipoSueldo && empleados.length === 0 && (
          <div className="bg-warning-50 border border-warning-200 rounded-xl p-4 mb-4 text-sm text-warning-700">
            ⚠️ No hay empleados activos para asignar sueldos.
          </div>
        )}

        {/* Total general */}
        {sueldos.length > 0 && (
          <div className="flex justify-between items-center px-5 py-3 bg-neutral-50 border border-neutral-200 rounded-xl mb-4">
            <span className="text-sm font-medium text-neutral-600">Total sueldos pagados</span>
            <span className="text-base font-bold text-danger">{formatCurrency(totalSueldos)}</span>
          </div>
        )}

        {/* Listado agrupado por período */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          {sueldos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-300">
              <Users size={48} className="mb-3 opacity-30" />
              <p className="text-sm text-neutral-400">No hay sueldos registrados</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {sueldosPorPeriodo.map(([periodo, gastosDelPeriodo]) => {
                const totalPeriodo = gastosDelPeriodo.reduce((sum, g) => sum + g.monto, 0)
                const abierto = periodosAbiertos.has(periodo)

                return (
                  <div key={periodo}>
                    <button
                      onClick={() => togglePeriodo(periodo)}
                      className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {abierto ? <ChevronDown size={16} className="text-neutral-400" /> : <ChevronRight size={16} className="text-neutral-400" />}
                        <Calendar size={15} className="text-neutral-400" />
                        <span className="text-sm font-semibold text-neutral-800">{periodo}</span>
                        <span className="text-xs text-neutral-400">
                          ({gastosDelPeriodo.length} empleado{gastosDelPeriodo.length !== 1 ? 's' : ''})
                        </span>
                      </div>
                      <span className="text-sm font-bold text-danger">{formatCurrency(totalPeriodo)}</span>
                    </button>

                    {abierto && (
                      <div className="bg-neutral-50/50 divide-y divide-neutral-100">
                        {gastosDelPeriodo.map(sueldo => (
                          <div key={sueldo.gastoId}
                            className="flex items-center gap-3 px-5 pl-11 py-3 hover:bg-neutral-50 transition-colors">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-neutral-800 truncate">{sueldo.nombre}</p>
                              {sueldo.descripcion?.split(' · ').slice(1).join(' · ') && (
                                <p className="text-xs text-neutral-400 mt-0.5">
                                  {sueldo.descripcion.split(' · ').slice(1).join(' · ')}
                                </p>
                              )}
                              <p className="text-xs text-neutral-400 mt-0.5">{sueldo.fechaFormateada}</p>
                            </div>
                            <span className="text-sm font-bold text-danger shrink-0">
                              -{formatCurrency(sueldo.monto)}
                            </span>
                            <button
                              onClick={() => handleEliminar(sueldo.gastoId)}
                              disabled={eliminando === sueldo.gastoId}
                              className="text-neutral-300 hover:text-danger transition-colors ml-1 shrink-0"
                            >
                              {eliminando === sueldo.gastoId
                                ? <div className="w-4 h-4 border-2 border-danger/40 border-t-danger rounded-full animate-spin" />
                                : <Trash2 size={15} />}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
        {/* Resumen por empleado, seccionado por período */}
        {empleadoPorPeriodo.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-bold text-neutral-700 mb-3 flex items-center gap-2">
              <Users size={16} className="text-neutral-400" />
              Total pagado por empleado
            </h3>
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <div className="divide-y divide-neutral-100">
                {empleadoPorPeriodo.map(([periodo, empleadosDelPeriodo]) => {
                  const totalPeriodo = empleadosDelPeriodo.reduce((sum, e) => sum + e.total, 0)
                  const abierto = periodosEmpleadoAbiertos.has(periodo)

                  return (
                    <div key={periodo}>
                      <button
                        onClick={() => togglePeriodoEmpleado(periodo)}
                        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-neutral-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {abierto ? <ChevronDown size={16} className="text-neutral-400" /> : <ChevronRight size={16} className="text-neutral-400" />}
                          <Calendar size={15} className="text-neutral-400" />
                          <span className="text-sm font-semibold text-neutral-800">{periodo}</span>
                          <span className="text-xs text-neutral-400">
                            ({empleadosDelPeriodo.length} empleado{empleadosDelPeriodo.length !== 1 ? 's' : ''})
                          </span>
                        </div>
                        <span className="text-sm font-bold text-danger">{formatCurrency(totalPeriodo)}</span>
                      </button>

                      {abierto && (
                        <div className="bg-neutral-50/50 divide-y divide-neutral-100">
                          {empleadosDelPeriodo.map(item => (
                            <div key={item.nombre}
                              className="flex items-center gap-3 px-5 pl-11 py-3 hover:bg-neutral-50 transition-colors">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <User size={14} className="text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-neutral-800 truncate">{item.nombre}</p>
                                <p className="text-xs text-neutral-400">
                                  {item.cantidad} pago{item.cantidad !== 1 ? 's' : ''}
                                </p>
                              </div>
                              <span className="text-sm font-bold text-danger shrink-0">{formatCurrency(item.total)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal registrar sueldo */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">Registrar sueldo</h3>
              <button onClick={cerrarModal} className="text-neutral-400 hover:text-neutral-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleRegistrar} className="p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-danger-50 border border-danger-100 rounded-xl text-sm text-danger">
                  <AlertCircle size={14} className="shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Empleado *</label>
                <div className="relative">
                  <select
                    value={empleadoIdSeleccionado}
                    onChange={e => setEmpleadoIdSeleccionado(e.target.value ? Number(e.target.value) : '')}
                    autoFocus
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm
                               outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                               appearance-none bg-white"
                  >
                    <option value="">Seleccionar empleado...</option>
                    {empleados.map(emp => (
                      <option key={emp.empleadoId} value={emp.empleadoId}>{emp.nombre}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Monto *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
                    <input type="number" value={monto} onChange={e => setMonto(e.target.value)}
                      placeholder="0" min="0"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-neutral-300 text-sm
                                 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Período *</label>
                  <div className="flex gap-1.5">
                    <div className="relative flex-1">
                      <select
                        value={mesPeriodo}
                        onChange={e => setMesPeriodo(Number(e.target.value))}
                        className="w-full px-2 py-2.5 rounded-xl border border-neutral-300 text-sm
                                   outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                                   appearance-none bg-white"
                      >
                        {MESES.map((m, idx) => (
                          <option key={m} value={idx}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="number"
                      value={anioPeriodo}
                      onChange={e => setAnioPeriodo(Number(e.target.value))}
                      className="w-20 px-2 py-2.5 rounded-xl border border-neutral-300 text-sm
                                 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Observaciones <span className="text-neutral-400 font-normal">(opcional)</span>
                </label>
                <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)}
                  placeholder="Ej: incluye horas extra"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm
                             outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={cerrarModal}
                  className="flex-1 py-2.5 text-sm text-neutral-600 border border-neutral-300 rounded-xl hover:bg-neutral-50">
                  Cancelar
                </button>
                <button type="submit"
                  disabled={!empleadoIdSeleccionado || !monto || isSubmitting}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all
                    ${empleadoIdSeleccionado && monto && !isSubmitting
                      ? 'bg-primary text-white hover:bg-primary-600'
                      : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'}`}>
                  {isSubmitting ? 'Guardando...' : 'Registrar sueldo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
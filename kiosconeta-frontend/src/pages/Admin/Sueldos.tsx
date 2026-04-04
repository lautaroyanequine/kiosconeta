// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: Sueldos
// Registro de sueldos pagados a empleados.
// Usa el sistema de gastos con un tipo de gasto "Sueldo".
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo } from 'react'
import { Plus, Trash2, AlertCircle, Users, X, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { gastosApi } from '@/apis/gastosApi'
import { formatCurrency } from '@/utils/formatters'
import type { GastoResponse } from '@/types/gastoTurno'

// ── Tipo de gasto para sueldos ────────────────────────────────────────────
// Se filtra de los tipos de gasto buscando "sueldo" en el nombre
const TIPO_SUELDO_KEYWORDS = ['sueldo', 'salario', 'pago empleado']

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════════════════════

export const Sueldos: React.FC = () => {
  const { user } = useAuth()

  // ── Datos ─────────────────────────────────────────────────────────────────
  const [sueldos, setSueldos]           = useState<GastoResponse[]>([])
  const [tipoSueldoId, setTipoSueldoId] = useState<number | null>(null)
  const [loading, setLoading]           = useState(true)
  const [sinTipoSueldo, setSinTipoSueldo] = useState(false)

  // ── Modal ─────────────────────────────────────────────────────────────────
  const [modalAbierto, setModalAbierto] = useState(false)
  const [empleadoNombre, setEmpleadoNombre] = useState('')
  const [monto, setMonto]               = useState('')
  const [periodo, setPeriodo]           = useState('')
  const [descripcion, setDescripcion]   = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError]               = useState('')

  // ── Eliminar ──────────────────────────────────────────────────────────────
  const [eliminando, setEliminando] = useState<number | null>(null)

  // ── Cargar datos ──────────────────────────────────────────────────────────
  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    if (!user?.kioscoId) return
    setLoading(true)
    try {
      // Traer todos los gastos del kiosco
      const todosGastos = await gastosApi.getByKiosco(user.kioscoId)

      // Encontrar el tipo "Sueldo"
      const sueldo = todosGastos.find(g =>
        TIPO_SUELDO_KEYWORDS.some(k =>
          g.tipoDeGastoNombre?.toLowerCase().includes(k)
        )
      )

      if (!sueldo && todosGastos.length === 0) {
        // No hay tipo sueldo creado
        setSinTipoSueldo(true)
      }

      // Filtrar solo los gastos de tipo sueldo
      const gastosSueldo = todosGastos.filter(g =>
        TIPO_SUELDO_KEYWORDS.some(k =>
          g.tipoDeGastoNombre?.toLowerCase().includes(k)
        )
      )

      setSueldos(gastosSueldo)
      if (sueldo) setTipoSueldoId(sueldo.tipoDeGastoId)

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

  // ── Registrar sueldo ──────────────────────────────────────────────────────
  const handleRegistrar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !tipoSueldoId) return

    setIsSubmitting(true)
    setError('')
    try {
      const nuevo = await gastosApi.create({
        nombre: `Sueldo — ${empleadoNombre.trim()}`,
        descripcion: periodo
          ? `Período: ${periodo}${descripcion ? ` · ${descripcion}` : ''}`
          : descripcion,
        monto: parseFloat(monto),
        empleadoId: user.empleadoId,
        tipoDeGastoId: tipoSueldoId,
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
    setEmpleadoNombre('')
    setMonto('')
    setPeriodo('')
    setDescripcion('')
    setError('')
    setModalAbierto(false)
  }

  // ── Eliminar ──────────────────────────────────────────────────────────────
  const handleEliminar = async (gastoId: number) => {
    setEliminando(gastoId)
    try {
      await gastosApi.delete(gastoId)
      setSueldos(prev => prev.filter(s => s.gastoId !== gastoId))
    } catch (err: any) {
      alert(err.message || 'Error al eliminar el sueldo')
    } finally {
      setEliminando(null)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

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
            disabled={!tipoSueldoId}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
              transition-all
              ${tipoSueldoId
                ? 'bg-primary text-white hover:bg-primary-600 active:scale-[0.98]'
                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'}`}
          >
            <Plus size={16} />
            Registrar sueldo
          </button>
        </div>

        {/* Aviso si no hay tipo sueldo */}
        {!tipoSueldoId && (
          <div className="bg-warning-50 border border-warning-200 rounded-xl p-4 mb-4 text-sm text-warning-700">
            ⚠️ Para registrar sueldos necesitás crear un tipo de gasto llamado <strong>"Sueldo"</strong> en la pestaña de Gastos.
          </div>
        )}

        {/* Lista */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          {sueldos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-300">
              <Users size={48} className="mb-3 opacity-30" />
              <p className="text-sm text-neutral-400">No hay sueldos registrados</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-neutral-100">
                {sueldos.map(sueldo => (
                  <div
                    key={sueldo.gastoId}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-800 truncate">{sueldo.nombre}</p>
                      {sueldo.descripcion && (
                        <p className="text-xs text-neutral-400 mt-0.5">{sueldo.descripcion}</p>
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
                        : <Trash2 size={15} />
                      }
                    </button>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center px-5 py-3 bg-neutral-50 border-t border-neutral-200">
                <span className="text-sm font-medium text-neutral-600">Total sueldos pagados</span>
                <span className="text-base font-bold text-danger">{formatCurrency(totalSueldos)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── MODAL ─────────────────────────────────────────────────────────── */}
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
                <div className="flex items-center gap-2 p-3 bg-danger-50 border border-danger-100
                                rounded-xl text-sm text-danger">
                  <AlertCircle size={14} className="shrink-0" />
                  {error}
                </div>
              )}

              {/* Nombre del empleado */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Nombre del empleado *
                </label>
                <input
                  type="text"
                  value={empleadoNombre}
                  onChange={e => setEmpleadoNombre(e.target.value)}
                  placeholder="Ej: Juan García"
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm
                             outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              {/* Monto + Período */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Monto *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
                    <input
                      type="number"
                      value={monto}
                      onChange={e => setMonto(e.target.value)}
                      placeholder="0"
                      min="0"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-neutral-300 text-sm
                                 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Período <span className="text-neutral-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={periodo}
                    onChange={e => setPeriodo(e.target.value)}
                    placeholder="Ej: Marzo 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm
                               outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Observaciones <span className="text-neutral-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  placeholder="Ej: incluye horas extra"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm
                             outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={cerrarModal}
                  className="flex-1 py-2.5 text-sm text-neutral-600 border border-neutral-300
                             rounded-xl hover:bg-neutral-50 transition-colors">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!empleadoNombre.trim() || !monto || isSubmitting}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all
                    ${empleadoNombre.trim() && monto && !isSubmitting
                      ? 'bg-primary text-white hover:bg-primary-600'
                      : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'}`}
                >
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
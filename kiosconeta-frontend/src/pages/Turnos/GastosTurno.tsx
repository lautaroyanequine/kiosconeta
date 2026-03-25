import React, { useState, useEffect, useMemo } from 'react'
import { Plus, Trash2, AlertCircle, Wallet, X, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { gastosApi, tiposGastoApi } from '@/apis/gastosApi'
import { formatCurrency } from '@/utils/formatters'
import type { GastoResponse, TipoDeGasto } from '@/types/gastoTurno'

interface GastosTurnoProps {
  cierreTurnoId: number
}

export const GastosTurno: React.FC<GastosTurnoProps> = ({ cierreTurnoId }) => {
  const { user } = useAuth()

  // ── DATA ─────────────────────────────────────────
  const [gastos, setGastos] = useState<GastoResponse[]>([])
  const [tiposGasto, setTiposGasto] = useState<TipoDeGasto[]>([])
  const [loading, setLoading] = useState(true)

  // ── FORM ─────────────────────────────────────────
  const [mostrarForm, setMostrarForm] = useState(false)
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [tipoSeleccionado, setTipoSeleccionado] = useState<number | ''>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // ── DELETE ───────────────────────────────────────
  const [eliminando, setEliminando] = useState<number | null>(null)

  // ── LOAD ─────────────────────────────────────────
  useEffect(() => {
    cargarDatos()
  }, [cierreTurnoId])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [gastosData, tiposData] = await Promise.all([
        gastosApi.getByTurno(cierreTurnoId),
        tiposGastoApi.getByKiosco(user!.kioscoId),
      ])

      setGastos(gastosData)
      setTiposGasto(tiposData)

      if (tiposData.length > 0) {
        setTipoSeleccionado(tiposData[0].tipoDeGastoId)
      }
    } catch (err) {
      console.error('Error cargando gastos:', err)
    } finally {
      setLoading(false)
    }
  }

  // ── TOTAL ────────────────────────────────────────
  const totalGastos = useMemo(
    () => gastos.reduce((sum, g) => sum + g.monto, 0),
    [gastos]
  )

  // ── VALIDACIÓN ───────────────────────────────────
  const formularioValido =
    monto !== '' &&
    !isNaN(parseFloat(monto)) &&
    parseFloat(monto) > 0 &&
    tipoSeleccionado !== ''

  // ── RESET FORM ───────────────────────────────────
  const limpiarFormulario = () => {
    setDescripcion('')
    setMonto('')
    setError('')
    if (tiposGasto.length > 0) {
      setTipoSeleccionado(tiposGasto[0].tipoDeGastoId)
    }
  }

  const cancelarFormulario = () => {
    limpiarFormulario()
    setMostrarForm(false)
  }

  // ── CREATE ───────────────────────────────────────
  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formularioValido || !user) return

    setIsSubmitting(true)
    setError('')

    try {
      const nuevoGasto = await gastosApi.create({
        descripcion: descripcion.trim(),
        monto: parseFloat(monto),
        empleadoId: user.empleadoId,
        tipoDeGastoId: Number(tipoSeleccionado),
        cierreTurnoId,
      })

      setGastos(prev => [...prev, nuevoGasto])
      limpiarFormulario()
      setMostrarForm(false)
    } catch (err: any) {
      setError(err.message || 'Error al registrar el gasto')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── DELETE ───────────────────────────────────────
  const handleEliminar = async (gastoId: number) => {
    setEliminando(gastoId)
    try {
      await gastosApi.delete(gastoId)
      setGastos(prev => prev.filter(g => g.gastoId !== gastoId))
    } catch (err: any) {
      alert(err.message || 'Error al eliminar el gasto')
    } finally {
      setEliminando(null)
    }
  }

  // ── RENDER ───────────────────────────────────────
  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">

      {/* HEADER */}
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <div className="flex items-center gap-2">
          <Wallet size={18} className="text-neutral-400" />
          <h3 className="text-sm font-semibold">Gastos del turno</h3>
        </div>

        {!mostrarForm && (
          <button onClick={() => setMostrarForm(true)} className="text-primary flex items-center gap-1">
            <Plus size={15} />
            Agregar
          </button>
        )}
      </div>

      {/* FORM */}
      {mostrarForm && (
        <div className="p-5 bg-neutral-50 border-b">
          <form onSubmit={handleCrear} className="space-y-3">

            {/* MONTO */}
            <input
              type="number"
              value={monto}
              onChange={e => setMonto(e.target.value)}
              placeholder="Monto"
              className="w-full p-2 border rounded"
            />

            {/* TIPO */}
            <select
              value={tipoSeleccionado}
              onChange={e => setTipoSeleccionado(Number(e.target.value))}
              className="w-full p-2 border rounded"
            >
              {tiposGasto.map(t => (
                <option key={t.tipoDeGastoId} value={t.tipoDeGastoId}>
                  {t.nombre}
                </option>
              ))}
            </select>

            {/* DESCRIPCIÓN */}
            <input
              type="text"
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              placeholder="Descripción (opcional)"
              className="w-full p-2 border rounded"
            />

            <div className="flex gap-2">
              <button type="button" onClick={cancelarFormulario}>
                Cancelar
              </button>
              <button type="submit" disabled={!formularioValido}>
                Guardar
              </button>
            </div>

          </form>
        </div>
      )}

      {/* LISTA */}
      {loading ? (
        <p className="p-5 text-center">Cargando...</p>
      ) : gastos.length === 0 ? (
        <p className="p-5 text-center text-neutral-400">Sin gastos</p>
      ) : (
        <div>
          {gastos.map(g => (
            <div key={g.gastoId} className="flex justify-between p-3 border-b">
              <div>
                <p>{g.descripcion || g.tipoDeGastoNombre}</p>
                <small>{g.tipoDeGastoNombre}</small>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-danger">
                  -{formatCurrency(g.monto)}
                </span>

                <button onClick={() => handleEliminar(g.gastoId)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TOTAL */}
      {gastos.length > 0 && (
        <div className="p-3 bg-neutral-50 flex justify-between">
          <span>Total</span>
          <strong className="text-danger">
            {formatCurrency(totalGastos)}
          </strong>
        </div>
      )}
    </div>
  )
}
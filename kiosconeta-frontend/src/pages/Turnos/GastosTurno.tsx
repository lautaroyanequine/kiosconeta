import React, { useState, useEffect, useMemo } from 'react'
import { Plus, Trash2, AlertCircle, Wallet, X, ChevronDown } from 'lucide-react'
import { useEmpleadoActivo } from '@/contexts/EmpleadoActivoContext'
import { gastosApi, tiposGastoApi } from '@/apis/gastosApi'
import { formatCurrency } from '@/utils/formatters'
import type { GastoResponse, TipoDeGasto } from '@/types/gastoTurno'

interface GastosTurnoProps {
  cierreTurnoId: number
}

export const GastosTurno: React.FC<GastosTurnoProps> = ({ cierreTurnoId }) => {
  const { empleadoActivo: user } = useEmpleadoActivo()
  const { empleadoActivo } = useEmpleadoActivo()

  const [gastos, setGastos]         = useState<GastoResponse[]>([])
  const [tiposGasto, setTiposGasto] = useState<TipoDeGasto[]>([])
  const [loading, setLoading]       = useState(true)

  const [modalAbierto, setModalAbierto] = useState(false)

  const [descripcion, setDescripcion]   = useState('')
  const [monto, setMonto]               = useState('')
  const [tipoSeleccionado, setTipoSeleccionado] = useState<number | ''>('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError]               = useState('')
  const [eliminando, setEliminando]     = useState<number | null>(null)

  useEffect(() => { cargarDatos() }, [cierreTurnoId])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [gastosData, tiposData] = await Promise.all([
        gastosApi.getByTurno(cierreTurnoId),
        tiposGastoApi.getByKiosco((empleadoActivo?.kioscoId ?? user?.kioscoId)!),
      ])
      setGastos(gastosData)
      setTiposGasto(tiposData)
      if (tiposData.length > 0) setTipoSeleccionado(tiposData[0].tipoDeGastoId)
    } catch (err) {
      console.error('Error cargando gastos:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalGastos = useMemo(
    () => gastos.reduce((sum, g) => sum + g.monto, 0),
    [gastos]
  )

  const formularioValido =
    monto !== '' &&
    !isNaN(parseFloat(monto)) &&
    parseFloat(monto) > 0 &&
    tipoSeleccionado !== ''

  const limpiarYCerrar = () => {
    setDescripcion('')
    setMonto('')
    setError('')
    if (tiposGasto.length > 0) setTipoSeleccionado(tiposGasto[0].tipoDeGastoId)
    setModalAbierto(false)
  }

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formularioValido || !user) return

    setIsSubmitting(true)
    setError('')

    try {
      const tipo = tiposGasto.find(t => t.tipoDeGastoId === tipoSeleccionado)

      const nuevoGasto = await gastosApi.create({
        descripcion: descripcion.trim(),
        monto: parseFloat(monto),
        empleadoId: empleadoActivo?.empleadoId ?? user?.empleadoId,
        tipoDeGastoId: Number(tipoSeleccionado),
        cierreTurnoId,
      })

      setGastos(prev => [...prev, nuevoGasto])
      limpiarYCerrar()
    } catch (err: any) {
      setError(err.message || 'Error al registrar el gasto')
    } finally {
      setIsSubmitting(false)
    }
  }

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

  return (
    <>
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Wallet size={16} className="text-neutral-400" />
            <h3 className="text-sm font-semibold text-neutral-800">Gastos del turno</h3>
          </div>
          <button
            onClick={() => setModalAbierto(true)}
            className="flex items-center gap-1.5 text-xs text-primary font-medium
                       hover:bg-primary/5 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={13} />
            Agregar
          </button>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : gastos.length === 0 ? (
          <div className="text-center py-6 text-neutral-400">
            <p className="text-xs">Sin gastos en este turno</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {gastos.map(gasto => (
              <div key={gasto.gastoId}
                className="flex items-center gap-3 px-5 py-2.5 hover:bg-neutral-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded-full">
                      {gasto.tipoDeGastoNombre}
                    </span>
                  </div>
                  {gasto.descripcion && (
                    <p className="text-xs text-neutral-500 mt-1">{gasto.descripcion}</p>
                  )}
                  <p className="text-xs text-neutral-400">{gasto.fechaFormateada}</p>
                </div>

                <span className="text-sm font-bold text-danger">
                  -{formatCurrency(gasto.monto)}
                </span>

                <button
                  onClick={() => handleEliminar(gasto.gastoId)}
                  disabled={eliminando === gasto.gastoId}
                  className="text-neutral-300 hover:text-danger ml-1"
                >
                  {eliminando === gasto.gastoId
                    ? <div className="w-3.5 h-3.5 border-2 border-danger/40 border-t-danger rounded-full animate-spin" />
                    : <Trash2 size={14} />
                  }
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        {gastos.length > 0 && (
          <div className="flex justify-between items-center px-5 py-2.5 bg-neutral-50 border-t">
            <span className="text-xs text-neutral-600">Total gastos</span>
            <span className="text-sm font-bold text-danger">
              {formatCurrency(totalGastos)}
            </span>
          </div>
        )}
      </div>

      {/* MODAL */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4">

            <div className="flex justify-between px-6 py-4 border-b">
              <h3 className="font-bold">Registrar gasto</h3>
              <button onClick={limpiarYCerrar}><X size={18} /></button>
            </div>

            <form onSubmit={handleCrear} className="p-6 space-y-4">

              {/* Tipo */}
              <div>
                <label className="text-sm font-medium">Tipo *</label>
                <select
                  value={tipoSeleccionado}
                  onChange={e => setTipoSeleccionado(Number(e.target.value))}
                  className="w-full mt-1 p-2 border rounded-lg"
                >
                  {tiposGasto.map(t => (
                    <option key={t.tipoDeGastoId} value={t.tipoDeGastoId}>
                      {t.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Monto */}
              <div>
                <label className="text-sm font-medium">Monto *</label>
                <input
                  type="number"
                  value={monto}
                  onChange={e => setMonto(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-lg"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <input
                  type="text"
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={!formularioValido}
                className="w-full bg-primary text-white py-2 rounded-lg"
              >
                Guardar gasto
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
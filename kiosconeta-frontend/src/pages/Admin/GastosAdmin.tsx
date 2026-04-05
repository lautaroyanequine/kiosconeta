// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: GastosAdmin
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo } from 'react'
import {
  Plus, Trash2, AlertCircle, Wallet, X,
  ChevronDown, Tag, Edit2, ToggleLeft, ToggleRight
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { gastosApi, tiposGastoApi } from '@/apis/gastosApi'
import { formatCurrency } from '@/utils/formatters'
import type { GastoResponse, TipoDeGasto } from '@/types/gastoTurno'

export const GastosAdmin: React.FC = () => {
  const { user } = useAuth()

  const [gastos, setGastos]         = useState<GastoResponse[]>([])
  const [tiposGasto, setTiposGasto] = useState<TipoDeGasto[]>([])
  const [loading, setLoading]       = useState(true)

  const [modalGasto, setModalGasto]                 = useState(false)
  const [nombre, setNombre]                         = useState('')
  const [descripcion, setDescripcion]               = useState('')
  const [monto, setMonto]                           = useState('')
  const [tipoSeleccionado, setTipoSeleccionado]     = useState<number | ''>('')
  const [isSubmittingGasto, setIsSubmittingGasto]   = useState(false)
  const [errorGasto, setErrorGasto]                 = useState('')

  const [modalTipo, setModalTipo]                   = useState(false)
  const [tipoEditando, setTipoEditando]             = useState<TipoDeGasto | null>(null)
  const [tipoNombre, setTipoNombre]                 = useState('')
  const [tipoDescripcion, setTipoDescripcion]       = useState('')
  const [isSubmittingTipo, setIsSubmittingTipo]     = useState(false)
  const [errorTipo, setErrorTipo]                   = useState('')
  const [eliminando, setEliminando]                 = useState<number | null>(null)

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    if (!user?.kioscoId) return
    setLoading(true)
    try {
      const [gastosData, tiposData] = await Promise.all([
        gastosApi.getByKiosco(user.kioscoId),
        tiposGastoApi.getByKiosco(user.kioscoId),
      ])
      setGastos(gastosData.filter(g => !g.cierreTurnoId))
      setTiposGasto(tiposData)
      if (tiposData.length > 0) setTipoSeleccionado(tiposData[0].tipoDeGastoId)
    } catch (err) {
      console.error('Error cargando datos:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalGastos = useMemo(
    () => gastos.reduce((sum, g) => sum + g.monto, 0), [gastos]
  )

  const handleCrearGasto = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSubmittingGasto(true)
    setErrorGasto('')
    try {
      const nuevo = await gastosApi.create({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        monto: parseFloat(monto),
        empleadoId: user.empleadoId,
        tipoDeGastoId: Number(tipoSeleccionado),
      })
      setGastos(prev => [nuevo, ...prev])
      cerrarModalGasto()
    } catch (err: any) {
      setErrorGasto(err.message || 'Error al registrar el gasto')
    } finally {
      setIsSubmittingGasto(false)
    }
  }

  const cerrarModalGasto = () => {
    setNombre(''); setDescripcion(''); setMonto(''); setErrorGasto('')
    if (tiposGasto.length > 0) setTipoSeleccionado(tiposGasto[0].tipoDeGastoId)
    setModalGasto(false)
  }

  const handleEliminarGasto = async (gastoId: number) => {
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

  const abrirModalTipo = (tipo?: TipoDeGasto) => {
    setTipoEditando(tipo ?? null)
    setTipoNombre(tipo?.nombre ?? '')
    setTipoDescripcion(tipo?.descripcion ?? '')
    setErrorTipo('')
    setModalTipo(true)
  }

  const cerrarModalTipo = () => {
    setTipoEditando(null); setTipoNombre(''); setTipoDescripcion(''); setErrorTipo('')
    setModalTipo(false)
  }

  const handleGuardarTipo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tipoNombre.trim() || !user) return
    setIsSubmittingTipo(true)
    setErrorTipo('')
    try {
      if (tipoEditando) {
        const actualizado = await tiposGastoApi.update(tipoEditando.tipoDeGastoId, {
          tipoDeGastoId: tipoEditando.tipoDeGastoId,
          nombre: tipoNombre.trim(),
          descripcion: tipoDescripcion.trim(),
          kioscoId: user.kioscoId,
          activo: tipoEditando.activo,  // ← mantiene el estado actual
        })
        setTiposGasto(prev => prev.map(t =>
          t.tipoDeGastoId === tipoEditando.tipoDeGastoId ? actualizado : t
        ))
      } else {
        const nuevo = await tiposGastoApi.create({
          nombre: tipoNombre.trim(),
          descripcion: tipoDescripcion.trim(),
          kioscoId: user.kioscoId,
        })
        setTiposGasto(prev => [...prev, nuevo])
      }
      cerrarModalTipo()
    } catch (err: any) {
      setErrorTipo(err.message || 'Error al guardar el tipo de gasto')
    } finally {
      setIsSubmittingTipo(false)
    }
  }

  const handleToggleTipo = async (tipo: TipoDeGasto) => {
    try {
      await tiposGastoApi.toggleActivo(tipo.tipoDeGastoId, !tipo.activo)
      setTiposGasto(prev => prev.map(t =>
        t.tipoDeGastoId === tipo.tipoDeGastoId ? { ...t, activo: !t.activo } : t
      ))
    } catch {
      alert('Error al cambiar el estado del tipo de gasto')
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
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Panel izquierdo: Gastos */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-neutral-800">Gastos administrativos</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Gastos fuera del turno — compras, servicios, etc.</p>
            </div>
            <button
              onClick={() => setModalGasto(true)}
              disabled={tiposGasto.filter(t => t.activo).length === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all
                ${tiposGasto.filter(t => t.activo).length > 0
                  ? 'bg-primary text-white hover:bg-primary-600 active:scale-[0.98]'
                  : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'}`}
            >
              <Plus size={16} />
              Nuevo gasto
            </button>
          </div>

          {tiposGasto.length === 0 && (
            <div className="bg-warning-50 border border-warning-200 rounded-xl p-4 text-sm text-warning-700">
              ⚠️ Primero creá al menos un tipo de gasto en el panel de la derecha.
            </div>
          )}

          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            {gastos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Wallet size={48} className="mb-3 opacity-20" />
                <p className="text-sm text-neutral-400">No hay gastos administrativos registrados</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-neutral-100">
                  {gastos.map(gasto => (
                    <div key={gasto.gastoId}
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-neutral-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-neutral-800 truncate">{gasto.nombre}</p>
                          <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full shrink-0">
                            {gasto.tipoDeGastoNombre}
                          </span>
                        </div>
                        {gasto.descripcion && (
                          <p className="text-xs text-neutral-400 truncate mt-0.5">{gasto.descripcion}</p>
                        )}
                        <p className="text-xs text-neutral-400 mt-0.5">{gasto.fechaFormateada}</p>
                      </div>
                      <span className="text-sm font-bold text-danger shrink-0">
                        -{formatCurrency(gasto.monto)}
                      </span>
                      <button onClick={() => handleEliminarGasto(gasto.gastoId)}
                        disabled={eliminando === gasto.gastoId}
                        className="text-neutral-300 hover:text-danger transition-colors ml-1 shrink-0">
                        {eliminando === gasto.gastoId
                          ? <div className="w-4 h-4 border-2 border-danger/40 border-t-danger rounded-full animate-spin" />
                          : <Trash2 size={15} />}
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center px-5 py-3 bg-neutral-50 border-t border-neutral-200">
                  <span className="text-sm font-medium text-neutral-600">Total gastos admin</span>
                  <span className="text-base font-bold text-danger">{formatCurrency(totalGastos)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Panel derecho: Tipos de gasto */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-neutral-800">Tipos de gasto</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Personalizá las categorías</p>
            </div>
            <button onClick={() => abrirModalTipo()}
              className="flex items-center gap-1.5 text-sm text-primary font-medium
                         hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors">
              <Plus size={15} />
              Nuevo tipo
            </button>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            {tiposGasto.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Tag size={36} className="mb-3 opacity-20" />
                <p className="text-sm text-neutral-400">No hay tipos de gasto</p>
                <button onClick={() => abrirModalTipo()}
                  className="mt-3 text-xs text-primary font-medium hover:underline">
                  Crear el primero
                </button>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {tiposGasto.map(tipo => (
                  <div key={tipo.tipoDeGastoId}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors
                      ${!tipo.activo ? 'opacity-50' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-800 truncate">{tipo.nombre}</p>
                      <p className="text-xs text-neutral-400">
                        {tipo.cantidadGastos} gasto{tipo.cantidadGastos !== 1 ? 's' : ''} · {formatCurrency(tipo.totalGastos)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => abrirModalTipo(tipo)}
                        className="p-1.5 text-neutral-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleToggleTipo(tipo)}
                        className={`p-1.5 rounded-lg transition-colors
                          ${tipo.activo ? 'text-success hover:bg-success/10' : 'text-neutral-300 hover:bg-neutral-100'}`}>
                        {tipo.activo ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal nuevo gasto */}
      {modalGasto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">Nuevo gasto administrativo</h3>
              <button onClick={cerrarModalGasto} className="text-neutral-400 hover:text-neutral-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleCrearGasto} className="p-6 space-y-4">
              {errorGasto && (
                <div className="flex items-center gap-2 p-3 bg-danger-50 border border-danger-100 rounded-xl text-sm text-danger">
                  <AlertCircle size={14} className="shrink-0" />{errorGasto}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Nombre *</label>
                <input type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                  placeholder="Ej: Compra mayorista en Hangar" autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm
                             outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Monto *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
                    <input type="number" value={monto} onChange={e => setMonto(e.target.value)}
                      placeholder="0" min="0.01" step="0.01"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-neutral-300 text-sm
                                 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Tipo *</label>
                  <div className="relative">
                    <select value={tipoSeleccionado} onChange={e => setTipoSeleccionado(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm
                                 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                                 appearance-none bg-white">
                      {tiposGasto.filter(t => t.activo).map(t => (
                        <option key={t.tipoDeGastoId} value={t.tipoDeGastoId}>{t.nombre}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Descripción <span className="text-neutral-400 font-normal">(opcional)</span>
                </label>
                <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)}
                  placeholder="Detalle adicional..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm
                             outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={cerrarModalGasto}
                  className="flex-1 py-2.5 text-sm text-neutral-600 border border-neutral-300 rounded-xl hover:bg-neutral-50">
                  Cancelar
                </button>
                <button type="submit" disabled={!nombre.trim() || !monto || isSubmittingGasto}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all
                    ${nombre.trim() && monto && !isSubmittingGasto
                      ? 'bg-primary text-white hover:bg-primary-600'
                      : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'}`}>
                  {isSubmittingGasto ? 'Guardando...' : 'Guardar gasto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal tipo de gasto */}
      {modalTipo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">
                {tipoEditando ? 'Editar tipo de gasto' : 'Nuevo tipo de gasto'}
              </h3>
              <button onClick={cerrarModalTipo} className="text-neutral-400 hover:text-neutral-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleGuardarTipo} className="p-6 space-y-4">
              {errorTipo && (
                <div className="flex items-center gap-2 p-3 bg-danger-50 border border-danger-100 rounded-xl text-sm text-danger">
                  <AlertCircle size={14} className="shrink-0" />{errorTipo}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Nombre *</label>
                <input type="text" value={tipoNombre} onChange={e => setTipoNombre(e.target.value)}
                  placeholder="Ej: Compras mayoristas, Servicios, etc." autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm
                             outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Descripción <span className="text-neutral-400 font-normal">(opcional)</span>
                </label>
                <input type="text" value={tipoDescripcion} onChange={e => setTipoDescripcion(e.target.value)}
                  placeholder="Descripción del tipo de gasto..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm
                             outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={cerrarModalTipo}
                  className="flex-1 py-2.5 text-sm text-neutral-600 border border-neutral-300 rounded-xl hover:bg-neutral-50">
                  Cancelar
                </button>
                <button type="submit" disabled={!tipoNombre.trim() || isSubmittingTipo}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all
                    ${tipoNombre.trim() && !isSubmittingTipo
                      ? 'bg-primary text-white hover:bg-primary-600'
                      : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'}`}>
                  {isSubmittingTipo ? 'Guardando...' : tipoEditando ? 'Guardar cambios' : 'Crear tipo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
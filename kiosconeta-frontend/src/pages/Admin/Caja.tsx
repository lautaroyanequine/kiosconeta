// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: Caja
// Resumen del estado financiero del negocio.
// Muestra saldo actual, ventas, gastos y movimientos manuales.
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react'
import {
  DollarSign, TrendingUp, TrendingDown, Wallet,
  Plus, Trash2, AlertCircle, X, ChevronDown,
  RefreshCw, Edit2
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import apiClient, { handleResponse, handleError } from '@/apis/client'
import { formatCurrency } from '@/utils/formatters'

// ────────────────────────────────────────────────────────────────────────────
// TIPOS
// ────────────────────────────────────────────────────────────────────────────

interface MovimientoCaja {
  movimientoCajaId: number
  fecha: string
  fechaFormateada: string
  descripcion: string
  monto: number
  tipo: number        // 1 = Ingreso, 2 = Egreso
  tipoNombre: string
  empleadoNombre: string
}

interface CajaResumen {
  saldoInicial: number
  saldoActual: number
  totalVentasEfectivo: number
  totalVentasVirtual: number
  totalVentas: number
  totalGastos: number
  gananciaTotal: number
  cantidadVentas: number
  totalIngresosManual: number
  totalEgresosManual: number
  movimientos: MovimientoCaja[]
}

// ────────────────────────────────────────────────────────────────────────────
// API
// ────────────────────────────────────────────────────────────────────────────

const cajaApi = {
  getResumen: async (kioscoId: number): Promise<CajaResumen> => {
    try {
      const r = await apiClient.get<CajaResumen>(`/Caja/kiosco/${kioscoId}`)
      return handleResponse(r)
    } catch (e) { return handleError(e) }
  },
  createMovimiento: async (kioscoId: number, data: {
    descripcion: string; monto: number; tipo: number; empleadoId: number
  }): Promise<MovimientoCaja> => {
    try {
      const r = await apiClient.post<MovimientoCaja>(
        `/Caja/kiosco/${kioscoId}/movimientos`, data)
      return handleResponse(r)
    } catch (e) { return handleError(e) }
  },
  deleteMovimiento: async (id: number): Promise<void> => {
    try {
      const r = await apiClient.delete(`/Caja/movimientos/${id}`)
      return handleResponse(r)
    } catch (e) { return handleError(e) }
  },
  updateSaldoInicial: async (kioscoId: number, data: {
    saldoInicial: number; empleadoId: number
  }): Promise<CajaResumen> => {
    try {
      const r = await apiClient.put<CajaResumen>(
        `/Caja/kiosco/${kioscoId}/saldo-inicial`, data)
      return handleResponse(r)
    } catch (e) { return handleError(e) }
  },
}

// ────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTE: TarjetaResumen
// ────────────────────────────────────────────────────────────────────────────

const TarjetaResumen: React.FC<{
  label: string
  valor: number
  icono: React.ReactNode
  color?: 'primary' | 'success' | 'danger' | 'neutral'
  grande?: boolean
}> = ({ label, valor, icono, color = 'neutral', grande }) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success-50 text-success-700',
    danger:  'bg-danger-50 text-danger',
    neutral: 'bg-neutral-100 text-neutral-500',
  }

  return (
    <div className={`bg-white rounded-xl border border-neutral-200 p-4
      ${grande ? 'col-span-2' : ''}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {icono}
        </div>
        <p className="text-xs text-neutral-500 font-medium">{label}</p>
      </div>
      <p className={`font-bold ${grande ? 'text-3xl' : 'text-xl'} text-neutral-900`}>
        {formatCurrency(valor)}
      </p>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════════════════════

export const Caja: React.FC = () => {
  const { user } = useAuth()

  const [resumen, setResumen]         = useState<CajaResumen | null>(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')

  // ── Modal movimiento ──────────────────────────────────────────────────────
  const [modalMovimiento, setModalMovimiento] = useState(false)
  const [movDescripcion, setMovDescripcion]   = useState('')
  const [movMonto, setMovMonto]               = useState('')
  const [movTipo, setMovTipo]                 = useState<1 | 2>(1)  // 1=Ingreso, 2=Egreso
  const [isSubmittingMov, setIsSubmittingMov] = useState(false)
  const [errorMov, setErrorMov]               = useState('')

  // ── Modal saldo inicial ───────────────────────────────────────────────────
  const [modalSaldo, setModalSaldo]       = useState(false)
  const [nuevoSaldo, setNuevoSaldo]       = useState('')
  const [isSubmittingSaldo, setIsSubmittingSaldo] = useState(false)
  const [errorSaldo, setErrorSaldo]       = useState('')

  // ── Eliminar ──────────────────────────────────────────────────────────────
  const [eliminando, setEliminando]       = useState<number | null>(null)

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    if (!user?.kioscoId) return
    setLoading(true)
    setError('')
    try {
      const data = await cajaApi.getResumen(user.kioscoId)
      setResumen(data)
    } catch (err: any) {
      setError(err.message || 'Error al cargar caja')
    } finally {
      setLoading(false)
    }
  }

  // ── Registrar movimiento ──────────────────────────────────────────────────
  const handleCrearMovimiento = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSubmittingMov(true)
    setErrorMov('')
    try {
      const nuevo = await cajaApi.createMovimiento(user.kioscoId, {
        descripcion: movDescripcion.trim(),
        monto: parseFloat(movMonto),
        tipo: movTipo,
        empleadoId: user.empleadoId,
      })
      setResumen(prev => prev ? {
        ...prev,
        movimientos: [nuevo, ...prev.movimientos],
        saldoActual: movTipo === 1
          ? prev.saldoActual + nuevo.monto
          : prev.saldoActual - nuevo.monto,
        totalIngresosManual: movTipo === 1
          ? prev.totalIngresosManual + nuevo.monto
          : prev.totalIngresosManual,
        totalEgresosManual: movTipo === 2
          ? prev.totalEgresosManual + nuevo.monto
          : prev.totalEgresosManual,
      } : prev)
      cerrarModalMovimiento()
    } catch (err: any) {
      setErrorMov(err.message || 'Error al registrar movimiento')
    } finally {
      setIsSubmittingMov(false)
    }
  }

  const cerrarModalMovimiento = () => {
    setMovDescripcion(''); setMovMonto(''); setMovTipo(1); setErrorMov('')
    setModalMovimiento(false)
  }

  // ── Eliminar movimiento ───────────────────────────────────────────────────
  const handleEliminar = async (mov: MovimientoCaja) => {
    setEliminando(mov.movimientoCajaId)
    try {
      await cajaApi.deleteMovimiento(mov.movimientoCajaId)
      setResumen(prev => prev ? {
        ...prev,
        movimientos: prev.movimientos.filter(m => m.movimientoCajaId !== mov.movimientoCajaId),
        saldoActual: mov.tipo === 1
          ? prev.saldoActual - mov.monto
          : prev.saldoActual + mov.monto,
        totalIngresosManual: mov.tipo === 1
          ? prev.totalIngresosManual - mov.monto
          : prev.totalIngresosManual,
        totalEgresosManual: mov.tipo === 2
          ? prev.totalEgresosManual - mov.monto
          : prev.totalEgresosManual,
      } : prev)
    } catch (err: any) {
      alert(err.message || 'Error al eliminar movimiento')
    } finally {
      setEliminando(null)
    }
  }

  // ── Actualizar saldo inicial ──────────────────────────────────────────────
  const handleActualizarSaldo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSubmittingSaldo(true)
    setErrorSaldo('')
    try {
      const actualizado = await cajaApi.updateSaldoInicial(user.kioscoId, {
        saldoInicial: parseFloat(nuevoSaldo),
        empleadoId: user.empleadoId,
      })
      setResumen(actualizado)
      setModalSaldo(false)
      setNuevoSaldo('')
    } catch (err: any) {
      setErrorSaldo(err.message || 'Error al actualizar saldo')
    } finally {
      setIsSubmittingSaldo(false)
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

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-danger-50 border border-danger-100
                      rounded-xl text-sm text-danger">
        <AlertCircle size={16} className="shrink-0" />
        {error}
      </div>
    )
  }

  if (!resumen) return null

  return (
    <>
      <div className="space-y-6">

        {/* ── SALDO ACTUAL ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-neutral-800">Estado de la caja</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setNuevoSaldo(resumen.saldoInicial.toString()); setModalSaldo(true) }}
                className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-primary
                           px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-primary
                           transition-colors"
              >
                <Edit2 size={13} />
                Editar saldo inicial
              </button>
              <button
                onClick={cargar}
                className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-700
                           px-3 py-1.5 rounded-lg border border-neutral-200 transition-colors"
              >
                <RefreshCw size={13} />
                Actualizar
              </button>
            </div>
          </div>

          {/* Tarjetas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <TarjetaResumen
              label="Saldo actual"
              valor={resumen.saldoActual}
              icono={<DollarSign size={16} />}
              color={resumen.saldoActual >= 0 ? 'success' : 'danger'}
              grande
            />
            <TarjetaResumen
              label="Saldo inicial"
              valor={resumen.saldoInicial}
              icono={<Wallet size={16} />}
              color="neutral"
            />
            <TarjetaResumen
              label="Total ventas"
              valor={resumen.totalVentas}
              icono={<TrendingUp size={16} />}
              color="primary"
            />
            <TarjetaResumen
              label="Ganancia"
              valor={resumen.gananciaTotal}
              icono={<TrendingUp size={16} />}
              color="success"
            />
          </div>

          {/* Detalle en filas */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-neutral-50 rounded-xl p-3">
              <p className="text-xs text-neutral-400 mb-1">Ventas efectivo</p>
              <p className="text-sm font-bold text-neutral-800">{formatCurrency(resumen.totalVentasEfectivo)}</p>
            </div>
            <div className="bg-neutral-50 rounded-xl p-3">
              <p className="text-xs text-neutral-400 mb-1">Ventas virtual</p>
              <p className="text-sm font-bold text-neutral-800">{formatCurrency(resumen.totalVentasVirtual)}</p>
            </div>
            <div className="bg-neutral-50 rounded-xl p-3">
              <p className="text-xs text-neutral-400 mb-1">Cantidad ventas</p>
              <p className="text-sm font-bold text-neutral-800">{resumen.cantidadVentas}</p>
            </div>
            <div className="bg-danger-50 rounded-xl p-3">
              <p className="text-xs text-neutral-400 mb-1">Total gastos</p>
              <p className="text-sm font-bold text-danger">{formatCurrency(resumen.totalGastos)}</p>
            </div>
            <div className="bg-success-50 rounded-xl p-3">
              <p className="text-xs text-neutral-400 mb-1">Ingresos manuales</p>
              <p className="text-sm font-bold text-success-700">{formatCurrency(resumen.totalIngresosManual)}</p>
            </div>
            <div className="bg-danger-50 rounded-xl p-3">
              <p className="text-xs text-neutral-400 mb-1">Egresos manuales</p>
              <p className="text-sm font-bold text-danger">{formatCurrency(resumen.totalEgresosManual)}</p>
            </div>
          </div>
        </div>

        {/* ── MOVIMIENTOS MANUALES ──────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-800">Movimientos manuales</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Ingresos y egresos registrados fuera del sistema
              </p>
            </div>
            <button
              onClick={() => setModalMovimiento(true)}
              className="flex items-center gap-1.5 text-sm text-primary font-medium
                         hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={15} />
              Nuevo movimiento
            </button>
          </div>

          {resumen.movimientos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-neutral-300">
              <Wallet size={40} className="mb-3 opacity-30" />
              <p className="text-sm text-neutral-400">No hay movimientos registrados</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {resumen.movimientos.map(mov => (
                <div key={mov.movimientoCajaId}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-neutral-50 transition-colors">

                  {/* Icono tipo */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                    ${mov.tipo === 1 ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger'}`}>
                    {mov.tipo === 1
                      ? <TrendingUp size={15} />
                      : <TrendingDown size={15} />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800 truncate">{mov.descripcion}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium
                        ${mov.tipo === 1
                          ? 'bg-success-50 text-success-700'
                          : 'bg-danger-50 text-danger'}`}>
                        {mov.tipoNombre}
                      </span>
                      <span className="text-xs text-neutral-400">{mov.fechaFormateada}</span>
                    </div>
                  </div>

                  {/* Monto */}
                  <span className={`text-sm font-bold shrink-0
                    ${mov.tipo === 1 ? 'text-success-700' : 'text-danger'}`}>
                    {mov.tipo === 1 ? '+' : '-'}{formatCurrency(mov.monto)}
                  </span>

                  {/* Eliminar */}
                  <button
                    onClick={() => handleEliminar(mov)}
                    disabled={eliminando === mov.movimientoCajaId}
                    className="text-neutral-300 hover:text-danger transition-colors ml-1 shrink-0"
                  >
                    {eliminando === mov.movimientoCajaId
                      ? <div className="w-4 h-4 border-2 border-danger/40 border-t-danger rounded-full animate-spin" />
                      : <Trash2 size={15} />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL NUEVO MOVIMIENTO ────────────────────────────────────────── */}
      {modalMovimiento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">Nuevo movimiento</h3>
              <button onClick={cerrarModalMovimiento} className="text-neutral-400 hover:text-neutral-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCrearMovimiento} className="p-6 space-y-4">
              {errorMov && (
                <div className="flex items-center gap-2 p-3 bg-danger-50 border border-danger-100
                                rounded-xl text-sm text-danger">
                  <AlertCircle size={14} className="shrink-0" />
                  {errorMov}
                </div>
              )}

              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Tipo *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMovTipo(1)}
                    className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all
                      ${movTipo === 1
                        ? 'border-success bg-success-50 text-success-700'
                        : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'}`}
                  >
                    ↑ Ingreso
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovTipo(2)}
                    className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all
                      ${movTipo === 2
                        ? 'border-danger bg-danger-50 text-danger'
                        : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'}`}
                  >
                    ↓ Egreso
                  </button>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Descripción *
                </label>
                <input
                  type="text"
                  value={movDescripcion}
                  onChange={e => setMovDescripcion(e.target.value)}
                  placeholder={movTipo === 1 ? 'Ej: Depósito bancario' : 'Ej: Pago de servicio'}
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm
                             outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              {/* Monto */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Monto *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
                  <input
                    type="number"
                    value={movMonto}
                    onChange={e => setMovMonto(e.target.value)}
                    placeholder="0"
                    min="0.01"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-neutral-300 text-sm
                               outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={cerrarModalMovimiento}
                  className="flex-1 py-2.5 text-sm text-neutral-600 border border-neutral-300
                             rounded-xl hover:bg-neutral-50 transition-colors">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!movDescripcion.trim() || !movMonto || isSubmittingMov}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all
                    ${movDescripcion.trim() && movMonto && !isSubmittingMov
                      ? movTipo === 1
                        ? 'bg-success text-white hover:bg-success-600'
                        : 'bg-danger text-white hover:bg-danger-600'
                      : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'}`}
                >
                  {isSubmittingMov ? 'Guardando...' : `Registrar ${movTipo === 1 ? 'ingreso' : 'egreso'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL SALDO INICIAL ───────────────────────────────────────────── */}
      {modalSaldo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">Editar saldo inicial</h3>
              <button onClick={() => setModalSaldo(false)} className="text-neutral-400 hover:text-neutral-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleActualizarSaldo} className="p-6 space-y-4">
              {errorSaldo && (
                <div className="flex items-center gap-2 p-3 bg-danger-50 border border-danger-100
                                rounded-xl text-sm text-danger">
                  <AlertCircle size={14} className="shrink-0" />
                  {errorSaldo}
                </div>
              )}

              <p className="text-sm text-neutral-500">
                El saldo inicial es el dinero que había en caja al comenzar. Se recalcula el saldo actual automáticamente.
              </p>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Saldo inicial *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
                  <input
                    type="number"
                    value={nuevoSaldo}
                    onChange={e => setNuevoSaldo(e.target.value)}
                    placeholder="0"
                    min="0"
                    autoFocus
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-neutral-300 text-sm
                               outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalSaldo(false)}
                  className="flex-1 py-2.5 text-sm text-neutral-600 border border-neutral-300
                             rounded-xl hover:bg-neutral-50 transition-colors">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={nuevoSaldo === '' || isSubmittingSaldo}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all
                    ${nuevoSaldo !== '' && !isSubmittingSaldo
                      ? 'bg-primary text-white hover:bg-primary-600'
                      : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'}`}
                >
                  {isSubmittingSaldo ? 'Guardando...' : 'Actualizar saldo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

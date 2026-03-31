// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: TurnoAbierto
// Muestra el resumen del turno en curso y el formulario para cerrarlo.
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useMemo } from 'react'
import {
  TrendingUp, DollarSign, Wallet, Clock,
  AlertCircle, Users, Smartphone,
  CheckCircle2, AlertTriangle
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useEmpleadoActivo } from '@/contexts/EmpleadoActivoContext'
import { turnosApi } from '@/apis/turnosApi'
import { formatCurrency } from '@/utils/formatters'
import { GastosTurno } from './GastosTurno'
import type { TurnoActual, CierreTurnoResponse } from '@/types/gastoTurno'

// ────────────────────────────────────────────────────────────────────────────
// TIPOS
// ────────────────────────────────────────────────────────────────────────────

interface TurnoAbiertoProps {
  turno: TurnoActual
  onCerrado: () => void
}

// ────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTE: FilaResumen
// ────────────────────────────────────────────────────────────────────────────

const FilaResumen: React.FC<{
  label: string
  valor: number
  icono: React.ReactNode
  destacado?: boolean
  colorValor?: string
}> = ({ label, valor, icono, destacado, colorValor }) => (
  <div className={`flex items-center justify-between py-3 border-b border-neutral-100 last:border-0
    ${destacado ? 'font-bold' : ''}`}>
    <div className="flex items-center gap-2 text-neutral-600">
      <span className="text-neutral-400">{icono}</span>
      <span className={`text-sm ${destacado ? 'font-semibold text-neutral-800' : ''}`}>
        {label}
      </span>
    </div>
    <span className={`text-sm font-semibold ${colorValor || (destacado ? 'text-primary text-base' : 'text-neutral-800')}`}>
      {formatCurrency(valor)}
    </span>
  </div>
)

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════════════════════

export const TurnoAbierto: React.FC<TurnoAbiertoProps> = ({ turno, onCerrado }) => {
  const { user } = useAuth()
  const { liberarEmpleado } = useEmpleadoActivo()

  // ── Estado del formulario ─────────────────────────────────────────────────
  const [efectivoContado, setEfectivoContado]     = useState('')
  const [virtualAcreditado, setVirtualAcreditado] = useState('')
  const [observaciones, setObservaciones]         = useState('')
  const [isSubmitting, setIsSubmitting]           = useState(false)
  const [error, setError]                         = useState('')
  const [confirmando, setConfirmando]             = useState(false)
  const [turnoFinalizado, setTurnoFinalizado]     = useState<CierreTurnoResponse | null>(null)

  // ── Diferencia en tiempo real ─────────────────────────────────────────────
  const diferencia = useMemo(() => {
    const contado = parseFloat(efectivoContado)
    if (isNaN(contado)) return null
    return contado - turno.efectivoEsperado
  }, [efectivoContado, turno.efectivoEsperado])

  // ── Validación ────────────────────────────────────────────────────────────
  const puedesCerrar = efectivoContado !== '' &&
    !isNaN(parseFloat(efectivoContado)) &&
    parseFloat(efectivoContado) >= 0

  // ── Cerrar turno ──────────────────────────────────────────────────────────
  const handleCerrar = async () => {
    if (!user || !puedesCerrar) return

    setIsSubmitting(true)
    setError('')

    try {
      const resultado = await turnosApi.cerrar(user.kioscoId, {
        turnoId: turno.turnoId,
        turnoNombre: turno.turnoNombre ?? '',   // ← nombre real del turno
        efectivoContado: parseFloat(efectivoContado),
        virtualAcreditado: parseFloat(virtualAcreditado) || 0,
        observaciones: observaciones || undefined,
      })
          console.log ('Resultado BACKEND',resultado)
      if(!resultado){ throw new Error('El backend no devolvio datos del cierre')}
      setTurnoFinalizado(resultado as any)
      setConfirmando(false)
    } catch (err: any) {
      setError(err.message || 'Error al cerrar el turno')
      setConfirmando(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col bg-neutral-50 overflow-hidden">

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Muestra el nombre del turno (Mañana/Tarde/Noche) */}
            <h1 className="text-xl font-bold text-neutral-900">
              Turno {turno.turnoNombre || 'en curso'}
            </h1>
            <span className="flex items-center gap-1.5 text-xs bg-success-50 text-success-700
                             px-2.5 py-1 rounded-full font-medium">
              <Clock size={12} />
              Desde {turno.fechaAperturaFormateada}
            </span>
          </div>

          {/* Empleados del turno */}
          {turno.empleados?.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Users size={15} />
              <span>{turno.empleados.join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── CONTENIDO ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6">

        {/* ── PANEL IZQUIERDO: Resumen + Gastos (scrolleable) ───────────── */}
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">

          {/* Tarjetas rápidas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 border border-neutral-200">
              <p className="text-xs text-neutral-500 mb-1">Ventas realizadas</p>
              <p className="text-3xl font-bold text-neutral-900">{turno.cantidadVentas}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-neutral-200">
              <p className="text-xs text-neutral-500 mb-1">Total vendido</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(turno.totalVentas)}</p>
            </div>
          </div>

          {/* Detalle */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">Detalle del turno</h3>
            <FilaResumen label="Efectivo inicial"          valor={turno.efectivoInicial}  icono={<DollarSign size={15} />} />
            <FilaResumen label="Ventas en efectivo"        valor={turno.totalEfectivo}    icono={<DollarSign size={15} />} />
            <FilaResumen label="Ventas virtuales"          valor={turno.totalVirtual}     icono={<Smartphone size={15} />} />
            <FilaResumen label="Gastos del turno"          valor={turno.totalGastos}      icono={<Wallet size={15} />} colorValor="text-danger" />
            <FilaResumen label="Total ventas"              valor={turno.totalVentas}      icono={<TrendingUp size={15} />} />
            <FilaResumen label="Efectivo esperado en caja" valor={turno.efectivoEsperado} icono={<DollarSign size={15} />} destacado />
          </div>

          {/* Gastos del turno */}
          <GastosTurno cierreTurnoId={turno.cierreTurnoId} />

        </div>

        {/* ── PANEL DERECHO: Formulario de cierre ───────────────────────── */}
        <div className="w-[400px] shrink-0 flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-neutral-200 p-5 flex-1">
            <h3 className="text-base font-bold text-neutral-800 mb-5">Cerrar turno</h3>

            {error && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-danger-50 border
                              border-danger-100 rounded-xl text-sm text-danger">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-4">

              {/* Efectivo contado */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Efectivo contado en caja
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-medium">$</span>
                  <input
                    type="number"
                    value={efectivoContado}
                    onChange={e => setEfectivoContado(e.target.value)}
                    placeholder="0"
                    min="0"
                    autoFocus
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-neutral-300 text-sm
                               outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>

                {/* Diferencia en tiempo real */}
                {diferencia !== null && (
                  <div className={`mt-2 flex items-center justify-between px-3 py-2 rounded-lg text-sm
                    ${diferencia >= 0 ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger'}`}>
                    <span>
                      {diferencia === 0 ? '✓ Cuadra exacto' : diferencia > 0 ? 'Sobran' : 'Faltan'}
                    </span>
                    {diferencia !== 0 && (
                      <span className="font-bold">{formatCurrency(Math.abs(diferencia))}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Virtual acreditado */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Virtual acreditado
                  <span className="text-neutral-400 font-normal ml-1">(transferencias + débito)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-medium">$</span>
                  <input
                    type="number"
                    value={virtualAcreditado}
                    onChange={e => setVirtualAcreditado(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-neutral-300 text-sm
                               outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Observaciones
                  <span className="text-neutral-400 font-normal ml-1">(opcional)</span>
                </label>
                <textarea
                  value={observaciones}
                  onChange={e => setObservaciones(e.target.value)}
                  placeholder="Ej: faltó cambio chico, se rompió la cinta de la caja..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm
                             outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                             resize-none"
                />
              </div>

              {/* Botón cerrar con confirmación */}
              {!confirmando ? (
                <button
                  onClick={() => setConfirmando(true)}
                  disabled={!puedesCerrar}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all mt-2
                    ${puedesCerrar
                      ? 'bg-danger text-white hover:bg-danger-600 active:scale-[0.98]'
                      : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'}`}
                >
                  Cerrar Turno
                </button>
              ) : (
                <div className="bg-warning-50 border border-warning-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-warning-700">
                    <AlertTriangle size={16} />
                    <p className="text-sm font-semibold">¿Confirmar cierre del turno?</p>
                  </div>
                  <p className="text-xs text-warning-600">
                    Esta acción no se puede deshacer. El turno quedará cerrado.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmando(false)}
                      className="flex-1 py-2 rounded-lg border border-neutral-300 text-sm text-neutral-600 hover:bg-neutral-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleCerrar}
                      disabled={isSubmitting}
                      className="flex-1 py-2 rounded-lg bg-danger text-white text-sm
                                 font-semibold hover:bg-danger-600 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Cerrando...</>
                      ) : (
                        <><CheckCircle2 size={15} /> Sí, cerrar turno</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL TURNO FINALIZADO ───────────────────────────────────────── */}
      {turnoFinalizado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-scale-in">

            {/* Header verde */}
            <div className="bg-success px-6 py-5 text-white text-center">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={32} className="text-white" />
              </div>
              <h2 className="text-xl font-bold">¡Turno finalizado!</h2>
              {/* Nombre del turno y fecha */}
              <p className="text-white/90 font-semibold mt-1">
                Turno {turnoFinalizado.turnoNombre}
              </p>
              <p className="text-white/70 text-sm mt-0.5">
                {turnoFinalizado.fechaFormateada}
              </p>
              {/* Empleados que trabajaron */}
              {turnoFinalizado.empleados?.length > 0 && (
                <div className="flex items-center justify-center gap-1.5 mt-2 text-white/80 text-xs">
                  <Users size={12} />
                  <span>{turnoFinalizado.empleados.map(e => e.empleadoNombre).join(', ')}</span>
                </div>
              )}
            </div>

            {/* Resumen del cierre */}
            <div className="p-6 space-y-3">

              {/* Stats rápidos */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-neutral-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-neutral-500 mb-1">Ventas</p>
                  <p className="text-2xl font-bold text-neutral-900">{turnoFinalizado.cantidadVentas}</p>
                </div>
                <div className="bg-primary/5 rounded-xl p-3 text-center">
                  <p className="text-xs text-neutral-500 mb-1">Total vendido</p>
                  <p className="text-lg font-bold text-primary">{formatCurrency(turnoFinalizado.totalVentas)}</p>
                </div>
              </div>

              {/* Detalle */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-neutral-100">
                  <span className="text-neutral-500">Efectivo en ventas</span>
                  <span className="font-medium">{formatCurrency(turnoFinalizado.totalEfectivo)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-100">
                  <span className="text-neutral-500">Virtual en ventas</span>
                  <span className="font-medium">{formatCurrency(turnoFinalizado.totalVirtual)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-100">
                  <span className="text-neutral-500">Gastos</span>
                  <span className="font-medium text-danger">{formatCurrency(turnoFinalizado.totalGastos)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-100">
                  <span className="text-neutral-500">Efectivo esperado</span>
                  <span className="font-medium">{formatCurrency(turnoFinalizado.montoEsperado)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-100">
                  <span className="text-neutral-500">Efectivo contado</span>
                  <span className="font-medium">{formatCurrency(turnoFinalizado.montoReal)}</span>
                </div>

                {/* Diferencia */}
                <div className={`flex justify-between py-2.5 px-3 rounded-xl font-semibold
                  ${turnoFinalizado.diferencia === 0
                    ? 'bg-success-50 text-success-700'
                    : turnoFinalizado.diferencia > 0
                    ? 'bg-success-50 text-success-700'
                    : 'bg-danger-50 text-danger'}`}>
                  <span>
                    {turnoFinalizado.diferencia === 0
                      ? '✓ Cuadra exacto'
                      : turnoFinalizado.diferencia > 0
                      ? 'Sobrante' : 'Faltante'}
                  </span>
                  {turnoFinalizado.diferencia !== 0 && (
                    <span>{formatCurrency(Math.abs(turnoFinalizado.diferencia))}</span>
                  )}
                </div>
              </div>

              {/* Observaciones */}
              {turnoFinalizado.observaciones && (
                <div className="bg-neutral-50 rounded-xl p-3">
                  <p className="text-xs text-neutral-500 mb-1">Observaciones</p>
                  <p className="text-sm text-neutral-700">{turnoFinalizado.observaciones}</p>
                </div>
              )}
            </div>

            {/* Botón OK */}
            <div className="px-6 pb-6">
              <button
                onClick={() => {
                  setTurnoFinalizado(null)
                  onCerrado()
                  liberarEmpleado() // volver a pantalla de selección de empleado
                }}
                className="w-full py-3 bg-primary text-white rounded-xl font-bold
                           hover:bg-primary-600 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
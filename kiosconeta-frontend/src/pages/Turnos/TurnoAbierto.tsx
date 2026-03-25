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

  const [efectivoContado, setEfectivoContado]     = useState('')
  const [virtualAcreditado, setVirtualAcreditado] = useState('')
  const [observaciones, setObservaciones]         = useState('')
  const [isSubmitting, setIsSubmitting]           = useState(false)
  const [error, setError]                         = useState('')
  const [confirmando, setConfirmando]             = useState(false)
  const [turnoFinalizado, setTurnoFinalizado]     = useState<CierreTurnoResponse | null>(null)

  const diferencia = useMemo(() => {
    const contado = parseFloat(efectivoContado)
    if (isNaN(contado)) return null
    return contado - turno.efectivoEsperado
  }, [efectivoContado, turno.efectivoEsperado])

  const puedesCerrar = efectivoContado !== '' &&
    !isNaN(parseFloat(efectivoContado)) &&
    parseFloat(efectivoContado) >= 0

  const handleCerrar = async () => {
    if (!user || !puedesCerrar) return

    setIsSubmitting(true)
    setError('')

    try {
      const resultado = await turnosApi.cerrar(user.kioscoId, {
        turnoId: turno.cierreTurnoId,
        turnoNombre: turno.turnoNombre ?? '',
        efectivoContado: parseFloat(efectivoContado),
        virtualAcreditado: parseFloat(virtualAcreditado) || 0,
        observaciones: observaciones || undefined,
      })
      setTurnoFinalizado(resultado as any)
      setConfirmando(false)
    } catch (err: any) {
      setError(err.message || 'Error al cerrar el turno')
      setConfirmando(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-neutral-50 overflow-hidden">

      {/* HEADER */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-neutral-900">
              Turno {turno.turnoNombre || 'en curso'}
            </h1>
            <span className="flex items-center gap-1.5 text-xs bg-success-50 text-success-700 px-2.5 py-1 rounded-full font-medium">
              <Clock size={12} />
              Desde {turno.fechaAperturaFormateada}
            </span>
          </div>

          {turno.empleados?.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Users size={15} />
              <span>{turno.empleados.join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6 min-h-0">

        {/* IZQUIERDA */}
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 min-h-0">

          {/* Tarjetas */}
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
            <FilaResumen label="Efectivo inicial" valor={turno.efectivoInicial} icono={<DollarSign size={15} />} />
            <FilaResumen label="Ventas en efectivo" valor={turno.totalEfectivo} icono={<DollarSign size={15} />} />
            <FilaResumen label="Ventas virtuales" valor={turno.totalVirtual} icono={<Smartphone size={15} />} />
            <FilaResumen label="Gastos del turno" valor={turno.totalGastos} icono={<Wallet size={15} />} colorValor="text-danger" />
            <FilaResumen label="Total ventas" valor={turno.totalVentas} icono={<TrendingUp size={15} />} />
            <FilaResumen label="Efectivo esperado en caja" valor={turno.efectivoEsperado} icono={<DollarSign size={15} />} destacado />
          </div>

          {/* GASTOS */}
          <GastosTurno cierreTurnoId={turno.cierreTurnoId} />

        </div>

        {/* DERECHA */}
        <div className="w-[400px] shrink-0 flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-neutral-200 p-5 flex-1 overflow-y-auto">

            <h3 className="text-base font-bold text-neutral-800 mb-5">Cerrar turno</h3>

            {error && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-danger-50 border border-danger-100 rounded-xl text-sm text-danger">
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            <div className="space-y-4">

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
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-neutral-300 text-sm
                               outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>

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

              <button
                onClick={() => setConfirmando(true)}
                disabled={!puedesCerrar}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all mt-2
                  ${puedesCerrar
                    ? 'bg-danger text-white hover:bg-danger-600'
                    : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'}`}
              >
                Cerrar Turno
              </button>

            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
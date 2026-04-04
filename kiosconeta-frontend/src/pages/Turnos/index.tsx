import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, History } from 'lucide-react'
import { useEmpleadoActivo } from '@/contexts/EmpleadoActivoContext'
import { turnosApi } from '@/apis/turnosApi'
import { TurnoAbierto } from './TurnoAbierto'
import { HistorialTurnos } from './HistorialTurnos'
import { ROUTES } from '@/utils/constants'
import { Spinner } from '@/components/commons'
import type { TurnoActual } from '@/types/gastoTurno'

// ── Sin turno ─────────────────────────────────────────────────────────────

const SinTurno: React.FC = () => {
  const navigate = useNavigate()
  const [verHistorial, setVerHistorial] = useState(false)

  return (
    <div className="h-full flex flex-col bg-neutral-50 overflow-y-auto">

      {/* Tabs */}
      <div className="border-b border-neutral-200 bg-white px-6">
        <div className="flex gap-0">
          <button
            onClick={() => setVerHistorial(false)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              !verHistorial
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <Clock size={15} />
            Turno actual
          </button>
          <button
            onClick={() => setVerHistorial(true)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              verHistorial
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <History size={15} />
            Historial
          </button>
        </div>
      </div>

      {verHistorial ? (
        <div className="max-w-4xl mx-auto w-full px-6 py-6">
          <HistorialTurnos />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
            <Clock size={40} className="text-neutral-400" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">No hay turno abierto</h2>
          <p className="text-neutral-500 mb-8">
            Para registrar ventas primero abrí el turno desde el Punto de Venta.
          </p>
          <button
            onClick={() => navigate(ROUTES.POS)}
            className="px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors"
          >
            Ir al POS
          </button>
        </div>
      )}

    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────

const TurnosPage: React.FC = () => {
  const { empleadoActivo: user } = useEmpleadoActivo()
  const { empleadoActivo } = useEmpleadoActivo()
  const [turnoActual, setTurnoActual] = useState<TurnoActual | null>(null)
  const [loading, setLoading] = useState(true)
  const [verHistorial, setVerHistorial] = useState(false)

  useEffect(() => {
    if (user) cargarTurno()
  }, [user])

  const cargarTurno = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await turnosApi.getActual(empleadoActivo?.kioscoId ?? user?.kioscoId)
      setTurnoActual(data as any)
    } catch {
      setTurnoActual(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Spinner />

  if (!turnoActual) return <SinTurno />

  return (
    <div className="h-full flex flex-col bg-neutral-50 overflow-y-auto">

      {/* Tabs */}
      <div className="border-b border-neutral-200 bg-white px-6">
        <div className="flex gap-0">
          <button
            onClick={() => setVerHistorial(false)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              !verHistorial
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <Clock size={15} />
            Turno actual
          </button>
          <button
            onClick={() => setVerHistorial(true)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              verHistorial
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <History size={15} />
            Historial
          </button>
        </div>
      </div>

      {/* Contenido */}
      {verHistorial ? (
        <div className="max-w-4xl mx-auto w-full px-6 py-6">
          <HistorialTurnos />
        </div>
      ) : (
        <TurnoAbierto turno={turnoActual} onCerrado={cargarTurno} />
      )}

    </div>
  )
}

export default TurnosPage
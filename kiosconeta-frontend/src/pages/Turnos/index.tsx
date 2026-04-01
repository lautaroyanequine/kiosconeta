import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock } from 'lucide-react'
import { useEmpleadoActivo } from '@/contexts/EmpleadoActivoContext'
import { useEmpleadoActivo } from '@/contexts/EmpleadoActivoContext';
import { turnosApi } from '@/apis/turnosApi'
import { TurnoAbierto } from './TurnoAbierto'
import { HistorialTurnos } from './HistorialTurnos'
import { ROUTES } from '@/utils/constants'
import { Spinner } from '@/components/commons'
import type { TurnoActual } from '@/types/gastoTurno'

// ── Sin turno ─────────────────────────────────────────────────────────────

const SinTurno: React.FC = () => {
  const navigate = useNavigate()
  return (
    <div className="h-full flex flex-col bg-neutral-50 overflow-y-auto">
      {/* Aviso sin turno */}
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
          className="px-8 py-3 bg-primary text-white rounded-xl font-semibold
                     hover:bg-primary-600 transition-colors"
        >
          Ir al POS
        </button>
      </div>

      {/* Historial de turnos cerrados */}
      <div className="max-w-4xl mx-auto w-full px-6 pb-8">
        <h2 className="text-base font-bold text-neutral-800 mb-4">Historial de turnos</h2>
        <HistorialTurnos />
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────

const TurnosPage: React.FC = () => {
  const { empleadoActivo: user } = useEmpleadoActivo()
  const { empleadoActivo } = useEmpleadoActivo()
  const [turnoActual, setTurnoActual] = useState<TurnoActual | null>(null)
  const [loading, setLoading] = useState(true)

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

   if (loading) {
     <Spinner></Spinner>
   }

  if (!turnoActual) return <SinTurno></SinTurno>

  return (
    <TurnoAbierto
      turno={turnoActual}
      onCerrado={cargarTurno}
    />
  )
}

export default TurnosPage
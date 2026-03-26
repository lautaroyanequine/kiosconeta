import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { turnosApi } from '@/apis/turnosApi'
import { TurnoAbierto } from './TurnoAbierto'
import { ROUTES } from '@/utils/constants'
import type { TurnoActual } from '@/types/gastoTurno'
import { Spinner } from '@/components/commons'
// ── Sin turno ─────────────────────────────────────────────────────────────

const SinTurno: React.FC = () => {
  const navigate = useNavigate()
  return (
    <div className="h-full flex items-center justify-center bg-neutral-50">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
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
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────

const TurnosPage: React.FC = () => {
  const { user } = useAuth()
  const [turnoActual, setTurnoActual] = useState<TurnoActual | null>(null)
  const [loading, setLoading] = useState(true)

  // ← Solo se ejecuta al montar — SIN turnoActual como dependencia
  useEffect(() => {
    if (user) cargarTurno()
  }, [user])

  const cargarTurno = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await turnosApi.getActual(user.kioscoId)
      setTurnoActual(data as any)
    } catch {
      setTurnoActual(null)
    } finally {
      setLoading(false)
    }
  }

  // Loading
 if (loading) {
     <Spinner></Spinner>
   }
  if (!turnoActual) return <SinTurno />

  // ← onCerrado llama cargarTurno — el modal ya se mostró en TurnoAbierto
  // cargarTurno recarga el estado → turnoActual pasa a null → muestra SinTurno
  return (
    <TurnoAbierto
      turno={turnoActual}
      onCerrado={cargarTurno}
    />
  )
}

export default TurnosPage
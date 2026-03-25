import React, { useState, useEffect } from 'react'
import { SinTurno } from './SinTurno'
import { useAuth } from '@/contexts/AuthContext'
import { turnosApi } from '@/apis/turnosApi'
import { TurnoAbierto } from './TurnoAbierto'
import type { TurnoActual } from '@/types/gastoTurno'
import { Spinner } from '@/components/commons'

// ── Componente sin turno ──────────────────────────────────────────────────



// ── Página principal ──────────────────────────────────────────────────────

const TurnosPage: React.FC = () => {
  const { user } = useAuth()
  const [turnoActual, setTurnoActual] = useState<TurnoActual | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) cargarTurno()
  }, [user,turnoActual])

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

const handleTurnoCerrado = () => {
  setTurnoActual(null) // opcional (para UI)
  // NO LLAMAR cargarTurno acá inmediatamente
}

return (
  <TurnoAbierto
    turno={turnoActual}
    onCerrado={handleTurnoCerrado}
  />
)
}

export default TurnosPage
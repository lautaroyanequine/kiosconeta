import React, { useState, useEffect } from 'react'
import { SinTurno } from './SinTurno'
import { useAuth } from '@/contexts/AuthContext'
import { turnosApi } from '@/apis/turnosApi'
import { TurnoAbierto } from './TurnoAbierto'
import type { TurnoActual } from '@/types/gastoTurno'

// ── Componente sin turno ──────────────────────────────────────────────────



// ── Página principal ──────────────────────────────────────────────────────

const TurnosPage: React.FC = () => {
  const { user } = useAuth()
  const [turnoActual, setTurnoActual] = useState<TurnoActual | null>(null)
  const [loading, setLoading] = useState(true)

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
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-500">Cargando turno...</p>
        </div>
      </div>
    )
  }

  if (!turnoActual) return <SinTurno />

  return <TurnoAbierto turno={turnoActual} onCerrado={cargarTurno} />
}

export default TurnosPage
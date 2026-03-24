import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { gastosApi } from '@/apis/gastosApi'
import type { Gasto, GastoResponse } from '@/types'
import {Spinner} from '@/components/commons'

const GastosPage: React.FC = () => {
  const { user } = useAuth()

  const [gastos, setGastos] = useState<GastoResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ─────────────────────────────
  // CARGAR GASTOS
  // ─────────────────────────────
  const cargarGastos = async () => {
    setLoading(true)
    setError('')

    try {
      const data = await gastosApi.getByKiosco(user!.kioscoId)
      setGastos(data)
    } catch (err) {
      console.error(err)
      setError('Error al cargar gastos')
    } finally {
      setLoading(false)
    }
  }

  // ─────────────────────────────
  // INIT
  // ─────────────────────────────
  useEffect(() => {
    cargarGastos()
  }, [])

  // ─────────────────────────────
  // RENDER
  // ─────────────────────────────
  if (loading) return <Spinner />

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Gastos</h1>

      {error && <p className="text-red-500">{error}</p>}

      {/* Acá después va la tabla */}
      <div>
        {gastos.length === 0 ? (
          <p>No hay gastos registrados</p>
        ) : (
          gastos.map((gasto) => (
            <div key={gasto.gastoId}>
              {gasto.descripcion} - ${gasto.monto}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default GastosPage
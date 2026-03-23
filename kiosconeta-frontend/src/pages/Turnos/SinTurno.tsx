import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock } from 'lucide-react'
import { ROUTES } from '@/utils/constants'

export const SinTurno: React.FC = () => {
  const navigate = useNavigate()
  return (
    <div className="h-full flex items-center justify-center bg-neutral-50">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock size={40} className="text-neutral-400" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-800 mb-2">
          No hay turno abierto
        </h2>
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
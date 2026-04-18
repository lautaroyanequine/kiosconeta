import React, { useState } from 'react'
import { Wallet, Users, DollarSign, Shield } from 'lucide-react'
import { GastosAdmin } from './GastosAdmin'
import { Sueldos } from './Sueldos'
import { Caja } from './Caja'
import Auditoria from './Auditoria'

const TABS = [
  { id: 'gastos',    label: 'Gastos',    icon: <Wallet size={16} />,     disponible: true },
  { id: 'sueldos',  label: 'Sueldos',   icon: <Users size={16} />,      disponible: true },
  { id: 'caja',     label: 'Caja',      icon: <DollarSign size={16} />, disponible: true },
  { id: 'auditoria',label: 'Auditoría', icon: <Shield size={16} />,     disponible: true },
]

const AdminPage: React.FC = () => {
  const [tabActiva, setTabActiva] = useState('gastos')

  return (
    <div className="h-full flex flex-col bg-neutral-50 overflow-hidden">

      {/* Header con tabs */}
      <div className="bg-white border-b border-neutral-200 px-6 pt-5 pb-0 shrink-0">
        <h1 className="text-xl font-bold text-neutral-900 mb-4">Administración</h1>
        <div className="flex gap-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => tab.disponible && setTabActiva(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                border-b-2 transition-all rounded-t-lg
                ${tab.id === tabActiva
                  ? 'border-primary text-primary bg-primary/5'
                  : tab.disponible
                  ? 'border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
                  : 'border-transparent text-neutral-300 cursor-not-allowed'
                }
              `}
            >
              {tab.icon}
              {tab.label}
              {!tab.disponible && (
                <span className="text-xs bg-neutral-100 text-neutral-400 px-1.5 py-0.5 rounded-full">
                  Pronto
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto p-6">
        {tabActiva === 'gastos'    && <GastosAdmin />}
        {tabActiva === 'sueldos'   && <Sueldos />}
        {tabActiva === 'caja'      && <Caja />}
        {tabActiva === 'auditoria' && <Auditoria />}
      </div>
    </div>
  )
}

export default AdminPage
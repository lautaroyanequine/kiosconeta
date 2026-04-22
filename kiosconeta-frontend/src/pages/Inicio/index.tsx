// ════════════════════════════════════════════════════════════════════════════
// PAGE: Inicio — Bienvenida al sistema Kiosconeta
// ════════════════════════════════════════════════════════════════════════════

import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingCart, Clock, BarChart2, Package,
  Users, Settings, ArrowRight, Store
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/utils/constants'

// ────────────────────────────────────────────────────────────────────────────
// ACCESOS RÁPIDOS
// ────────────────────────────────────────────────────────────────────────────

const AccesoRapido: React.FC<{
  icono: React.ReactNode
  titulo: string
  descripcion: string
  ruta: string
  color: string
  destacado?: boolean
}> = ({ icono, titulo, descripcion, ruta, color, destacado }) => {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(ruta)}
      className={`flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all
        hover:shadow-md active:scale-[0.98] group w-full
        ${destacado
          ? 'border-primary bg-primary text-white hover:bg-primary-600'
          : 'border-neutral-200 bg-white hover:border-primary/40'}`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icono}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-bold text-base ${destacado ? 'text-white' : 'text-neutral-900'}`}>
          {titulo}
        </p>
        <p className={`text-sm mt-0.5 ${destacado ? 'text-white/70' : 'text-neutral-500'}`}>
          {descripcion}
        </p>
      </div>
      <ArrowRight size={18} className={`shrink-0 transition-transform group-hover:translate-x-1
        ${destacado ? 'text-white/70' : 'text-neutral-300'}`}/>
    </button>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

const InicioPage: React.FC = () => {
  const { user } = useAuth()

  const hora = new Date().getHours()
  const saludo = hora < 12 ? '¡Buenos días' : hora < 18 ? '¡Buenas tardes' : '¡Buenas noches'

  return (
    <div className="h-full overflow-y-auto bg-neutral-50">
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* BIENVENIDA */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shrink-0">
            <Store size={32} className="text-white"/>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              {saludo}, {user?.nombre || 'bienvenido'}!
            </h1>
            <p className="text-neutral-500 mt-1">
              Bienvenido a <span className="font-semibold text-primary">Kiosconeta</span> — tu sistema de gestión de kiosco.
            </p>
          </div>
        </div>

        {/* DESCRIPCIÓN */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 mb-8">
          <h2 className="text-base font-bold text-neutral-800 mb-3">¿Qué podés hacer hoy?</h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Kiosconeta te permite gestionar todos los aspectos de tu negocio desde un solo lugar.
            Registrá ventas, controlá tu stock, llevá el seguimiento de turnos y gastos,
            y analizá el rendimiento del negocio con métricas en tiempo real.
          </p>
        </div>

        {/* ACCESOS RÁPIDOS */}
        <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wide mb-4">
          Accesos rápidos
        </h2>

        <div className="space-y-3">
          {/* POS — destacado */}
          <AccesoRapido
            icono={<ShoppingCart size={24} className="text-white"/>}
            titulo="Punto de Venta"
            descripcion="Registrá ventas, cobrá y gestioná el turno"
            ruta={ROUTES.POS}
            color="bg-white/20"
            destacado
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AccesoRapido
              icono={<Clock size={22} className="text-primary"/>}
              titulo="Turnos"
              descripcion="Abrí, cerrá y revisá el historial"
              ruta={ROUTES.TURNOS}
              color="bg-primary/10"
            />
            <AccesoRapido
              icono={<Package size={22} className="text-warning-700"/>}
              titulo="Productos"
              descripcion="Gestioná el catálogo y el stock"
              ruta={ROUTES.PRODUCTOS}
              color="bg-warning-50"
            />
            <AccesoRapido
              icono={<BarChart2 size={22} className="text-success-700"/>}
              titulo="Dashboard"
              descripcion="Métricas y análisis del negocio"
              ruta={ROUTES.DASHBOARD}
              color="bg-success-50"
            />
            <AccesoRapido
              icono={<Settings size={22} className="text-neutral-500"/>}
              titulo="Administración"
              descripcion="Gastos, sueldos, caja y auditoría"
              ruta={ROUTES.ADMIN}
              color="bg-neutral-100"
            />
          </div>
        </div>

        {/* PIE */}
        <p className="text-xs text-neutral-400 text-center mt-10">
          Kiosconeta · Sistema de gestión para kioscos
        </p>
      </div>
    </div>
  )
}

export default InicioPage
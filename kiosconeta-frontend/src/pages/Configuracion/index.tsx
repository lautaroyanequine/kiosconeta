// ════════════════════════════════════════════════════════════════════════════
// PAGE: Configuración
// Secciones: datos del kiosco, cambiar contraseña, información del admin
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react'
import {
  Store, Lock, User, CheckCircle, AlertCircle,
  Eye, EyeOff, Save, RefreshCw,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useEmpleadoActivo } from '@/contexts/EmpleadoActivoContext'
import apiClient, { handleResponse, handleError } from '@/apis/client'
import { authApi } from '@/apis/authApi'
import { Input, Button } from '@/components/commons'

// ────────────────────────────────────────────────────────────────────────────
// TIPOS
// ────────────────────────────────────────────────────────────────────────────

interface KioscoData {
  kioscoId: number
  nombre: string
  direccion: string | null
}

// ────────────────────────────────────────────────────────────────────────────
// COMPONENTE: Sección con título y contenido
// ────────────────────────────────────────────────────────────────────────────

const Seccion: React.FC<{
  icono: React.ReactNode
  titulo: string
  descripcion: string
  children: React.ReactNode
}> = ({ icono, titulo, descripcion, children }) => (
  <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
    <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        {icono}
      </div>
      <div>
        <h2 className="text-sm font-bold text-neutral-900">{titulo}</h2>
        <p className="text-xs text-neutral-500">{descripcion}</p>
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
)

// ────────────────────────────────────────────────────────────────────────────
// COMPONENTE: Feedback de éxito / error
// ────────────────────────────────────────────────────────────────────────────

const Feedback: React.FC<{ tipo: 'exito' | 'error'; mensaje: string }> = ({ tipo, mensaje }) => (
  <div className={`flex items-center gap-2 p-3 rounded-lg text-sm mt-4 ${
    tipo === 'exito'
      ? 'bg-green-50 border border-green-200 text-green-700'
      : 'bg-red-50 border border-red-200 text-red-700'
  }`}>
    {tipo === 'exito'
      ? <CheckCircle size={15} />
      : <AlertCircle size={15} />}
    {mensaje}
  </div>
)

// ────────────────────────────────────────────────────────────────────────────
// SECCIÓN: Datos del kiosco
// ────────────────────────────────────────────────────────────────────────────

const SeccionKiosco: React.FC<{ kioscoId: number }> = ({ kioscoId }) => {
  const [nombre, setNombre]       = useState('')
  const [direccion, setDireccion] = useState('')
  const [cargando, setCargando]   = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [feedback, setFeedback]   = useState<{ tipo: 'exito' | 'error'; msg: string } | null>(null)

  useEffect(() => { cargar() }, [kioscoId])

  const cargar = async () => {
    setCargando(true)
    try {
      const r = await apiClient.get<KioscoData>(`/Kiosco/${kioscoId}`)
      const data = handleResponse(r)
      setNombre(data.nombre)
      setDireccion(data.direccion ?? '')
    } catch (err: any) {
      setFeedback({ tipo: 'error', msg: 'No se pudieron cargar los datos del kiosco' })
    } finally {
      setCargando(false)
    }
  }

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      setFeedback({ tipo: 'error', msg: 'El nombre del kiosco es obligatorio' })
      return
    }
    setGuardando(true)
    setFeedback(null)
    try {
      await apiClient.put(`/Kiosco/${kioscoId}`, {
        nombre: nombre.trim(),
        direccion: direccion.trim() || null,
      })
      setFeedback({ tipo: 'exito', msg: 'Datos del kiosco actualizados correctamente' })
    } catch (err: any) {
      setFeedback({ tipo: 'error', msg: err.message || 'Error al guardar los cambios' })
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <div className="flex items-center gap-2 text-sm text-neutral-400">
        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        Cargando...
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-md">
      <Input
        label="Nombre del kiosco"
        value={nombre}
        onChange={e => { setNombre(e.target.value); setFeedback(null) }}
        placeholder="Ej: Kiosco El Sol"
        required
      />
      <Input
        label="Dirección"
        value={direccion}
        onChange={e => { setDireccion(e.target.value); setFeedback(null) }}
        placeholder="Ej: Av. Corrientes 1234, Buenos Aires"
        helperText="Opcional"
      />
      <div className="flex items-center gap-2 pt-1">
        <Button
          variant="primary"
          leftIcon={<Save size={15} />}
          onClick={handleGuardar}
          loading={guardando}
        >
          Guardar cambios
        </Button>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<RefreshCw size={13} />}
          onClick={cargar}
        >
          Recargar
        </Button>
      </div>
      {feedback && <Feedback tipo={feedback.tipo} mensaje={feedback.msg} />}
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// SECCIÓN: Cambiar contraseña
// ────────────────────────────────────────────────────────────────────────────

const SeccionPassword: React.FC = () => {
  const [actual, setActual]       = useState('')
  const [nueva, setNueva]         = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [mostrarActual, setMostrarActual] = useState(false)
  const [mostrarNueva, setMostrarNueva]   = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [feedback, setFeedback]   = useState<{ tipo: 'exito' | 'error'; msg: string } | null>(null)

  const handleGuardar = async () => {
    setFeedback(null)

    if (!actual || !nueva || !confirmar) {
      setFeedback({ tipo: 'error', msg: 'Completá todos los campos' })
      return
    }
    if (nueva.length < 6) {
      setFeedback({ tipo: 'error', msg: 'La nueva contraseña debe tener al menos 6 caracteres' })
      return
    }
    if (nueva !== confirmar) {
      setFeedback({ tipo: 'error', msg: 'La nueva contraseña y la confirmación no coinciden' })
      return
    }
    if (nueva === actual) {
      setFeedback({ tipo: 'error', msg: 'La nueva contraseña debe ser diferente a la actual' })
      return
    }

    setGuardando(true)
    try {
      await authApi.cambiarPassword({ passwordActual: actual, passwordNuevo: nueva })
      setFeedback({ tipo: 'exito', msg: 'Contraseña cambiada correctamente' })
      setActual(''); setNueva(''); setConfirmar('')
    } catch (err: any) {
      setFeedback({ tipo: 'error', msg: err.message || 'Error al cambiar la contraseña' })
    } finally {
      setGuardando(false)
    }
  }

  const ToggleIcon = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
    <button
      type="button"
      onClick={onToggle}
      className="text-neutral-400 hover:text-neutral-600 transition-colors"
    >
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  )

  return (
    <div className="space-y-4 max-w-md">
      <Input
        label="Contraseña actual"
        type={mostrarActual ? 'text' : 'password'}
        value={actual}
        onChange={e => { setActual(e.target.value); setFeedback(null) }}
        placeholder="Tu contraseña actual"
        rightIcon={<ToggleIcon show={mostrarActual} onToggle={() => setMostrarActual(v => !v)} />}
        required
      />
      <Input
        label="Nueva contraseña"
        type={mostrarNueva ? 'text' : 'password'}
        value={nueva}
        onChange={e => { setNueva(e.target.value); setFeedback(null) }}
        placeholder="Mínimo 6 caracteres"
        rightIcon={<ToggleIcon show={mostrarNueva} onToggle={() => setMostrarNueva(v => !v)} />}
        helperText="Mínimo 6 caracteres"
        required
      />
      <Input
        label="Confirmar nueva contraseña"
        type="password"
        value={confirmar}
        onChange={e => { setConfirmar(e.target.value); setFeedback(null) }}
        placeholder="Repetí la nueva contraseña"
        error={confirmar && nueva !== confirmar ? 'Las contraseñas no coinciden' : undefined}
        required
      />
      <div className="pt-1">
        <Button
          variant="primary"
          leftIcon={<Lock size={15} />}
          onClick={handleGuardar}
          loading={guardando}
          disabled={!actual || !nueva || !confirmar}
        >
          Cambiar contraseña
        </Button>
      </div>
      {feedback && <Feedback tipo={feedback.tipo} mensaje={feedback.msg} />}
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// SECCIÓN: Información del perfil (solo lectura + datos útiles)
// ────────────────────────────────────────────────────────────────────────────

const SeccionPerfil: React.FC = () => {
  const { empleadoActivo } = useEmpleadoActivo()
  const { user } = useAuth()

  const campo = (label: string, valor: string | undefined | null) => (
    <div className="flex items-start gap-3 py-3 border-b border-neutral-100 last:border-0">
      <span className="text-sm text-neutral-500 w-36 shrink-0">{label}</span>
      <span className="text-sm font-medium text-neutral-900">{valor || '—'}</span>
    </div>
  )

  return (
    <div className="max-w-md">
      <div className="rounded-lg border border-neutral-200 divide-y divide-neutral-100 overflow-hidden">
        <div className="px-4">
          {campo('Nombre', empleadoActivo?.nombre)}
          {campo('Email', user?.email)}
          {campo('Rol', empleadoActivo?.esAdmin ? 'Administrador' : 'Empleado')}
          {campo('Kiosco ID', String(empleadoActivo?.kioscoId ?? '—'))}
          {campo('Empleado ID', String(empleadoActivo?.empleadoId ?? '—'))}
        </div>
      </div>
      <p className="text-xs text-neutral-400 mt-3">
        Para cambiar tu nombre o email contactá al administrador del sistema.
      </p>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// PAGE PRINCIPAL
// ────────────────────────────────────────────────────────────────────────────

const ConfiguracionPage: React.FC = () => {
  const { empleadoActivo } = useEmpleadoActivo()

  return (
    <div className="p-6 space-y-6 max-w-3xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Configuración</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Gestioná los datos de tu kiosco y tu cuenta
        </p>
      </div>

      {/* Datos del kiosco */}
      <Seccion
        icono={<Store size={17} />}
        titulo="Datos del kiosco"
        descripcion="Nombre y dirección que aparecen en los reportes"
      >
        <SeccionKiosco kioscoId={empleadoActivo?.kioscoId ?? 1} />
      </Seccion>

      {/* Cambiar contraseña */}
      <Seccion
        icono={<Lock size={17} />}
        titulo="Cambiar contraseña"
        descripcion="Contraseña de acceso del administrador"
      >
        <SeccionPassword />
      </Seccion>

      {/* Perfil */}
      <Seccion
        icono={<User size={17} />}
        titulo="Mi perfil"
        descripcion="Información de tu cuenta"
      >
        <SeccionPerfil />
      </Seccion>

    </div>
  )
}

export default ConfiguracionPage
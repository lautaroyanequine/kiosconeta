// ════════════════════════════════════════════════════════════════════════════
// PAGE: Registro — Crear kiosco + admin por primera vez
// Flujo en 3 pasos: Kiosco → Admin → PIN
// ════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react'
import { Store, User, Lock, Eye, EyeOff, CheckCircle, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react'
import { Input, Button } from '@/components/commons'
import { authApi } from '@/apis/authApi'
import { useAuth } from '@/contexts/AuthContext'
import { isValidEmail } from '@/utils'

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

interface FormData {
  // Paso 1: Kiosco
  nombreKiosco: string
  direccionKiosco: string
  // Paso 2: Admin
  nombreAdmin: string
  email: string
  password: string
  confirmarPassword: string
  // Paso 3: PIN
  pin: string
  confirmarPin: string
}

type Paso = 1 | 2 | 3

// ────────────────────────────────────────────────────────────────────────────
// COMPONENTE: Indicador de pasos
// ────────────────────────────────────────────────────────────────────────────

const IndicadorPasos: React.FC<{ pasoActual: Paso }> = ({ pasoActual }) => {
  const pasos = [
    { num: 1, label: 'Tu kiosco', icono: <Store size={16} /> },
    { num: 2, label: 'Tu cuenta', icono: <User size={16} /> },
    { num: 3, label: 'PIN de acceso', icono: <Lock size={16} /> },
  ]

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {pasos.map((paso, i) => {
        const completado = pasoActual > paso.num
        const activo     = pasoActual === paso.num
        return (
          <React.Fragment key={paso.num}>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center
                transition-all duration-200 ${
                  completado ? 'bg-green-500 text-white' :
                  activo     ? 'bg-primary text-white' :
                               'bg-neutral-200 text-neutral-400'
                }`}>
                {completado ? <CheckCircle size={18} /> : paso.icono}
              </div>
              <span className={`text-xs font-medium ${
                activo ? 'text-primary' : completado ? 'text-green-600' : 'text-neutral-400'
              }`}>
                {paso.label}
              </span>
            </div>
            {i < pasos.length - 1 && (
              <div className={`w-12 h-0.5 mb-4 transition-colors ${
                pasoActual > paso.num ? 'bg-green-400' : 'bg-neutral-200'
              }`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// PASO 1: Datos del kiosco
// ────────────────────────────────────────────────────────────────────────────

const Paso1: React.FC<{
  data: FormData
  onChange: (field: keyof FormData, value: string) => void
  onSiguiente: () => void
}> = ({ data, onChange, onSiguiente }) => {
  const [errores, setErrores] = useState<Partial<FormData>>({})

  const validar = () => {
    const e: Partial<FormData> = {}
    if (!data.nombreKiosco.trim()) e.nombreKiosco = 'El nombre del kiosco es obligatorio'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Store size={28} className="text-primary" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900">¿Cómo se llama tu kiosco?</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Este nombre aparecerá en los reportes y tickets
        </p>
      </div>

      <Input
        label="Nombre del kiosco"
        placeholder="Ej: Kiosco El Sol, Kiosconeta 24hs..."
        value={data.nombreKiosco}
        onChange={e => { onChange('nombreKiosco', e.target.value); setErrores({}) }}
        error={errores.nombreKiosco}
        leftIcon={<Store size={16} />}
        required
        autoFocus
      />
      <Input
        label="Dirección"
        placeholder="Ej: Av. Corrientes 1234, Buenos Aires"
        value={data.direccionKiosco}
        onChange={e => onChange('direccionKiosco', e.target.value)}
        helperText="Opcional"
      />

      <Button
        variant="primary"
        fullWidth
        rightIcon={<ArrowRight size={16} />}
        onClick={() => validar() && onSiguiente()}
        className="mt-2"
      >
        Continuar
      </Button>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// PASO 2: Datos del admin
// ────────────────────────────────────────────────────────────────────────────

const Paso2: React.FC<{
  data: FormData
  onChange: (field: keyof FormData, value: string) => void
  onSiguiente: () => void
  onAtras: () => void
}> = ({ data, onChange, onSiguiente, onAtras }) => {
  const [errores, setErrores]         = useState<Partial<FormData>>({})
  const [mostrarPass, setMostrarPass] = useState(false)

  const validar = () => {
    const e: Partial<FormData> = {}
    if (!data.nombreAdmin.trim()) e.nombreAdmin = 'Tu nombre es obligatorio'
    if (!data.email.trim())       e.email       = 'El email es obligatorio'
    else if (!isValidEmail(data.email)) e.email = 'El email no es válido'
    if (!data.password)           e.password    = 'La contraseña es obligatoria'
    else if (data.password.length < 6) e.password = 'Mínimo 6 caracteres'
    if (data.password !== data.confirmarPassword) e.confirmarPassword = 'Las contraseñas no coinciden'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <User size={28} className="text-primary" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900">Creá tu cuenta de admin</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Con estos datos vas a iniciar sesión
        </p>
      </div>

      <Input
        label="Tu nombre"
        placeholder="Ej: Juan García"
        value={data.nombreAdmin}
        onChange={e => { onChange('nombreAdmin', e.target.value); setErrores(p => ({ ...p, nombreAdmin: undefined })) }}
        error={errores.nombreAdmin}
        leftIcon={<User size={16} />}
        required
        autoFocus
      />
      <Input
        label="Email"
        type="email"
        placeholder="admin@mikiosco.com"
        value={data.email}
        onChange={e => { onChange('email', e.target.value); setErrores(p => ({ ...p, email: undefined })) }}
        error={errores.email}
        required
      />
      <Input
        label="Contraseña"
        type={mostrarPass ? 'text' : 'password'}
        placeholder="Mínimo 6 caracteres"
        value={data.password}
        onChange={e => { onChange('password', e.target.value); setErrores(p => ({ ...p, password: undefined })) }}
        error={errores.password}
        rightIcon={
          <button type="button" onClick={() => setMostrarPass(v => !v)} className="text-neutral-400 hover:text-neutral-600">
            {mostrarPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
        required
      />
      <Input
        label="Confirmar contraseña"
        type="password"
        placeholder="Repetí la contraseña"
        value={data.confirmarPassword}
        onChange={e => { onChange('confirmarPassword', e.target.value); setErrores(p => ({ ...p, confirmarPassword: undefined })) }}
        error={errores.confirmarPassword}
        required
      />

      <div className="flex gap-2 mt-2">
        <Button variant="outline" leftIcon={<ArrowLeft size={16} />} onClick={onAtras}>
          Atrás
        </Button>
        <Button
          variant="primary"
          fullWidth
          rightIcon={<ArrowRight size={16} />}
          onClick={() => validar() && onSiguiente()}
        >
          Continuar
        </Button>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// PASO 3: PIN del admin
// ────────────────────────────────────────────────────────────────────────────

const Paso3: React.FC<{
  data: FormData
  onChange: (field: keyof FormData, value: string) => void
  onRegistrar: () => void
  onAtras: () => void
  isLoading: boolean
  apiError: string
}> = ({ data, onChange, onRegistrar, onAtras, isLoading, apiError }) => {
  const [errores, setErrores] = useState<Partial<FormData>>({})

  // Helpers de input PIN numérico
  const handlePinChange = (field: 'pin' | 'confirmarPin', value: string) => {
    if (/^\d{0,6}$/.test(value)) {
      onChange(field, value)
      setErrores(p => ({ ...p, [field]: undefined }))
    }
  }

  const validar = () => {
    const e: Partial<FormData> = {}
    // PIN es opcional, pero si se ingresa debe ser válido
    if (data.pin && data.pin.length < 4) e.pin = 'El PIN debe tener al menos 4 dígitos'
    if (data.pin && data.pin !== data.confirmarPin) e.confirmarPin = 'Los PINs no coinciden'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (validar()) onRegistrar()
  }

  // Muestra círculos rellenos según dígitos ingresados
  const PinDisplay: React.FC<{ value: string; max?: number }> = ({ value, max = 6 }) => (
    <div className="flex gap-2 justify-center my-2">
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} className={`w-3 h-3 rounded-full border-2 transition-all ${
          i < value.length ? 'bg-primary border-primary' : 'border-neutral-300'
        }`} />
      ))}
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Lock size={28} className="text-primary" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900">PIN de acceso rápido</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Usás el PIN para entrar al sistema sin escribir la contraseña
        </p>
      </div>

      {/* PIN */}
      <div className="input-group w-full">
        <label className="input-label block mb-1">
          PIN <span className="text-neutral-400 font-normal">(opcional)</span>
        </label>
        <input
          type="password"
          inputMode="numeric"
          placeholder="4 a 6 dígitos"
          value={data.pin}
          onChange={e => handlePinChange('pin', e.target.value)}
          className={`px-4 py-2 border rounded-md w-full text-center text-2xl tracking-widest
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20
            ${errores.pin ? 'border-danger' : 'border-neutral-300 focus:border-primary'}`}
          autoFocus
        />
        <PinDisplay value={data.pin} />
        {errores.pin && <span className="input-error">{errores.pin}</span>}
      </div>

      {/* Confirmar PIN */}
      {data.pin.length >= 4 && (
        <div className="input-group w-full">
          <label className="input-label block mb-1">Confirmar PIN</label>
          <input
            type="password"
            inputMode="numeric"
            placeholder="Repetí el PIN"
            value={data.confirmarPin}
            onChange={e => handlePinChange('confirmarPin', e.target.value)}
            className={`px-4 py-2 border rounded-md w-full text-center text-2xl tracking-widest
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20
              ${errores.confirmarPin ? 'border-danger' : 'border-neutral-300 focus:border-primary'}`}
          />
          <PinDisplay value={data.confirmarPin} />
          {errores.confirmarPin && <span className="input-error">{errores.confirmarPin}</span>}
        </div>
      )}

      {/* Aviso si omite PIN */}
      {!data.pin && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
          Sin PIN solo podés entrar escribiendo email y contraseña. Podés configurarlo después desde la página de Configuración.
        </div>
      )}

      {/* Error de API */}
      {apiError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle size={15} />
          {apiError}
        </div>
      )}

      <div className="flex gap-2 mt-2">
        <Button variant="outline" leftIcon={<ArrowLeft size={16} />} onClick={onAtras} disabled={isLoading}>
          Atrás
        </Button>
        <Button
          variant="primary"
          fullWidth
          leftIcon={<CheckCircle size={16} />}
          onClick={handleSubmit}
          loading={isLoading}
        >
          Crear kiosco
        </Button>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// PAGE PRINCIPAL
// ────────────────────────────────────────────────────────────────────────────

const RegistroPage: React.FC<{ onVolver?: () => void }> = ({ onVolver }) => {
  const { loginKiosco } = useAuth()

  const [paso, setPaso] = useState<Paso>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError]   = useState('')

  const [form, setForm] = useState<FormData>({
    nombreKiosco:     '',
    direccionKiosco:  '',
    nombreAdmin:      '',
    email:            '',
    password:         '',
    confirmarPassword:'',
    pin:              '',
    confirmarPin:     '',
  })

  const onChange = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setApiError('')
  }

  const handleRegistrar = async () => {
    setIsLoading(true)
    setApiError('')
    try {
      await authApi.register({
        nombreKiosco:    form.nombreKiosco.trim(),
        direccionKiosco: form.direccionKiosco.trim() || undefined,
        nombreAdmin:     form.nombreAdmin.trim(),
        email:           form.email.trim(),
        password:        form.password,
        pin:             form.pin || undefined,
      } as any)

      // Login automático después del registro
      await loginKiosco({ email: form.email.trim(), password: form.password })

    } catch (err: any) {
      setApiError(err.message || 'Error al crear el kiosco. Intentá de nuevo.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">

          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-2">
              <span className="text-xl font-bold text-white">K</span>
            </div>
            <p className="text-xs text-neutral-400 uppercase tracking-widest font-medium">
              Kiosconeta
            </p>
          </div>

          {/* Indicador de pasos */}
          <IndicadorPasos pasoActual={paso} />

          {/* Contenido del paso */}
          {paso === 1 && (
            <Paso1
              data={form}
              onChange={onChange}
              onSiguiente={() => setPaso(2)}
            />
          )}
          {paso === 2 && (
            <Paso2
              data={form}
              onChange={onChange}
              onSiguiente={() => setPaso(3)}
              onAtras={() => setPaso(1)}
            />
          )}
          {paso === 3 && (
            <Paso3
              data={form}
              onChange={onChange}
              onRegistrar={handleRegistrar}
              onAtras={() => setPaso(2)}
              isLoading={isLoading}
              apiError={apiError}
            />
          )}
        </div>

        {/* Link a login */}
        {onVolver && (
          <p className="text-center text-sm text-neutral-500 mt-4">
            ¿Ya tenés cuenta?{' '}
            <button onClick={onVolver} className="text-primary font-medium hover:underline">
              Iniciá sesión
            </button>
          </p>
        )}
      </div>
    </div>
  )
}

export default RegistroPage
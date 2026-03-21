// ════════════════════════════════════════════════════════════════════════════
// PAGE: Login Admin (Email + Password)
// ════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, AlertCircle } from 'lucide-react';
import { Button, Input } from '@/components/commons';
import { useAuth } from '@/contexts/AuthContext';
import { isValidEmail, errorMessages } from '@/utils';

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

interface LoginAdminProps {
  onBack: () => void;
}

// ────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────────────────────

export const LoginAdmin = ({ onBack }: LoginAdminProps) => {
  const { loginAdmin } = useAuth();
  

  // State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ──────────────────────────────────────────────────────────────────────────
  // VALIDAR FORMULARIO
  // ──────────────────────────────────────────────────────────────────────────

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    // Validar email
    if (!email) {
      newErrors.email = errorMessages.required;
    } else if (!isValidEmail(email)) {
      newErrors.email = errorMessages.invalidEmail;
    }

    // Validar password
    if (!password) {
      newErrors.password = errorMessages.required;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ──────────────────────────────────────────────────────────────────────────
  // SUBMIT
  // ──────────────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await loginAdmin({ email, password });
      // Redirige automáticamente al dashboard (manejado por AuthContext)
    } catch (error: any) {
      setApiError(error.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-neutral-50 center">
      <div className="w-full max-w-md px-6">
        {/* Botón Volver */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-neutral-600 hover:text-primary 
                     mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Volver</span>
        </button>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">K</span>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Login Administrador
            </h2>
            <p className="text-neutral-500">
              Ingresá tus credenciales
            </p>
          </div>

          {/* Error de API */}
          {apiError && (
            <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg 
                            flex items-center gap-3">
              <AlertCircle size={20} className="text-danger" />
              <p className="text-sm text-danger-700">{apiError}</p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <Input
              label="Email"
              type="email"
              placeholder="admin@kiosconeta.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              leftIcon={<Mail size={18} />}
              required
              autoFocus
            />

            {/* Password */}
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              leftIcon={<Lock size={18} />}
              required
            />

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
              className="mt-6"
            >
              Iniciar Sesión
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <button className="text-sm text-secondary hover:text-secondary-600 transition-colors">
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </div>

        {/* Datos de prueba (solo desarrollo) */}
        {import.meta.env.DEV && (
          <div className="mt-4 p-4 bg-info-50 border border-info-200 rounded-lg">
            <p className="text-xs text-info-700 mb-2 font-semibold">
              🔐 Credenciales de prueba:
            </p>
            <p className="text-xs text-info-600">
              Email: <code className="bg-white px-1 rounded">admin@kiosconeta.com</code>
            </p>
            <p className="text-xs text-info-600">
              Password: <code className="bg-white px-1 rounded">1234</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

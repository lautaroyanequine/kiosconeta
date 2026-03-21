// ════════════════════════════════════════════════════════════════════════════
// PAGE: Login Empleado (Selección + PIN)
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, AlertCircle } from 'lucide-react';
import { Spinner } from '@/components/commons';
import { NumericKeypad } from './NumericKeypad';
import { authApi } from '@/apis';
import { useAuth } from '../../contexts';
import type { EmpleadoLoginDTO } from '@/types';

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

interface LoginEmpleadoProps {
  onBack: () => void;
}

// ────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────────────────────

export const LoginEmpleado= ({ onBack }:LoginEmpleadoProps) => {
  const { loginEmpleado } = useAuth();

  // State
  const [step, setStep] = useState<'select' | 'pin'>('select');
  const [empleados, setEmpleados] = useState<EmpleadoLoginDTO[]>([]);
  const [selectedEmpleado, setSelectedEmpleado] = useState<EmpleadoLoginDTO | null>(null);
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ──────────────────────────────────────────────────────────────────────────
  // CARGAR EMPLEADOS
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    loadEmpleados();
  }, []);

  const loadEmpleados = async () => {
    try {
      // TODO: Obtener kioscoId dinámicamente (por ahora hardcodeado)
      const kioscoId = 1;
      const data = await authApi.getEmpleadosParaLogin(kioscoId);
      setEmpleados(data.filter((e) => !e.esAdmin)); // Filtrar solo empleados
      setIsLoading(false);
    } catch (error: any) {
      setError('Error al cargar empleados');
      setIsLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // SELECCIONAR EMPLEADO
  // ──────────────────────────────────────────────────────────────────────────

  const handleSelectEmpleado = (empleado: EmpleadoLoginDTO) => {
    setSelectedEmpleado(empleado);
    setStep('pin');
    setError('');
  };

  // ──────────────────────────────────────────────────────────────────────────
  // SUBMIT PIN
  // ──────────────────────────────────────────────────────────────────────────

  const handleSubmitPin = async () => {
    if (!selectedEmpleado || pin.length < 4) return;

    setIsSubmitting(true);
    setError('');

    try {
      await loginEmpleado({
        empleadoId: selectedEmpleado.empleadoId,
        pin,
      });
      // Redirige automáticamente al POS (manejado por AuthContext)
    } catch (error: any) {
      setError(error.message || 'PIN incorrecto');
      setPin(''); // Limpiar PIN
    } finally {
      setIsSubmitting(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // VOLVER A SELECCIÓN
  // ──────────────────────────────────────────────────────────────────────────

  const handleBackToSelection = () => {
    setStep('select');
    setSelectedEmpleado(null);
    setPin('');
    setError('');
  };

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER: LOADING
  // ──────────────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-neutral-600 mt-4">Cargando empleados...</p>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER: SELECCIÓN DE EMPLEADO
  // ──────────────────────────────────────────────────────────────────────────

  if (step === 'select') {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-neutral-600 hover:text-primary 
                       mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Volver</span>
          </button>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Seleccionar Empleado
            </h2>
            <p className="text-neutral-500">
              Hacé click en tu nombre para continuar
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="max-w-2xl mx-auto mb-6 p-4 bg-danger-50 border border-danger-200 
                            rounded-lg flex items-center gap-3">
              <AlertCircle size={20} className="text-danger" />
              <p className="text-sm text-danger-700">{error}</p>
            </div>
          )}

          {/* Grid de empleados */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {empleados.map((empleado) => (
              <button
                key={empleado.empleadoId}
                onClick={() => handleSelectEmpleado(empleado)}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl
                           transform hover:scale-105 transition-all duration-200
                           group"
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary-50 rounded-full center mx-auto mb-3
                                  group-hover:bg-primary transition-colors">
                    <User
                      size={36}
                      className="text-primary group-hover:text-white transition-colors"
                    />
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-1">
                    {empleado.nombre}
                  </h3>
                  {empleado.legajo && (
                    <p className="text-sm text-neutral-500">{empleado.legajo}</p>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Sin empleados */}
          {empleados.length === 0 && (
            <div className="text-center py-12">
              <p className="text-neutral-500">
                No hay empleados disponibles
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER: INGRESAR PIN
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-neutral-50 center">
      <div className="w-full max-w-lg px-6">
        {/* Botón Volver */}
        <button
          onClick={handleBackToSelection}
          className="flex items-center gap-2 text-neutral-600 hover:text-primary 
                     mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Cambiar empleado</span>
        </button>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary rounded-full center mx-auto mb-4">
              <User size={36} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              {selectedEmpleado?.nombre}
            </h2>
            {selectedEmpleado?.legajo && (
              <p className="text-neutral-500">{selectedEmpleado.legajo}</p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg 
                            flex items-center gap-3">
              <AlertCircle size={20} className="text-danger" />
              <p className="text-sm text-danger-700">{error}</p>
            </div>
          )}

          {/* Teclado numérico */}
          {isSubmitting ? (
            <div className="text-center py-12">
              <Spinner size="lg" />
              <p className="text-neutral-600 mt-4">Verificando...</p>
            </div>
          ) : (
            <NumericKeypad
              value={pin}
              onChange={setPin}
              onSubmit={handleSubmitPin}
              maxLength={6}
            />
          )}
        </div>
      </div>
    </div>
  );
};

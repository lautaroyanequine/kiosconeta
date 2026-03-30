// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: EmpleadoSelectorModal
// Modal que aparece desde el Header para elegir el empleado activo.
// Flujo: listado de empleados → teclado PIN → confirmar
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { X, User, ArrowLeft, AlertCircle } from 'lucide-react';
import { authApi } from '@/apis';
import { useAuth } from '@/contexts/AuthContext';
import { useEmpleadoActivo } from '@/contexts/EmpleadoActivoContext';
import { NumericKeypad } from '@/pages/Login/NumericKeypad';
import type { EmpleadoLoginDTO } from '@/types';

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════════════════════

export const EmpleadoSelectorModal: React.FC = () => {
  const { user } = useAuth();
  const {
    isSelecting, isVerifyingPin, pinError,
    pendingEmpleado,
    cerrarSelector, seleccionarEmpleado, confirmarPin,
  } = useEmpleadoActivo();

  const [empleados, setEmpleados]   = useState<EmpleadoLoginDTO[]>([]);
  const [isLoading, setIsLoading]   = useState(false);
  const [loadError, setLoadError]   = useState('');
  const [pin, setPin]               = useState('');

  // Cargar empleados al abrir
  useEffect(() => {
    if (!isSelecting || !user) return;
    setPin('');
    setLoadError('');
    setIsLoading(true);
    authApi.getEmpleadosParaLogin(user.kioscoId)
      .then(data => setEmpleados(data))
      .catch(() => setLoadError('No se pudieron cargar los empleados'))
      .finally(() => setIsLoading(false));
  }, [isSelecting, user]);

  // Limpiar PIN cuando cambia el empleado pendiente
  useEffect(() => { setPin(''); }, [pendingEmpleado]);

  if (!isSelecting) return null;

  const handleConfirmarPin = async () => {
    if (pin.length < 4) return;
    await confirmarPin(pin);
    setPin('');
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">

        {/* Header del modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            {pendingEmpleado && (
              <button onClick={() => seleccionarEmpleado(null as any)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 mr-1">
                <ArrowLeft size={18} />
              </button>
            )}
            <h2 className="text-lg font-bold text-neutral-900">
              {pendingEmpleado ? `PIN — ${pendingEmpleado.nombre}` : 'Seleccionar empleado'}
            </h2>
          </div>
          <button onClick={cerrarSelector}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">

          {/* ── PASO 1: Lista de empleados ── */}
          {!pendingEmpleado && (
            <>
              {loadError && (
                <div className="flex items-center gap-2 p-3 bg-danger-50 border border-danger-100
                                rounded-xl text-sm text-danger mb-4">
                  <AlertCircle size={15} className="shrink-0" /> {loadError}
                </div>
              )}

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto">
                  {empleados.map(emp => (
                    <button
                      key={emp.empleadoId}
                      onClick={() => seleccionarEmpleado(emp)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border-2
                                 border-neutral-200 hover:border-primary hover:bg-primary/5
                                 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center
                                      justify-center group-hover:bg-primary transition-colors">
                        <User size={22} className="text-primary group-hover:text-white transition-colors" />
                      </div>
                      <p className="text-sm font-semibold text-neutral-800 text-center leading-tight">
                        {emp.nombre}
                      </p>
                      {emp.legajo && (
                        <p className="text-xs text-neutral-400">{emp.legajo}</p>
                      )}
                    </button>
                  ))}

                  {empleados.length === 0 && !isLoading && (
                    <div className="col-span-3 text-center py-8 text-neutral-400 text-sm">
                      No hay empleados disponibles
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ── PASO 2: PIN ── */}
          {pendingEmpleado && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center
                                justify-center mx-auto mb-3">
                  <User size={28} className="text-primary" />
                </div>
                <p className="text-sm text-neutral-500">Ingresá tu PIN para continuar</p>
              </div>

              {(pinError) && (
                <div className="flex items-center gap-2 p-3 bg-danger-50 border border-danger-100
                                rounded-xl text-sm text-danger">
                  <AlertCircle size={15} className="shrink-0" /> {pinError}
                </div>
              )}

              {isVerifyingPin ? (
                <div className="flex flex-col items-center py-6 gap-3">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-neutral-500">Verificando...</p>
                </div>
              ) : (
                <NumericKeypad
                  value={pin}
                  onChange={setPin}
                  onSubmit={handleConfirmarPin}
                  maxLength={6}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

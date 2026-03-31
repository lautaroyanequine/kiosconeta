// ════════════════════════════════════════════════════════════════════════════
// PAGE: Selección de Empleado
// Pantalla principal después de configurar la PC.
// Cada empleado elige su perfil e ingresa su PIN.
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { User, AlertCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEmpleadoActivo } from '@/contexts/EmpleadoActivoContext';
import { authApi } from '@/apis';
import { NumericKeypad } from '@/pages/Login/NumericKeypad';
import type { EmpleadoLoginDTO } from '@/types';

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════════════════════

const SeleccionEmpleadoPage: React.FC = () => {
  const { kioscoUser, logout } = useAuth();
  const { isVerifyingPin, pinError, confirmarPin } = useEmpleadoActivo();
  const [pendingEmpleado, setPendingEmpleado] = useState<EmpleadoLoginDTO | null>(null);

  const [empleados, setEmpleados]   = useState<EmpleadoLoginDTO[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [loadError, setLoadError]   = useState('');
  const [pin, setPin]               = useState('');

  // Cargar empleados del kiosco
  useEffect(() => {
    if (!kioscoUser) return;
    authApi.getEmpleadosParaLogin(kioscoUser.kioscoId)
      .then(setEmpleados)
      .catch(() => setLoadError('No se pudieron cargar los empleados'))
      .finally(() => setIsLoading(false));
  }, [kioscoUser]);

  // Limpiar PIN al cambiar empleado
  useEffect(() => { setPin(''); }, [pendingEmpleado]);

  const handleConfirmar = async () => {
    if (pin.length < 4) return;
    if (!pendingEmpleado) return;
    await confirmarPin(pin, pendingEmpleado);
    setPin('');
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary to-primary-700
                    flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm">KIOSCONETA</p>
            <p className="text-white/60 text-xs">Kiosco #{kioscoUser?.kioscoId}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                     bg-white/10 hover:bg-white/20 text-white/70 hover:text-white
                     text-xs transition-all"
        >
          <LogOut size={13} />
          Salir
        </button>
      </div>

      {/* Contenido */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">

        {!pendingEmpleado ? (
          // ── PASO 1: Elegir empleado ──────────────────────────────────────
          <div className="w-full max-w-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                ¿Quién sos?
              </h1>
              <p className="text-white/60">
                Elegí tu nombre para continuar
              </p>
            </div>

            {loadError && (
              <div className="flex items-center gap-2 p-4 bg-white/10 border border-white/20
                              rounded-xl text-white text-sm mb-6">
                <AlertCircle size={16} className="shrink-0" />
                {loadError}
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {empleados.map(emp => (
                  <button
                    key={emp.empleadoId}
                    onClick={() => setPendingEmpleado(emp)}
                    className="flex flex-col items-center gap-3 p-6 rounded-2xl
                               bg-white/10 hover:bg-white/20 border border-white/20
                               hover:border-white/40 transition-all group"
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center
                                    text-2xl font-bold text-white transition-all
                                    ${emp.esAdmin
                                      ? 'bg-yellow-500/30 group-hover:bg-yellow-500/50'
                                      : 'bg-white/20 group-hover:bg-white/30'}`}>
                      {emp.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-white">{emp.nombre}</p>
                      {emp.legajo && (
                        <p className="text-xs text-white/50 mt-0.5">{emp.legajo}</p>
                      )}
                      {emp.esAdmin && (
                        <span className="text-xs text-yellow-400 font-medium">Admin</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

        ) : (
          // ── PASO 2: Ingresar PIN ─────────────────────────────────────────
          <div className="w-full max-w-sm">
            <div className="text-center mb-6">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center
                               text-3xl font-bold text-white mx-auto mb-4
                               ${pendingEmpleado.esAdmin ? 'bg-yellow-500/30' : 'bg-white/20'}`}>
                {pendingEmpleado.nombre.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-bold text-white">{pendingEmpleado.nombre}</h2>
              <p className="text-white/60 text-sm mt-1">Ingresá tu PIN</p>
            </div>

            {pinError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-400/30
                              rounded-xl text-white text-sm mb-4">
                <AlertCircle size={15} className="shrink-0" />
                {pinError}
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              {isVerifyingPin ? (
                <div className="flex flex-col items-center py-8 gap-3">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-neutral-500 text-sm">Verificando...</p>
                </div>
              ) : (
                <NumericKeypad
                  value={pin}
                  onChange={setPin}
                  onSubmit={handleConfirmar}
                  maxLength={6}
                />
              )}
            </div>

            <button
              onClick={() => setPendingEmpleado(null)}
              className="mt-4 w-full text-center text-white/60 hover:text-white text-sm transition-colors"
            >
              ← Cambiar empleado
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeleccionEmpleadoPage;

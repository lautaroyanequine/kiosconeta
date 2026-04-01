import React, { useState, useEffect } from 'react';
import { ShoppingBag, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { useEmpleadoActivo } from '@/contexts/EmpleadoActivoContext';
import { turnosApi } from '@/apis/turnosApi';
import { setStorage } from '@/utils/helpers';
import { STORAGE_KEYS } from '@/utils/constants';
import type { Turno } from '@/types/gastoTurno';

interface AbrirTurnoProps {
  onAbierto: () => void;
}

export const AbrirTurno: React.FC<AbrirTurnoProps> = ({ onAbierto }) => {
  const { empleadoActivo } = useEmpleadoActivo();

  const [turnos, setTurnos]                       = useState<Turno[]>([]);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<number | ''>('');
  const [efectivoInicial, setEfectivoInicial]     = useState('');
  const [observaciones, setObservaciones]         = useState('');
  const [isSubmitting, setIsSubmitting]           = useState(false);
  const [error, setError]                         = useState('');
  const [loadingTurnos, setLoadingTurnos]         = useState(true);

  useEffect(() => {
    turnosApi.getAll()
      .then(data => {
        setTurnos(data);
        if (data.length > 0) {
          const id = (data[0] as any).turnoID ?? (data[0] as any).turnoId;
          setTurnoSeleccionado(id);
        }
      })
      .catch(err => console.error('Error al cargar turnos:', err))
      .finally(() => setLoadingTurnos(false));
  }, []);

  const isValid = turnoSeleccionado !== '' &&
    efectivoInicial !== '' &&
    !isNaN(parseFloat(efectivoInicial)) &&
    parseFloat(efectivoInicial) >= 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !empleadoActivo) return;
    setIsSubmitting(true);
    setError('');
    try {
      await turnosApi.abrir({
        kioscoId:        empleadoActivo.kioscoId,
        empleadoId:      empleadoActivo.empleadoId,
        turnoId:         Number(turnoSeleccionado),
        efectivoInicial: parseFloat(efectivoInicial),
        observaciones:   observaciones || undefined,
      });
      setStorage(STORAGE_KEYS.TURNO_ID, Number(turnoSeleccionado));
      onAbierto();
    } catch (err: any) {
      setError(err.message || 'Error al abrir el turno');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center bg-neutral-50">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
               style={{ background: 'linear-gradient(135deg, #6b24d7, #2e1065)' }}>
            <ShoppingBag size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">
            Bienvenido, {empleadoActivo?.nombre}
          </h1>
          <p className="text-neutral-500 text-sm">Para empezar a vender, abrí el turno del día</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-danger-50 border border-danger-100 rounded-xl text-sm text-danger">
              <AlertCircle size={16} className="shrink-0" />{error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                <Clock size={14} className="inline mr-1.5 text-neutral-400" />Turno
              </label>
              {loadingTurnos ? (
                <div className="h-10 bg-neutral-100 rounded-lg animate-pulse" />
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {turnos.map(t => {
                    const id = (t as any).turnoID ?? (t as any).turnoId;
                    return (
                      <button key={id} type="button" onClick={() => setTurnoSeleccionado(id)}
                        className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all
                          ${turnoSeleccionado === id
                            ? 'border-primary bg-primary text-white'
                            : 'border-neutral-200 text-neutral-600 hover:border-primary/50'}`}>
                        {t.nombre}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                <DollarSign size={14} className="inline mr-1.5 text-neutral-400" />Efectivo en caja al abrir
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-medium">$</span>
                <input type="number" value={efectivoInicial} onChange={e => setEfectivoInicial(e.target.value)}
                  placeholder="0" min="0" autoFocus
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-neutral-300 text-sm
                             outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>
              <p className="text-xs text-neutral-400 mt-1">Contá el dinero en caja antes de abrir</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Observaciones <span className="text-neutral-400 font-normal ml-1">(opcional)</span>
              </label>
              <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)}
                placeholder="Ej: falta cambio chico..." rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm
                           outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none" />
            </div>

            <button type="submit" disabled={!isValid || isSubmitting}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 mt-2
                ${isValid && !isSubmitting
                  ? 'bg-primary text-white hover:bg-primary-600 active:scale-[0.98] shadow-md'
                  : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'}`}>
              {isSubmitting ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Abriendo turno...</>
              ) : '🚀 Abrir Turno y Empezar'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-neutral-400 mt-4">
          Para cerrar el turno al final del día, andá a{' '}
          <span className="font-medium text-neutral-500">Turnos</span> en el menú lateral
        </p>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// PAGE: Auditoría — Actividad y eventos sospechosos
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, AlertTriangle, Search, Filter,
  ChevronDown, AlertCircle, Eye, RefreshCw,
  User, Calendar, Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { auditoriaApi } from '@/apis/auditoriaApi';
import type { AuditoriaLog } from '@/apis/auditoriaApi';
import { formatDateForInput } from '@/utils/formatters';
import { Badge } from '@/components/commons';

// ────────────────────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────────────────────

const today = () => formatDateForInput(new Date());
const weekStart = () => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return formatDateForInput(d);
};

const EVENTO_CONFIG: Record<string, { label: string; color: string }> = {
  VENTA_ANULADA:           { label: 'Venta anulada',        color: 'danger' },
  VENTA_CREADA:            { label: 'Venta creada',          color: 'success' },
  CARRITO_LIMPIADO:        { label: 'Carrito limpiado',      color: 'warning' },
  TURNO_ABIERTO:           { label: 'Turno abierto',         color: 'info' },
  TURNO_CERRADO:           { label: 'Turno cerrado',         color: 'info' },
  TURNO_DIFERENCIA:        { label: 'Turno con diferencia',  color: 'danger' },
  GASTO_CREADO:            { label: 'Gasto registrado',      color: 'neutral' },
  GASTO_ELIMINADO:         { label: 'Gasto eliminado',       color: 'warning' },
  STOCK_AJUSTADO:          { label: 'Stock ajustado',        color: 'warning' },
  LOGIN_FALLIDO:           { label: 'Login fallido',         color: 'danger' },
  LOGIN_EXITOSO:           { label: 'Login exitoso',         color: 'success' },
};

const getEventoConfig = (tipo: string) =>
  EVENTO_CONFIG[tipo] ?? { label: tipo, color: 'neutral' };

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════════════════════

const AuditoriaPage: React.FC = () => {
  const { user } = useAuth();

  const [logs, setLogs]               = useState<AuditoriaLog[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  // Filtros
  const [vista, setVista]             = useState<'todos' | 'sospechosos'>('todos');
  const [busqueda, setBusqueda]       = useState('');
  const [fechaDesde, setFechaDesde]   = useState(weekStart());
  const [fechaHasta, setFechaHasta]   = useState(today());
  const [filtroTipo, setFiltroTipo]   = useState('');
  const [showFiltros, setShowFiltros] = useState(false);

  // Detalle
  const [logDetalle, setLogDetalle]   = useState<AuditoriaLog | null>(null);

  // ── Cargar datos ──────────────────────────────────────────────────────────

  const cargar = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const data = vista === 'sospechosos'
        ? await auditoriaApi.getSospechosos(user.kioscoId)
        : await auditoriaApi.getByKiosco(
            user.kioscoId,
            fechaDesde ? `${fechaDesde}T00:00:00` : undefined,
            fechaHasta ? `${fechaHasta}T23:59:59` : undefined
          );
      setLogs(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar auditoría');
    } finally {
      setLoading(false);
    }
  }, [user, vista, fechaDesde, fechaHasta]);

  useEffect(() => { cargar(); }, [cargar]);

  // ── Filtro local ──────────────────────────────────────────────────────────

  const logsFiltrados = logs.filter(l => {
    if (filtroTipo && l.tipoEvento !== filtroTipo) return false;
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return (
      l.empleadoNombre.toLowerCase().includes(q) ||
      l.descripcion.toLowerCase().includes(q) ||
      l.tipoEvento.toLowerCase().includes(q)
    );
  });

  const cantSospechosos = logs.filter(l => l.esSospechoso).length;
  const tiposUnicos = [...new Set(logs.map(l => l.tipoEvento))];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col bg-neutral-50">

      {/* ── Header ── */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <Shield size={20} className="text-primary" />
              Auditoría
            </h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              Registro de actividad y eventos del kiosco
            </p>
          </div>
          <button onClick={cargar} disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-300
                       text-sm text-neutral-600 hover:bg-neutral-50 transition-all">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>

        {/* Stats rápidos */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-neutral-50 rounded-xl p-3 flex items-center gap-3">
            <Activity size={18} className="text-primary" />
            <div>
              <p className="text-lg font-bold text-neutral-900">{logs.length}</p>
              <p className="text-xs text-neutral-500">Eventos totales</p>
            </div>
          </div>
          <div className={`rounded-xl p-3 flex items-center gap-3
                          ${cantSospechosos > 0 ? 'bg-danger-50' : 'bg-neutral-50'}`}>
            <AlertTriangle size={18} className={cantSospechosos > 0 ? 'text-danger' : 'text-neutral-400'} />
            <div>
              <p className={`text-lg font-bold ${cantSospechosos > 0 ? 'text-danger' : 'text-neutral-900'}`}>
                {cantSospechosos}
              </p>
              <p className="text-xs text-neutral-500">Sospechosos</p>
            </div>
          </div>
          <div className="bg-neutral-50 rounded-xl p-3 flex items-center gap-3">
            <User size={18} className="text-neutral-400" />
            <div>
              <p className="text-lg font-bold text-neutral-900">
                {new Set(logs.map(l => l.empleadoId)).size}
              </p>
              <p className="text-xs text-neutral-500">Empleados activos</p>
            </div>
          </div>
        </div>

        {/* Tabs + filtros */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Tabs */}
          <div className="flex rounded-lg border border-neutral-300 overflow-hidden text-sm">
            <button onClick={() => setVista('todos')}
              className={`px-4 py-2 font-medium transition-all
                ${vista === 'todos' ? 'bg-primary text-white' : 'text-neutral-600 hover:bg-neutral-50'}`}>
              Todos
            </button>
            <button onClick={() => setVista('sospechosos')}
              className={`px-4 py-2 font-medium transition-all flex items-center gap-1.5
                ${vista === 'sospechosos' ? 'bg-danger text-white' : 'text-neutral-600 hover:bg-neutral-50'}`}>
              <AlertTriangle size={13} />
              Sospechosos
              {cantSospechosos > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold
                  ${vista === 'sospechosos' ? 'bg-white/20' : 'bg-danger text-white'}`}>
                  {cantSospechosos}
                </span>
              )}
            </button>
          </div>

          {/* Búsqueda */}
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar empleado, descripción..."
              className="w-full pl-8 pr-4 py-2 rounded-lg border border-neutral-300 text-sm
                         outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>

          {/* Fechas — solo en vista todos */}
          {vista === 'todos' && (
            <>
              <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)}
                className="px-3 py-2 rounded-lg border border-neutral-300 text-sm outline-none
                           focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              <span className="text-neutral-400 text-sm">al</span>
              <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)}
                className="px-3 py-2 rounded-lg border border-neutral-300 text-sm outline-none
                           focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </>
          )}

          {/* Filtro tipo evento */}
          <button onClick={() => setShowFiltros(p => !p)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all
              ${showFiltros ? 'bg-primary text-white border-primary' : 'border-neutral-300 text-neutral-600'}`}>
            <Filter size={14} />
            Filtros
            <ChevronDown size={13} className={`transition-transform ${showFiltros ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFiltros && (
          <div className="flex gap-3 mt-3 pt-3 border-t border-neutral-100 items-end">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Tipo de evento</label>
              <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
                className="px-3 py-2 rounded-lg border border-neutral-300 text-sm outline-none
                           focus:ring-2 focus:ring-primary/30 focus:border-primary">
                <option value="">Todos los tipos</option>
                {tiposUnicos.map(t => (
                  <option key={t} value={t}>{getEventoConfig(t).label}</option>
                ))}
              </select>
            </div>
            <button onClick={() => { setFiltroTipo(''); setBusqueda(''); }}
              className="px-4 py-2 text-sm text-neutral-500 hover:text-neutral-700 underline">
              Limpiar
            </button>
          </div>
        )}
      </div>

      {/* ── Contenido ── */}
      <div className="flex-1 overflow-auto px-6 py-4">

        {error && (
          <div className="flex items-center gap-2 p-4 bg-danger-50 border border-danger-100
                          rounded-xl text-sm text-danger mb-4">
            <AlertCircle size={16} className="shrink-0" /> {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logsFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-neutral-400">
            <Shield size={48} className="mb-3 opacity-30" />
            <p className="text-sm">No hay eventos para mostrar</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600 text-xs uppercase tracking-wide">Fecha</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600 text-xs uppercase tracking-wide">Empleado</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600 text-xs uppercase tracking-wide">Evento</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600 text-xs uppercase tracking-wide">Descripción</th>
                  <th className="text-center px-4 py-3 font-semibold text-neutral-600 text-xs uppercase tracking-wide">Alerta</th>
                  <th className="text-center px-4 py-3 font-semibold text-neutral-600 text-xs uppercase tracking-wide"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {logsFiltrados.map(log => {
                  const cfg = getEventoConfig(log.tipoEvento);
                  return (
                    <tr key={log.auditoriaLogId}
                      className={`hover:bg-neutral-50 transition-colors
                        ${log.esSospechoso ? 'bg-danger-50/30' : ''}`}>

                      {/* Fecha */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-neutral-500">
                          <Calendar size={13} className="text-neutral-400" />
                          <span className="text-xs">{log.fechaFormateada}</span>
                        </div>
                      </td>

                      {/* Empleado */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center
                                          justify-center text-xs font-bold text-primary shrink-0">
                            {log.empleadoNombre.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-neutral-800">{log.empleadoNombre}</span>
                        </div>
                      </td>

                      {/* Evento */}
                      <td className="px-4 py-3">
                        <Badge variant={cfg.color as any}>
                          {cfg.label}
                        </Badge>
                      </td>

                      {/* Descripción */}
                      <td className="px-4 py-3">
                        <p className="text-neutral-600 truncate max-w-xs" title={log.descripcion}>
                          {log.descripcion}
                        </p>
                      </td>

                      {/* Alerta */}
                      <td className="px-4 py-3 text-center">
                        {log.esSospechoso ? (
                          <div className="flex items-center justify-center gap-1 text-danger">
                            <AlertTriangle size={15} />
                            <span className="text-xs font-medium">{log.motivoSospecha}</span>
                          </div>
                        ) : (
                          <span className="text-neutral-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Ver detalle */}
                      <td className="px-4 py-3 text-center">
                        {log.datosJson && (
                          <button onClick={() => setLogDetalle(log)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-primary
                                       hover:bg-primary/10 transition-all">
                            <Eye size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal detalle ── */}
      {logDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
             onClick={() => setLogDetalle(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"
               onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-neutral-900">Detalle del evento</h3>
              <button onClick={() => setLogDetalle(null)}
                className="text-neutral-400 hover:text-neutral-600">✕</button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <InfoItem label="Fecha" value={logDetalle.fechaFormateada} />
                <InfoItem label="Empleado" value={logDetalle.empleadoNombre} />
                <InfoItem label="Evento" value={getEventoConfig(logDetalle.tipoEvento).label} />
                {logDetalle.motivoSospecha && (
                  <InfoItem label="Motivo alerta" value={logDetalle.motivoSospecha} />
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">Descripción</p>
                <p className="text-sm text-neutral-700 bg-neutral-50 rounded-xl p-3">
                  {logDetalle.descripcion}
                </p>
              </div>

              {logDetalle.datosJson && (
                <div>
                  <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">Datos</p>
                  <pre className="text-xs text-neutral-600 bg-neutral-50 rounded-xl p-3 overflow-auto max-h-40">
                    {JSON.stringify(JSON.parse(logDetalle.datosJson), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-0.5">{label}</p>
    <p className="text-sm font-semibold text-neutral-800">{value}</p>
  </div>
);

export default AuditoriaPage;

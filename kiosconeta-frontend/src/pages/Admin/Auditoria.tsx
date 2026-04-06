// ════════════════════════════════════════════════════════════════════════════
// PAGE: Auditoría — Actividad y eventos sospechosos
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  VENTA_CREADA:            { label: 'Venta creada',         color: 'success' },
  CARRITO_LIMPIADO:        { label: 'Carrito limpiado',     color: 'warning' },
  TURNO_ABIERTO:           { label: 'Turno abierto',        color: 'info' },
  TURNO_CERRADO:           { label: 'Turno cerrado',        color: 'info' },
  TURNO_DIFERENCIA:        { label: 'Turno con diferencia', color: 'danger' },
  GASTO_CREADO:            { label: 'Gasto registrado',     color: 'neutral' },
  GASTO_ELIMINADO:         { label: 'Gasto eliminado',      color: 'warning' },
  STOCK_AJUSTADO:          { label: 'Stock ajustado',       color: 'warning' },
  LOGIN_FALLIDO:           { label: 'Login fallido',        color: 'danger' },
  LOGIN_EXITOSO:           { label: 'Login exitoso',        color: 'success' },
};

const getEventoConfig = (tipo: string) =>
  EVENTO_CONFIG[tipo] ?? { label: tipo, color: 'neutral' };

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════════════════════

const Auditoria: React.FC = () => {
  const { user } = useAuth();

  const [logs, setLogs] = useState<AuditoriaLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [vista, setVista] = useState<'todos' | 'sospechosos'>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [fechaDesde, setFechaDesde] = useState(weekStart());
  const [fechaHasta, setFechaHasta] = useState(today());
  const [filtroTipo, setFiltroTipo] = useState('');
  const [showFiltros, setShowFiltros] = useState(false);

  const [logDetalle, setLogDetalle] = useState<AuditoriaLog | null>(null);

  // ── Cargar datos ──────────────────────────────────────────────────────────

  const cargar = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const data =
        vista === 'sospechosos'
          ? await auditoriaApi.getSospechosos(user.kioscoId)
          : await auditoriaApi.getByKiosco(
              user.kioscoId,
              fechaDesde ? `${fechaDesde}T00:00:00` : undefined,
              fechaHasta ? `${fechaHasta}T23:59:59` : undefined
            );

      setLogs(data);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar auditoría');
    } finally {
      setLoading(false);
    }
  }, [user, vista, fechaDesde, fechaHasta]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // ── Filtros optimizados ───────────────────────────────────────────────────

  const logsFiltrados = useMemo(() => {
    return logs.filter(l => {
      if (filtroTipo && l.tipoEvento !== filtroTipo) return false;

      if (!busqueda.trim()) return true;

      const q = busqueda.toLowerCase();

      return (
        l.empleadoNombre.toLowerCase().includes(q) ||
        l.descripcion.toLowerCase().includes(q) ||
        l.tipoEvento.toLowerCase().includes(q)
      );
    });
  }, [logs, filtroTipo, busqueda]);

  const cantSospechosos = useMemo(
    () => logs.filter(l => l.esSospechoso).length,
    [logs]
  );

  const tiposUnicos = useMemo(
    () => [...new Set(logs.map(l => l.tipoEvento))],
    [logs]
  );

  // ── Safe JSON parse ───────────────────────────────────────────────────────

  const parseJson = (json: string) => {
    try {
      return JSON.stringify(JSON.parse(json), null, 2);
    } catch {
      return json;
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-neutral-900">Auditoría</h2>

        <button onClick={cargar} disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-300
                     text-sm text-neutral-600 hover:bg-neutral-50 transition-all">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-3">
        <Stat icon={<Activity size={18} />} label="Eventos" value={logs.length} />
        <Stat icon={<AlertTriangle size={18} />} label="Sospechosos" value={cantSospechosos} danger />
        <Stat icon={<User size={18} />} label="Empleados"
          value={new Set(logs.map(l => l.empleadoId)).size} />
      </div>

      {/* FILTROS */}
      <div className="flex flex-wrap gap-3 items-center">

        {/* Tabs */}
        <div className="flex border rounded-lg overflow-hidden text-sm">
          <Tab active={vista === 'todos'} onClick={() => setVista('todos')}>
            Todos
          </Tab>
          <Tab active={vista === 'sospechosos'} danger onClick={() => setVista('sospechosos')}>
            Sospechosos ({cantSospechosos})
          </Tab>
        </div>

        {/* Buscador */}
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar..."
            className="w-full pl-8 pr-4 py-2 border rounded-lg text-sm"
          />
        </div>

        {/* Filtros toggle */}
        <button onClick={() => setShowFiltros(p => !p)}
          className="px-3 py-2 border rounded-lg text-sm flex items-center gap-2">
          <Filter size={14} /> Filtros
          <ChevronDown size={14} className={showFiltros ? 'rotate-180' : ''} />
        </button>
      </div>

      {/* TABLA */}
      <div className="bg-white border rounded-xl overflow-hidden">
        {loading ? (
          <Loader />
        ) : logsFiltrados.length === 0 ? (
          <Empty />
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {logsFiltrados.map(log => {
                const cfg = getEventoConfig(log.tipoEvento);

                return (
                  <tr key={log.auditoriaLogId} className="border-b">
                    <td>{log.fechaFormateada}</td>
                    <td>{log.empleadoNombre}</td>
                    <td><Badge variant={cfg.color as any}>{cfg.label}</Badge></td>
                    <td>{log.descripcion}</td>
                    <td>
                      {log.esSospechoso && <AlertTriangle size={16} />}
                    </td>
                    <td>
                      {log.datosJson && (
                        <button onClick={() => setLogDetalle(log)}>
                          <Eye size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {logDetalle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center"
             onClick={() => setLogDetalle(null)}>
          <div className="bg-white p-5 rounded-xl max-w-md w-full"
               onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-3">Detalle</h3>

            <pre className="text-xs bg-neutral-100 p-3 rounded">
              {logDetalle.datosJson && parseJson(logDetalle.datosJson)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// COMPONENTES CHICOS
// ────────────────────────────────────────────────────────────────────────────

const Stat = ({ icon, label, value, danger }: any) => (
  <div className={`p-3 rounded-xl flex items-center gap-3 ${danger ? 'bg-danger-50' : 'bg-neutral-50'}`}>
    {icon}
    <div>
      <p className="font-bold">{value}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  </div>
);

const Tab = ({ children, active, onClick, danger }: any) => (
  <button onClick={onClick}
    className={`px-4 py-2 ${active ? (danger ? 'bg-danger text-white' : 'bg-primary text-white') : ''}`}>
    {children}
  </button>
);

const Loader = () => (
  <div className="flex justify-center p-6">
    <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const Empty = () => (
  <div className="flex flex-col items-center p-6 text-neutral-400">
    <Shield size={40} />
    <p>No hay datos</p>
  </div>
);

export default Auditoria;
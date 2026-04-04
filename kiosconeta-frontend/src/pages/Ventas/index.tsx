// ════════════════════════════════════════════════════════════════════════════
// PAGE: Ventas — Historial, detalle y anulación
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search, RefreshCw, ChevronRight, AlertTriangle,
  Receipt, TrendingUp, DollarSign, Ban, X, Filter,
} from 'lucide-react';
import { Button, Badge, Input, Modal, LoadingOverlay } from '@/components/commons';
import { useAuth } from '@/contexts/AuthContext';
import { ventasApi } from '@/apis/ventasApi';
import { formatCurrency, formatDateTime, formatDate } from '@/utils/formatters';
import type { Venta } from '@/types';

// ────────────────────────────────────────────────────────────────────────────
// TIPOS LOCALES
// ────────────────────────────────────────────────────────────────────────────

interface Filtros {
  fechaDesde: string;
  fechaHasta: string;
  busqueda: string;       // filtra por empleado o nro. venta en el cliente
  soloAnuladas: boolean;
}

const hoy = () => new Date().toISOString().split('T')[0];
const haceDias = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

// ────────────────────────────────────────────────────────────────────────────
// MODAL DETALLE DE VENTA
// ────────────────────────────────────────────────────────────────────────────

const VentaDetalleModal: React.FC<{
  venta: Venta | null;
  onClose: () => void;
  onAnular: (venta: Venta) => void;
  isAdmin: boolean;
}> = ({ venta, onClose, onAnular, isAdmin }) => {
  if (!venta) return null;

  return (
    <Modal
      isOpen={!!venta}
      onClose={onClose}
      title={`Venta #${venta.numeroVenta}`}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
          {isAdmin && !venta.anulada && (
            <Button variant="danger" leftIcon={<Ban size={15} />} onClick={() => onAnular(venta)}>
              Anular venta
            </Button>
          )}
        </>
      }
    >
      {/* Estado */}
      {venta.anulada && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
          <Ban size={15} /> Esta venta fue anulada. El stock fue devuelto.
        </div>
      )}

      {/* Info general */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-neutral-50 rounded-lg p-3">
          <p className="text-xs text-neutral-500 mb-1">Fecha</p>
          <p className="text-sm font-medium text-neutral-800">{formatDateTime(venta.fecha)}</p>
        </div>
        <div className="bg-neutral-50 rounded-lg p-3">
          <p className="text-xs text-neutral-500 mb-1">Empleado</p>
          <p className="text-sm font-medium text-neutral-800">{venta.empleadoNombre}</p>
        </div>
        <div className="bg-neutral-50 rounded-lg p-3">
          <p className="text-xs text-neutral-500 mb-1">Método de pago</p>
          <p className="text-sm font-medium text-neutral-800">{venta.metodoPagoNombre}</p>
        </div>
        <div className="bg-neutral-50 rounded-lg p-3">
          <p className="text-xs text-neutral-500 mb-1">Turno</p>
          <p className="text-sm font-medium text-neutral-800">{venta.turnoNombre || '—'}</p>
        </div>
      </div>

      {/* Productos */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
          Productos
        </p>
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          {venta.productos?.map((p, i) => (
            <div
              key={p.productoVentaId}
              className={`flex items-center justify-between px-4 py-2.5 text-sm ${
                i < venta.productos.length - 1 ? 'border-b border-neutral-100' : ''
              }`}
            >
              <div>
                <span className="font-medium text-neutral-800">{p.productoNombre}</span>
                <span className="text-neutral-400 ml-2">× {p.cantidad}</span>
              </div>
              <span className="text-neutral-700">{formatCurrency(p.subtotal)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Totales */}
      <div className="space-y-2 pt-3 border-t border-neutral-200">
        <div className="flex justify-between text-sm text-neutral-500">
          <span>Costo total</span>
          <span>{formatCurrency(venta.precioCosto)}</span>
        </div>
        <div className="flex justify-between text-sm text-green-600">
          <span>Ganancia</span>
          <span>{formatCurrency(venta.ganancia)} ({venta.margenGanancia.toFixed(1)}%)</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-neutral-900">
          <span>Total</span>
          <span>{formatCurrency(venta.total)}</span>
        </div>
      </div>
    </Modal>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// PAGE
// ────────────────────────────────────────────────────────────────────────────

const VentasPage: React.FC = () => {
  const { user, isAdmin } = useAuth();

  const [ventas, setVentas] = useState<Venta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtros, setFiltros] = useState<Filtros>({
    fechaDesde: haceDias(7),
    fechaHasta: hoy(),
    busqueda: '',
    soloAnuladas: false,
  });

  const [ventaDetalle, setVentaDetalle] = useState<Venta | null>(null);
  const [ventaAAnular, setVentaAAnular] = useState<Venta | null>(null);
  const [isAnulando, setIsAnulando] = useState(false);

  // ── Cargar ventas ────────────────────────────────────────────────────

  const cargarVentas = useCallback(async () => {
    if (!user?.kioscoId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await ventasApi.getByKiosco(user.kioscoId, {
        fechaDesde: filtros.fechaDesde ? `${filtros.fechaDesde}T00:00:00` : undefined,
        fechaHasta: filtros.fechaHasta ? `${filtros.fechaHasta}T23:59:59` : undefined,
        soloAnuladas: filtros.soloAnuladas || undefined,
      });
      setVentas(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las ventas');
    } finally {
      setIsLoading(false);
    }
  }, [user?.kioscoId, filtros.fechaDesde, filtros.fechaHasta, filtros.soloAnuladas]);

  useEffect(() => { cargarVentas(); }, [cargarVentas]);

  // ── Filtro local por búsqueda ─────────────────────────────────────────

  const ventasFiltradas = useMemo(() => {
    if (!filtros.busqueda.trim()) return ventas;
    const q = filtros.busqueda.toLowerCase();
    return ventas.filter(
      (v) =>
        v.empleadoNombre.toLowerCase().includes(q) ||
        String(v.numeroVenta).includes(q) ||
        v.metodoPagoNombre.toLowerCase().includes(q)
    );
  }, [ventas, filtros.busqueda]);

  // ── Stats ─────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const activas = ventasFiltradas.filter((v) => !v.anulada);
    return {
      total: activas.length,
      monto: activas.reduce((s, v) => s + v.total, 0),
      ganancia: activas.reduce((s, v) => s + v.ganancia, 0),
      anuladas: ventasFiltradas.filter((v) => v.anulada).length,
    };
  }, [ventasFiltradas]);

  // ── Anular ────────────────────────────────────────────────────────────

  const handleAnular = async () => {
    if (!ventaAAnular) return;
    setIsAnulando(true);
    try {
      await ventasApi.anular(ventaAAnular.ventaId);
      setVentas((prev) =>
        prev.map((v) =>
          v.ventaId === ventaAAnular.ventaId ? { ...v, anulada: true } : v
        )
      );
      setVentaAAnular(null);
      setVentaDetalle(null);
    } catch (err: any) {
      setError(err.message || 'Error al anular la venta');
    } finally {
      setIsAnulando(false);
    }
  };

  // ── Shortcuts de fecha ────────────────────────────────────────────────

  const setRango = (dias: number) => {
    setFiltros((prev) => ({ ...prev, fechaDesde: haceDias(dias), fechaHasta: hoy() }));
  };

  if (isLoading) return <LoadingOverlay message="Cargando ventas..." />;

  return (
    <>
      <div className="p-6 space-y-6">

        {/* ── HEADER ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Ventas</h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              Historial de ventas del kiosco
            </p>
          </div>
          <Button variant="ghost" size="sm" leftIcon={<RefreshCw size={15} />} onClick={cargarVentas}>
            Actualizar
          </Button>
        </div>

        {/* ── ERROR ─────────────────────────────────────────────────── */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
            <AlertTriangle size={15} /> {error}
            <button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button>
          </div>
        )}

        {/* ── STATS ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Ventas', value: stats.total, icon: <Receipt size={18} className="text-purple-600" />, color: 'bg-purple-50', fmt: String(stats.total) },
            { label: 'Total vendido', value: stats.monto, icon: <DollarSign size={18} className="text-blue-600" />, color: 'bg-blue-50', fmt: formatCurrency(stats.monto) },
            { label: 'Ganancia', value: stats.ganancia, icon: <TrendingUp size={18} className="text-green-600" />, color: 'bg-green-50', fmt: formatCurrency(stats.ganancia) },
            { label: 'Anuladas', value: stats.anuladas, icon: <Ban size={18} className="text-red-500" />, color: 'bg-red-50', fmt: String(stats.anuladas) },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-neutral-200 p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.color}`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xl font-bold text-neutral-900">{s.fmt}</p>
                <p className="text-xs text-neutral-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── FILTROS ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3">
          <div className="flex flex-wrap gap-3 items-end">
            {/* Búsqueda */}
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Buscar por empleado, nro. venta o método de pago..."
                value={filtros.busqueda}
                onChange={(e) => setFiltros((p) => ({ ...p, busqueda: e.target.value }))}
                leftIcon={<Search size={16} />}
              />
            </div>

            {/* Fechas */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) => setFiltros((p) => ({ ...p, fechaDesde: e.target.value }))}
                className="px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:border-primary"
              />
              <span className="text-neutral-400 text-sm">—</span>
              <input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => setFiltros((p) => ({ ...p, fechaHasta: e.target.value }))}
                className="px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:border-primary"
              />
            </div>

            {/* Toggle anuladas */}
            <button
              onClick={() => setFiltros((p) => ({ ...p, soloAnuladas: !p.soloAnuladas }))}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                filtros.soloAnuladas
                  ? 'bg-red-50 border-red-400 text-red-700'
                  : 'bg-white border-neutral-300 text-neutral-600 hover:border-neutral-400'
              }`}
            >
              Solo anuladas
            </button>
          </div>

          {/* Shortcuts de rango */}
          <div className="flex gap-2">
            <span className="text-xs text-neutral-400 self-center mr-1">Rango rápido:</span>
            {[
              { label: 'Hoy', dias: 0 },
              { label: '7 días', dias: 7 },
              { label: '30 días', dias: 30 },
              { label: '90 días', dias: 90 },
            ].map((r) => (
              <button
                key={r.label}
                onClick={() => r.dias === 0
                  ? setFiltros((p) => ({ ...p, fechaDesde: hoy(), fechaHasta: hoy() }))
                  : setRango(r.dias)
                }
                className="px-3 py-1 text-xs rounded-full border border-neutral-200 text-neutral-600 hover:border-primary hover:text-primary transition-colors"
              >
                {r.label}
              </button>
            ))}
            <span className="ml-auto text-xs text-neutral-400 self-center">
              {ventasFiltradas.length} resultado{ventasFiltradas.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* ── TABLA ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          {ventasFiltradas.length === 0 ? (
            <div className="py-16 text-center text-neutral-400">
              <Receipt size={40} className="mx-auto mb-3 opacity-30" />
              <p>No se encontraron ventas en el período seleccionado</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-neutral-400 uppercase tracking-wide border-b border-neutral-100">
                  <th className="text-left py-3 pl-6 pr-3 font-medium">#</th>
                  <th className="text-left py-3 px-3 font-medium">Fecha</th>
                  <th className="text-left py-3 px-3 font-medium hidden md:table-cell">Empleado</th>
                  <th className="text-left py-3 px-3 font-medium hidden lg:table-cell">Pago</th>
                  <th className="text-left py-3 px-3 font-medium hidden lg:table-cell">Productos</th>
                  <th className="text-right py-3 px-3 font-medium">Total</th>
                  <th className="text-center py-3 px-3 font-medium">Estado</th>
                  <th className="py-3 pl-3 pr-6 w-8" />
                </tr>
              </thead>
              <tbody>
                {ventasFiltradas.map((venta) => (
                  <tr
                    key={venta.ventaId}
                    onClick={() => setVentaDetalle(venta)}
                    className="cursor-pointer hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-0"
                  >
                    <td className="py-3 pl-6 pr-3">
                      <span className="text-sm font-mono text-neutral-500">
                        #{venta.numeroVenta}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <p className="text-sm text-neutral-800">{formatDate(venta.fecha)}</p>
                      <p className="text-xs text-neutral-400">
                        {new Date(venta.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="py-3 px-3 hidden md:table-cell">
                      <span className="text-sm text-neutral-700">{venta.empleadoNombre}</span>
                    </td>
                    <td className="py-3 px-3 hidden lg:table-cell">
                      <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                        {venta.metodoPagoNombre}
                      </span>
                    </td>
                    <td className="py-3 px-3 hidden lg:table-cell">
                      <span className="text-xs text-neutral-500">
                        {venta.productos?.length ?? 0} ítem{(venta.productos?.length ?? 0) !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`text-sm font-semibold ${venta.anulada ? 'line-through text-neutral-400' : 'text-neutral-900'}`}>
                        {formatCurrency(venta.total)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {venta.anulada ? (
                        <Badge variant="danger">Anulada</Badge>
                      ) : (
                        <Badge variant="success">Ok</Badge>
                      )}
                    </td>
                    <td className="py-3 pl-3 pr-6">
                      <ChevronRight size={16} className="text-neutral-300" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── MODAL DETALLE ─────────────────────────────────────────────── */}
      <VentaDetalleModal
        venta={ventaDetalle}
        onClose={() => setVentaDetalle(null)}
        onAnular={(v) => { setVentaAAnular(v); setVentaDetalle(null); }}
        isAdmin={isAdmin()}
      />

      {/* ── MODAL CONFIRMAR ANULACIÓN ─────────────────────────────────── */}
      <Modal
        isOpen={!!ventaAAnular}
        onClose={() => setVentaAAnular(null)}
        title="Anular venta"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setVentaAAnular(null)} disabled={isAnulando}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleAnular} loading={isAnulando}>
              Sí, anular
            </Button>
          </>
        }
      >
        <p className="text-neutral-700">
          ¿Estás seguro de anular la venta{' '}
          <strong>#{ventaAAnular?.numeroVenta}</strong> por{' '}
          <strong>{formatCurrency(ventaAAnular?.total ?? 0)}</strong>?
        </p>
        <p className="text-sm text-neutral-500 mt-2">
          El stock de los productos será devuelto automáticamente.
        </p>
      </Modal>
    </>
  );
};

export default VentasPage;
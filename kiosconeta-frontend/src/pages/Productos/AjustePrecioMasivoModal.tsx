// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: AjustePrecioMasivoModal — editar precios de varios productos a la vez
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useMemo } from 'react';
import { Modal, Input, Button } from '@/components/commons';
import { formatCurrency } from '@/utils/formatters';
import type { Producto, Categoria, TipoAjustePrecio } from '@/types';

type CampoVisible = 'PrecioVenta' | 'PrecioCosto' | 'Ambos';

interface AjustePrecioMasivoModalProps {
  isOpen: boolean;
  productos: Producto[];
  categorias: Categoria[];
  isSaving: boolean;
  saveError: string | null;
  onClose: () => void;
  onConfirmar: (
    productoIds: number[],
    tipoAjuste: TipoAjustePrecio,
    valorVenta: number | undefined,
    valorCosto: number | undefined
  ) => void;
}

// Mismo criterio de búsqueda que en POSVenta.tsx / useProductos.ts:
// coincide si el nombre contiene TODAS las palabras, en cualquier orden.
const coincideBusqueda = (nombre: string, query: string) => {
  const palabras = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const nombreLower = nombre.toLowerCase();
  return palabras.every(palabra => nombreLower.includes(palabra));
};

const redondear = (n: number) => Math.round(n * 100) / 100;

// Un selector +/- y una magnitud (o, en modo Precio fijo, un solo input directo).
const AjusteInput: React.FC<{
  label: string;
  direccion: 'aumentar' | 'disminuir';
  onDireccion: (d: 'aumentar' | 'disminuir') => void;
  magnitud: string;
  onMagnitud: (m: string) => void;
  tipoAjuste: TipoAjustePrecio;
}> = ({ label, direccion, onDireccion, magnitud, onMagnitud, tipoAjuste }) => {
  if (tipoAjuste === 'PrecioFijo') {
    return (
      <div className="border border-neutral-200 rounded-lg p-3">
        <p className="text-xs font-semibold text-neutral-500 mb-2">{label}</p>
        <Input
          type="number"
          min="0"
          step="0.01"
          placeholder="Ej: 1900"
          value={magnitud}
          onChange={e => onMagnitud(e.target.value)}
        />
      </div>
    );
  }

  return (
    <div className="border border-neutral-200 rounded-lg p-3">
      <p className="text-xs font-semibold text-neutral-500 mb-2">{label}</p>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <button type="button" onClick={() => onDireccion('aumentar')}
          className={`py-1.5 rounded-lg text-sm font-semibold border-2 transition-all ${
            direccion === 'aumentar' ? 'border-green-500 bg-green-50 text-green-700' : 'border-neutral-200 text-neutral-500'
          }`}>
          Aumentar
        </button>
        <button type="button" onClick={() => onDireccion('disminuir')}
          className={`py-1.5 rounded-lg text-sm font-semibold border-2 transition-all ${
            direccion === 'disminuir' ? 'border-red-500 bg-red-50 text-red-600' : 'border-neutral-200 text-neutral-500'
          }`}>
          Disminuir
        </button>
      </div>
      <Input
        type="number"
        min="0"
        step={tipoAjuste === 'Porcentaje' ? '1' : '0.01'}
        placeholder={tipoAjuste === 'Porcentaje' ? 'Ej: 10' : 'Ej: 500'}
        value={magnitud}
        onChange={e => onMagnitud(e.target.value)}
      />
    </div>
  );
};

export const AjustePrecioMasivoModal: React.FC<AjustePrecioMasivoModalProps> = ({
  isOpen,
  productos,
  categorias,
  isSaving,
  saveError,
  onClose,
  onConfirmar,
}) => {
  const [categoriaId, setCategoriaId] = useState<string>('');
  const [busqueda, setBusqueda] = useState('');
  const [tipoAjuste, setTipoAjuste] = useState<TipoAjustePrecio>('Porcentaje');
  const [campoVisible, setCampoVisible] = useState<CampoVisible>('PrecioVenta');
  const [excluidos, setExcluidos] = useState<Set<number>>(new Set());

  // Venta y costo son independientes — cada uno con su propia dirección y magnitud.
  const [direccionVenta, setDireccionVenta] = useState<'aumentar' | 'disminuir'>('aumentar');
  const [magnitudVenta, setMagnitudVenta] = useState('');
  const [direccionCosto, setDireccionCosto] = useState<'aumentar' | 'disminuir'>('aumentar');
  const [magnitudCosto, setMagnitudCosto] = useState('');

  const tocaVenta = campoVisible === 'PrecioVenta' || campoVisible === 'Ambos';
  const tocaCosto = campoVisible === 'PrecioCosto' || campoVisible === 'Ambos';

  const valorVenta = tocaVenta && magnitudVenta !== ''
    ? (tipoAjuste === 'PrecioFijo' ? Number(magnitudVenta) : (direccionVenta === 'disminuir' ? -1 : 1) * Number(magnitudVenta))
    : undefined;
  const valorCosto = tocaCosto && magnitudCosto !== ''
    ? (tipoAjuste === 'PrecioFijo' ? Number(magnitudCosto) : (direccionCosto === 'disminuir' ? -1 : 1) * Number(magnitudCosto))
    : undefined;

  // Reset al cerrar para no arrastrar filtros de la vez anterior
  const handleClose = () => {
    setCategoriaId(''); setBusqueda(''); setTipoAjuste('Porcentaje'); setCampoVisible('PrecioVenta');
    setDireccionVenta('aumentar'); setMagnitudVenta('');
    setDireccionCosto('aumentar'); setMagnitudCosto('');
    setExcluidos(new Set());
    onClose();
  };

  const coincidencias = useMemo(() => {
    return productos.filter(p => {
      if (!p.activo) return false;
      if (categoriaId !== '' && p.categoriaId !== Number(categoriaId)) return false;
      if (busqueda.trim() && !coincideBusqueda(p.nombre, busqueda)) return false;
      return true;
    });
  }, [productos, categoriaId, busqueda]);

  const hayFiltro = categoriaId !== '' || busqueda.trim() !== '';
  const seleccionados = coincidencias.filter(p => !excluidos.has(p.productoId));

  const calcularNuevo = (actual: number, valor: number) => {
    if (tipoAjuste === 'PrecioFijo') return redondear(valor); // valor ES el precio final
    return tipoAjuste === 'Porcentaje' ? redondear(actual * (1 + valor / 100)) : redondear(actual + valor);
  };

  const nuevoVentaDe = (p: Producto) => valorVenta !== undefined ? calcularNuevo(p.precioVenta, valorVenta) : p.precioVenta;
  const nuevoCostoDe = (p: Producto) => valorCosto !== undefined ? calcularNuevo(p.precioCosto, valorCosto) : p.precioCosto;

  const toggleExcluir = (id: number) => {
    setExcluidos(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const hayAjuste = valorVenta !== undefined || valorCosto !== undefined;
  const puedeConfirmar = seleccionados.length > 0 && hayAjuste && !isSaving;

  const handleConfirmar = () => {
    if (!puedeConfirmar) return;
    onConfirmar(seleccionados.map(p => p.productoId), tipoAjuste, valorVenta, valorCosto);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar precios de varios productos"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConfirmar} disabled={!puedeConfirmar} loading={isSaving}>
            Aplicar a {seleccionados.length} producto{seleccionados.length !== 1 ? 's' : ''}
          </Button>
        </>
      }
    >
      {saveError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {saveError}
        </div>
      )}

      <div className="space-y-4">
        {/* Filtro: categoría + búsqueda */}
        <div className="grid grid-cols-2 gap-4">
          <div className="input-group w-full">
            <label className="input-label mb-1 block">Categoría</label>
            <select
              className="px-3 py-2 border border-neutral-300 rounded-md w-full text-sm
                focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20
                focus:border-primary bg-white text-neutral-700"
              value={categoriaId}
              onChange={e => setCategoriaId(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat.categoriaID} value={cat.categoriaID}>{cat.nombre}</option>
              ))}
            </select>
          </div>
          <Input
            label="Buscar por nombre"
            placeholder="Ej: coca 2 litros"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>

        {/* Tipo de ajuste y campo a modificar */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="input-label mb-1 block">Tipo de ajuste</label>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => setTipoAjuste('Porcentaje')}
                className={`py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                  tipoAjuste === 'Porcentaje' ? 'border-primary bg-primary/5 text-primary' : 'border-neutral-200 text-neutral-500'
                }`}>
                Porcentaje (%)
              </button>
              <button type="button" onClick={() => setTipoAjuste('MontoFijo')}
                className={`py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                  tipoAjuste === 'MontoFijo' ? 'border-primary bg-primary/5 text-primary' : 'border-neutral-200 text-neutral-500'
                }`}>
                +/- monto ($)
              </button>
              <button type="button" onClick={() => setTipoAjuste('PrecioFijo')}
                className={`py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                  tipoAjuste === 'PrecioFijo' ? 'border-primary bg-primary/5 text-primary' : 'border-neutral-200 text-neutral-500'
                }`}>
                Precio fijo
              </button>
            </div>
          </div>
          <div>
            <label className="input-label mb-1 block">Campo a modificar</label>
            <select
              className="px-3 py-2 border border-neutral-300 rounded-md w-full text-sm
                focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20
                focus:border-primary bg-white text-neutral-700"
              value={campoVisible}
              onChange={e => setCampoVisible(e.target.value as CampoVisible)}
            >
              <option value="PrecioVenta">Precio de venta</option>
              <option value="PrecioCosto">Precio de costo</option>
              <option value="Ambos">Ambos</option>
            </select>
          </div>
        </div>

        {/* Ajuste — uno o dos bloques según el campo elegido */}
        <div className={`grid gap-3 ${campoVisible === 'Ambos' ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {tocaVenta && (
            <AjusteInput
              label="Precio de venta"
              direccion={direccionVenta}
              onDireccion={setDireccionVenta}
              magnitud={magnitudVenta}
              onMagnitud={setMagnitudVenta}
              tipoAjuste={tipoAjuste}
            />
          )}
          {tocaCosto && (
            <AjusteInput
              label="Precio de costo"
              direccion={direccionCosto}
              onDireccion={setDireccionCosto}
              magnitud={magnitudCosto}
              onMagnitud={setMagnitudCosto}
              tipoAjuste={tipoAjuste}
            />
          )}
        </div>

        {/* Vista previa */}
        {hayFiltro && (
          <div>
            <p className="text-xs text-neutral-400 mb-2">
              {coincidencias.length} producto{coincidencias.length !== 1 ? 's' : ''} encontrado{coincidencias.length !== 1 ? 's' : ''}
              {excluidos.size > 0 && ` — ${excluidos.size} excluido${excluidos.size !== 1 ? 's' : ''}`}
            </p>
            {coincidencias.length === 0 ? (
              <p className="text-sm text-neutral-400 py-4 text-center border border-dashed border-neutral-200 rounded-lg">
                Ningún producto coincide con este filtro
              </p>
            ) : (
              <div className="border border-neutral-200 rounded-lg max-h-64 overflow-y-auto divide-y divide-neutral-100">
                {coincidencias.map(p => {
                  const excluido = excluidos.has(p.productoId);
                  const venta = nuevoVentaDe(p);
                  const costo = nuevoCostoDe(p);
                  const invalido = hayAjuste && venta <= costo;

                  return (
                    <div key={p.productoId}
                      className={`flex items-center gap-3 px-3 py-2 text-sm ${excluido ? 'opacity-40' : ''} ${invalido && !excluido ? 'bg-red-50' : ''}`}>
                      <input
                        type="checkbox"
                        checked={!excluido}
                        onChange={() => toggleExcluir(p.productoId)}
                        className="shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-800 truncate">{p.nombre}</p>
                        <p className="text-xs text-neutral-400">{p.categoriaNombre}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {tocaVenta && (
                          <p className="tabular-nums">
                            {formatCurrency(p.precioVenta)} → <span className={invalido ? 'text-red-600 font-semibold' : 'text-green-700 font-semibold'}>{formatCurrency(venta)}</span>
                          </p>
                        )}
                        {tocaCosto && (
                          <p className="tabular-nums text-xs text-neutral-400">
                            costo {formatCurrency(p.precioCosto)} → {formatCurrency(costo)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {seleccionados.some(p => hayAjuste && nuevoVentaDe(p) <= nuevoCostoDe(p)) && (
              <p className="text-xs text-red-500 mt-2">
                Las filas en rojo quedarían con precio de venta menor o igual al de costo — se omiten automáticamente al aplicar.
              </p>
            )}
          </div>
        )}

        {!hayFiltro && (
          <p className="text-sm text-neutral-400 py-6 text-center border border-dashed border-neutral-200 rounded-lg">
            Elegí una categoría o escribí una búsqueda para ver qué productos se van a modificar
          </p>
        )}
      </div>
    </Modal>
  );
};
import React, { useEffect } from 'react';
import { Delete, Check } from 'lucide-react';

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

interface NumericKeypadProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  maxLength?: number;
}

// ────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────────────────────

export const NumericKeypad = ({
  value,
  onChange,
  onSubmit,
  maxLength = 6,
}: NumericKeypadProps) => {

  // ──────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ──────────────────────────────────────────────────────────────────────────

  const handleNumberClick = (num: string) => {
    if (value.length < maxLength) {
      onChange(value + num);
    }
  };

  const handleDelete = () => {
    onChange(value.slice(0, -1));
  };

  const handleSubmit = () => {
    if (value.length >= 4) {
      onSubmit();
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // TECLADO FÍSICO
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Números
      if (/^[0-9]$/.test(e.key)) {
        if (value.length < maxLength) {
          onChange(value + e.key);
        }
      }

      // Backspace
      if (e.key === 'Backspace') {
        handleDelete();
      }

      // Enter
      if (e.key === 'Enter') {
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [value, maxLength]);

  // ──────────────────────────────────────────────────────────────────────────
  // NÚMEROS DEL TECLADO
  // ──────────────────────────────────────────────────────────────────────────

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Display del PIN */}
      <div className="mb-8 text-center">
        <p className="text-sm text-neutral-600 mb-4">Ingresá tu PIN</p>

        <div className="flex justify-center gap-3">
          {[...Array(maxLength)].map((_, index) => (
            <div
              key={index}
              className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-2xl font-bold
              ${
                index < value.length
                  ? 'bg-secondary border-secondary text-primary'
                  : 'bg-white border-neutral-300 text-neutral-300'
              }
              transition-all duration-200`}
            >
              {index < value.length ? '•' : ''}
            </div>
          ))}
        </div>
      </div>

      {/* Teclado */}
      <div className="grid grid-cols-3 gap-3">
        {/* Números 1-9 */}
        {numbers.map((num) => (
          <button
            key={num}
            onClick={() => handleNumberClick(num)}
            className="h-16 bg-white border-2 border-neutral-300 rounded-lg
                       text-2xl font-semibold text-neutral-800
                       hover:bg-primary hover:text-white hover:border-primary
                       active:scale-95
                       transition-all duration-200"
          >
            {num}
          </button>
        ))}

        {/* Borrar */}
        <button
          onClick={handleDelete}
          disabled={value.length === 0}
          className="h-16 bg-white border-2 border-neutral-300 rounded-lg
           flex items-center justify-center
           hover:bg-neutral-100 hover:border-neutral-400
           active:scale-95
           disabled:opacity-40 disabled:cursor-not-allowed
           transition-all duration-200"
        >
          <Delete size={24} className="text-neutral-600" />
        </button>

        {/* 0 */}
        <button
          onClick={() => handleNumberClick('0')}
          className="h-16 bg-white border-2 border-neutral-300 rounded-lg
                     text-2xl font-semibold text-neutral-800
                     hover:bg-primary hover:text-white hover:border-primary
                     active:scale-95
                     transition-all duration-200"
        >
          0
        </button>

        {/* Confirmar */}
        <button
          onClick={handleSubmit}
          disabled={value.length < 4}
          className={`h-16 rounded-lg center
                     active:scale-95
                     transition-all duration-200
                     ${
                       value.length >= 4
                         ? 'bg-secondary border-2 border-secondary hover:bg-secondary-600'
                         : 'bg-neutral-200 border-2 border-neutral-300 cursor-not-allowed'
                     }`}
        >
          <Check
            size={28}
            className={value.length >= 4 ? 'text-primary' : 'text-neutral-400'}
          />
        </button>
      </div>

      {/* Indicador */}
      {value.length > 0 && value.length < 4 && (
        <p className="text-center text-sm text-neutral-500 mt-4">
          Mínimo 4 dígitos
        </p>
      )}
    </div>
  );
};
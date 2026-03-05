// ════════════════════════════════════════════════════════════════════════════
// PAGE: Login (Coordinador principal)
// ════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { LoginSelection } from './LoginSelection';
import { LoginAdmin } from './LoginAdmin';
import { LoginEmpleado } from './LoginEmpleado';

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

type LoginStep = 'selection' | 'admin' | 'empleado';

// ────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────────────────────

const LoginPage: React.FC = () => {
  const [step, setStep] = useState<LoginStep>('selection');

  // ──────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ──────────────────────────────────────────────────────────────────────────

  const handleSelectAdmin = () => {
    setStep('admin');
  };

  const handleSelectEmpleado = () => {
    setStep('empleado');
  };

  const handleBack = () => {
    setStep('selection');
  };

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────

  switch (step) {
    case 'selection':
      return (
        <LoginSelection
          onSelectAdmin={handleSelectAdmin}
          onSelectEmpleado={handleSelectEmpleado}
        />
      );

    case 'admin':
      return <LoginAdmin onBack={handleBack} />;

    case 'empleado':
      return <LoginEmpleado onBack={handleBack} />;

    default:
      return null;
  }
};

export default LoginPage;

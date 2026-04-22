// ════════════════════════════════════════════════════════════════════════════
// PAGE: Login — alterna entre login y registro en la misma pantalla
// ════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { LoginAdmin } from './LoginAdmin';
import Registro from '../Registro';

type Vista = 'login' | 'registro'

const LoginPage = () => {
  const [vista, setVista] = useState<Vista>('login')

  if (vista === 'registro') {
    return <Registro onVolver={() => setVista('login')} />
  }

  return <LoginAdmin onBack={() => {}} onRegistrarse={() => setVista('registro')} />
}

export default LoginPage;
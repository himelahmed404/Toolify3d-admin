'use client';

import { createContext, useContext } from 'react';
import { useApiToken } from '@/lib/api/useApiToken';

const AuthContext = createContext({
  session: null,
  isPending: true,
  tokenReady: false,
});

export function AuthProvider({ children }) {
  const { session, isPending, tokenReady } = useApiToken();

  return (
    <AuthContext.Provider value={{ session, isPending, tokenReady }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

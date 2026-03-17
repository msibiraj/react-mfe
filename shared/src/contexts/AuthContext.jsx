/**
 * @company/auth
 * Shared AuthContext — provided once by the Shell, consumed by any MFE.
 * MFEs import { useAuth } from '@company/auth' (resolved via Module Federation).
 */

import { createContext, useContext, useState } from 'react';

export const AuthContext = createContext(null);

/**
 * Hook for MFEs to read auth state.
 * Must be used inside <AuthProvider> (mounted by the Shell).
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

/**
 * Provider — mounted once in the Shell app.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { dbGetUserByGoogleSub, dbPutUser, newId } from '../data/db';
import { decodeGoogleIdToken, readSession, writeSession, type Session } from '../services/auth';

interface AuthContextValue {
  session: Session | null;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => readSession());

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const profile = decodeGoogleIdToken(idToken);
    const existing = await dbGetUserByGoogleSub(profile.sub);

    const user = {
      id: existing?.id ?? newId(),
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
      google_sub: profile.sub,
      created_at: existing?.created_at ?? new Date().toISOString(),
    };
    await dbPutUser(user);

    const next: Session = { userId: user.id, email: user.email, name: user.name, picture: user.picture };
    writeSession(next);
    setSession(next);
  }, []);

  const logout = useCallback(() => {
    writeSession(null);
    setSession(null);
  }, []);

  const value = useMemo(() => ({ session, loginWithGoogle, logout }), [session, loginWithGoogle, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

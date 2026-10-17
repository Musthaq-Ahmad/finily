import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { dbCreateUser, dbGetUserByEmail, newId } from '../data/db';
import { hashPassword, readSession, writeSession, type Session } from '../services/auth';

interface AuthContextValue {
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => readSession());

  const login = useCallback(async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await dbGetUserByEmail(normalizedEmail);
    if (!user) {
      throw new Error('No account found with that email.');
    }
    const hash = await hashPassword(password);
    if (hash !== user.password_hash) {
      throw new Error('Incorrect password.');
    }
    const next: Session = { userId: user.id, email: user.email };
    writeSession(next);
    setSession(next);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await dbGetUserByEmail(normalizedEmail);
    if (existing) {
      throw new Error('An account with that email already exists.');
    }
    const password_hash = await hashPassword(password);
    const user = {
      id: newId(),
      email: normalizedEmail,
      password_hash,
      created_at: new Date().toISOString(),
    };
    await dbCreateUser(user);
    const next: Session = { userId: user.id, email: user.email };
    writeSession(next);
    setSession(next);
  }, []);

  const logout = useCallback(() => {
    writeSession(null);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ session, login, register, logout }),
    [session, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasSeenWalkthrough } from '../pages/WalkthroughPage';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  if (!session) return <Navigate to={hasSeenWalkthrough() ? '/login' : '/welcome'} replace />;
  return <>{children}</>;
}

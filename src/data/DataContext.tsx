import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface DataContextValue {
  /** Bumped after every write so hooks watching it know to refetch. */
  version: number;
  notifyChange: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0);
  const notifyChange = useCallback(() => setVersion((v) => v + 1), []);
  return <DataContext.Provider value={{ version, notifyChange }}>{children}</DataContext.Provider>;
}

export function useDataVersion(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useDataVersion must be used within DataProvider');
  return ctx;
}

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { AutoSyncRunner } from './components/AutoSyncRunner';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicOnlyRoute } from './components/PublicOnlyRoute';
import { ToastHost } from './components/ToastHost';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { DataProvider } from './data/DataContext';
import { EmailReportPage } from './pages/EmailReportPage';
import { ExpenseFormPage } from './pages/ExpenseFormPage';
import { InsightsPage } from './pages/InsightsPage';
import { LoginPage } from './pages/LoginPage';
import { ScanReceiptPage } from './pages/ScanReceiptPage';
import { TripDetailPage } from './pages/TripDetailPage';
import { TripsListPage } from './pages/TripsListPage';
import { WalkthroughPage } from './pages/WalkthroughPage';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <DataProvider>
          <AutoSyncRunner />
          <BrowserRouter>
            <Routes>
              <Route
                path="/welcome"
                element={
                  <PublicOnlyRoute>
                    <WalkthroughPage />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <LoginPage />
                  </PublicOnlyRoute>
                }
              />
              <Route
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<TripsListPage />} />
                <Route path="/insights" element={<InsightsPage />} />
              </Route>
              <Route
                path="/trips/:tripId"
                element={
                  <ProtectedRoute>
                    <TripDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trips/:tripId/scan"
                element={
                  <ProtectedRoute>
                    <ScanReceiptPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trips/:tripId/report"
                element={
                  <ProtectedRoute>
                    <EmailReportPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trips/:tripId/expenses/new"
                element={
                  <ProtectedRoute>
                    <ExpenseFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trips/:tripId/expenses/:expenseId"
                element={
                  <ProtectedRoute>
                    <ExpenseFormPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          <ToastHost />
        </DataProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AutoSyncRunner } from './components/AutoSyncRunner';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicOnlyRoute } from './components/PublicOnlyRoute';
import { ToastHost } from './components/ToastHost';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { DataProvider } from './data/DataContext';
import { EmailReportPage } from './pages/EmailReportPage';
import { ExpenseFormPage } from './pages/ExpenseFormPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ScanReceiptPage } from './pages/ScanReceiptPage';
import { TripDetailPage } from './pages/TripDetailPage';
import { TripsListPage } from './pages/TripsListPage';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <DataProvider>
          <AutoSyncRunner />
          <BrowserRouter>
            <Routes>
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <LoginPage />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicOnlyRoute>
                    <RegisterPage />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <TripsListPage />
                  </ProtectedRoute>
                }
              />
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

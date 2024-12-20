import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/auth-context';
import { AuthForm } from '@/components/auth/auth-form';
import { Layout } from '@/components/layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { AthletesPage } from '@/pages/athletes';
import { DashboardPage } from '@/pages/dashboard';
import { ProtocolsPage } from '@/pages/protocols';
import { AssessmentsPage } from '@/pages/assessments';
import { ReportsPage } from '@/pages/reports';
import { AthleteDetailsPage } from '@/pages/athlete-details';
import { ComparisonPage } from '@/pages/comparison';
import { AttendancePage } from '@/pages/attendance';
import { SettingsPage } from '@/pages/settings';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<AuthForm />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route
                path="athletes"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'lead_coach', 'academy_coach']}>
                    <AthletesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="athletes/:athleteId"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'lead_coach', 'academy_coach']}>
                    <AthleteDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="protocols"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'lead_coach', 'fitness_trainer']}>
                    <ProtocolsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="assessments"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'lead_coach', 'fitness_trainer', 'academy_coach']}>
                    <AssessmentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="comparison"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'lead_coach', 'fitness_trainer']}>
                    <ComparisonPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="attendance"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'lead_coach', 'fitness_trainer', 'academy_coach']}>
                    <AttendancePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="reports"
                element={
                  <ProtectedRoute requiredPermission="view_reports">
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="settings"
                element={<SettingsPage />}
              />
              <Route
                path="unauthorized"
                element={<div>You don't have permission to access this page</div>}
              />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}
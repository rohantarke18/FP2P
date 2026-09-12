import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { ReportPage } from './pages/ReportPage';
import { TrackPage } from './pages/TrackPage';
import { InnovationsPage } from './pages/InnovationsPage';
import { InnovationDetailPage } from './pages/InnovationDetailPage';
import { SubmitInnovationPage } from './pages/SubmitInnovationPage';
import { ConsultationsPage } from './pages/ConsultationsPage';
import { ConsultationDetailPage } from './pages/ConsultationDetailPage';
import { PublicDashboardPage } from './pages/PublicDashboardPage';
import { CitizenDashboardPage } from './pages/CitizenDashboardPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { LoginPage } from './pages/LoginPage';

// Admin Pages
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminProblemsPage } from './pages/admin/AdminProblemsPage';
import { AdminCaseViewPage } from './pages/admin/AdminCaseViewPage';
import { AdminAssignmentsPage } from './pages/admin/AdminAssignmentsPage';
import { AdminInnovationsPage } from './pages/admin/AdminInnovationsPage';
import { AdminDepartmentsPage } from './pages/admin/AdminDepartmentsPage';
import { AdminAuditLogPage } from './pages/admin/AdminAuditLogPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
            <ScrollToTop />
            <Routes>
              {/* Public Portal Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<LandingPage />} />
                <Route path="report" element={<ReportPage />} />
                <Route path="track" element={<TrackPage />} />
                <Route path="innovations" element={<InnovationsPage />} />
                <Route path="innovations/submit" element={<SubmitInnovationPage />} />
                <Route path="innovations/:id" element={<InnovationDetailPage />} />
                <Route path="consultations" element={<ConsultationsPage />} />
                <Route path="consultations/:id" element={<ConsultationDetailPage />} />
                <Route path="public-stats" element={<PublicDashboardPage />} />
                <Route path="dashboard" element={<CitizenDashboardPage />} />
                <Route path="how-it-works" element={<HowItWorksPage />} />
                <Route path="login" element={<LoginPage />} />
              </Route>

              {/* Admin Login Routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin-login" element={<AdminLoginPage />} />

              {/* Admin Console Nested Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminOverviewPage />} />
                <Route path="problems" element={<AdminProblemsPage />} />
                <Route path="problems/:id" element={<AdminCaseViewPage />} />
                <Route path="assignments" element={<AdminAssignmentsPage />} />
                <Route path="innovations" element={<AdminInnovationsPage />} />
                <Route path="departments" element={<AdminDepartmentsPage />} />
                <Route path="audit-log" element={<AdminAuditLogPage />} />
                <Route path="reports" element={<AdminReportsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>

              {/* Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

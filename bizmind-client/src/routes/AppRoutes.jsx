import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '../pages/Landing/LandingPage.jsx';
import { LoginPage } from '../pages/Auth/LoginPage.jsx';
import { RegisterPage } from '../pages/Auth/RegisterPage.jsx';
import { DashboardPage } from '../pages/Dashboard/DashboardPage.jsx';
import { UploadCenter } from '../pages/Upload/UploadCenter.jsx';
import { AnalyticsPage } from '../pages/Analytics/AnalyticsPage.jsx';
import { AIChatPage } from '../pages/AIChat/AIChatPage.jsx';
import { ReportsPage } from '../pages/Reports/ReportsPage.jsx';
import { SettingsPage } from '../pages/Settings/SettingsPage.jsx';
import { BusinessProfilePage } from '../pages/Settings/BusinessProfilePage.jsx';
import { NotFoundPage } from '../pages/NotFound/NotFoundPage.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/upload" element={<UploadCenter />} />
        <Route path="/upload-center" element={<UploadCenter />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/ai-chat" element={<AIChatPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/business-profile" element={<BusinessProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster as HotToaster } from 'react-hot-toast'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Dashboard } from '@/pages/dashboard'
import { EmployeesPage } from '@/pages/employees'
import { LeavePage } from '@/pages/leave'
import { SettingsPage } from '@/pages/settings'
import { LoginPage } from '@/features/auth/LoginPage'
import { useAuthStore } from '@/store/auth'
import { useTheme } from '@/hooks/use-theme'
import { DataImportPage } from '@/pages/imports'
import { AnalyticsPage } from '@/pages/analytics'
import { AttendancePage } from '@/pages/attendance'
import { EmployeeProfilePage } from '@/pages/employee-profile'
import { MonthlyReportPage } from '@/pages/monthly-report'
import { useNotifications } from './hooks/useNotifications'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

function App() {
  useTheme() // Initialize theme
  const { isAuthenticated } = useAuthStore()

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
          <Route path="/*" element={isAuthenticated ? <MainApp /> : <Navigate to="/login" />} />
        </Routes>
        <HotToaster position="top-right" />
      </Router>
    </QueryClientProvider>
  )
}

function MainApp() {
  useNotifications(); // Initialize notification listeners
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/employees/:matricule" element={<EmployeeProfilePage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/leave" element={<LeavePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/monthly-report" element={<MonthlyReportPage />} />
            <Route path="/imports" element={<DataImportPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App

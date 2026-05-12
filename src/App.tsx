import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import AppShell from './components/layout/AppShell'
import AdminLayout from './components/layout/AdminLayout'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

import StudentDashboardPage from './pages/student/StudentDashboardPage'
import CandidateListPage from './pages/student/CandidateListPage'
import VotingPage from './pages/student/VotingPage'
import VoteConfirmationPage from './pages/student/VoteConfirmationPage'
import ReceiptPage from './pages/student/ReceiptPage'
import ProfileSettingsPage from './pages/student/ProfileSettingsPage'

import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import ElectionManagementPage from './pages/admin/ElectionManagementPage'
import CandidateManagementPage from './pages/admin/CandidateManagementPage'
import StudentManagementPage from './pages/admin/StudentManagementPage'
import LiveVoteMonitoringPage from './pages/admin/LiveVoteMonitoringPage'
import ResultsAnalyticsPage from './pages/admin/ResultsAnalyticsPage'
import AuditLogsPage from './pages/admin/AuditLogsPage'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -6, filter: 'blur(8px)' }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Student */}
          <Route element={<AppShell />}>
            <Route
              path="/student/dashboard"
              element={<StudentDashboardPage />}
            />
            <Route
              path="/student/candidates"
              element={<CandidateListPage />}
            />
            <Route path="/student/vote" element={<VotingPage />} />
            <Route
              path="/student/confirm"
              element={<VoteConfirmationPage />}
            />
            <Route path="/student/receipt" element={<ReceiptPage />} />
            <Route
              path="/student/profile"
              element={<ProfileSettingsPage />}
            />
          </Route>

          {/* Admin */}
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route
              path="/admin/elections"
              element={<ElectionManagementPage />}
            />
            <Route
              path="/admin/candidates"
              element={<CandidateManagementPage />}
            />
            <Route path="/admin/students" element={<StudentManagementPage />} />
            <Route path="/admin/live" element={<LiveVoteMonitoringPage />} />
            <Route
              path="/admin/results"
              element={<ResultsAnalyticsPage />}
            />
            <Route path="/admin/audit" element={<AuditLogsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/landing" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default AnimatedRoutes

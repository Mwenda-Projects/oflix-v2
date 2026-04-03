import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { AuthProvider } from '@/context/AuthContext'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import GuestRoute from '@/components/layout/GuestRoute'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import OnboardingPage from '@/pages/OnboardingPage'
import DashboardPage from '@/pages/DashboardPage'
import BusinessPage from '@/pages/BusinessPage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/" element={<LandingPage />} />

              {/* Guest only — redirect to dashboard if already logged in */}
              <Route path="/login" element={
                <GuestRoute><LoginPage /></GuestRoute>
              } />
              <Route path="/signup" element={
                <GuestRoute><SignupPage /></GuestRoute>
              } />

              {/* Public business page — shareable link for customers */}
              <Route path="/b/:slug" element={<BusinessPage />} />

              {/* Protected — must be logged in */}
              <Route path="/onboarding" element={
                <ProtectedRoute><OnboardingPage /></ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute><DashboardPage /></ProtectedRoute>
              } />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
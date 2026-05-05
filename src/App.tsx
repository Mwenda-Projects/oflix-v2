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
import SettingsPage from '@/pages/SettingsPage'
import MyWebsitePage from '@/pages/MyWebsitePage'
import UpgradePage from '@/pages/UpgradePage'
import NotFoundPage from '@/pages/NotFoundPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/" element={<LandingPage />} />

              {/* Guest only */}
              <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
              <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Public business page — rendered OUTSIDE ThemeProvider wrapper
                  so it gets no extra wrapper divs that could break height chain */}
              <Route path="/b/:slug" element={<BusinessPage />} />

              {/* Protected */}
              <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/dashboard/website" element={<ProtectedRoute><MyWebsitePage /></ProtectedRoute>} />
              <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/upgrade" element={<ProtectedRoute><UpgradePage /></ProtectedRoute>} />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
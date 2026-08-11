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
import PrivacyPage from '@/pages/PrivacyPage'
import TermsPage from '@/pages/TermsPage'

// Business subdomains: businessname.oflix.space
// Any request arriving on a subdomain of oflix.space (other than www) should
// show ONLY that business's page, regardless of path — it's a single-purpose
// micro-site, not the full app. Detection happens purely client-side since
// Vercel's SPA rewrite already serves index.html for any host/path combo
// under this project (proven by /b/:slug deep links already working today).
const APEX_DOMAIN = 'oflix.space'

function getBusinessSubdomainSlug(): string | null {
  if (typeof window === 'undefined') return null
  const hostname = window.location.hostname

  if (hostname === APEX_DOMAIN) return null
  if (hostname === `www.${APEX_DOMAIN}`) return null
  if (!hostname.endsWith(`.${APEX_DOMAIN}`)) return null

  return hostname.slice(0, -(`.${APEX_DOMAIN}`.length))
}

export default function App() {
  const businessSlug = getBusinessSubdomainSlug()

  // Subdomain request — bypass the full app shell and route table entirely.
  // No ThemeProvider/LanguageProvider/AuthProvider wrapping needed here since
  // a business's public page manages its own presentation independently
  // (same reasoning as the existing /b/:slug route).
  if (businessSlug) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<BusinessPage slugOverride={businessSlug} />} />
        </Routes>
      </BrowserRouter>
    )
  }

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
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
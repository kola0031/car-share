import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App.jsx'
import SectionLoader from './components/SectionLoader'

const FeaturesPage = lazy(() => import('./routes/FeaturesPage.jsx'))
const TestimonialsPage = lazy(() => import('./routes/TestimonialsPage.jsx'))
const PricingPage = lazy(() => import('./routes/PricingPage.jsx'))
const FAQPage = lazy(() => import('./routes/FAQPage.jsx'))
const Login = lazy(() => import('./components/Login.jsx'))
const Register = lazy(() => import('./components/Register.jsx'))
const Dashboard = lazy(() => import('./routes/Dashboard.jsx'))
const Onboarding = lazy(() => import('./routes/Onboarding.jsx'))
const Bookings = lazy(() => import('./routes/Bookings.jsx'))
const DriverTrips = lazy(() => import('./routes/DriverTrips.jsx'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<SectionLoader />}>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/testimonials" element={<TestimonialsPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/driver/trips" element={<DriverTrips />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)

import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import SectionLoader from './components/SectionLoader'

const FeaturesPage = lazy(() => import('./routes/FeaturesPage.jsx'))
const TestimonialsPage = lazy(() => import('./routes/TestimonialsPage.jsx'))
const PricingPage = lazy(() => import('./routes/PricingPage.jsx'))
const FAQPage = lazy(() => import('./routes/FAQPage.jsx'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<SectionLoader />}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/faq" element={<FAQPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)

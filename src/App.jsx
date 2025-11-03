import { Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SectionLoader from './components/SectionLoader';
const Features = lazy(() => import('./components/Features'));
const Testimonials = lazy(() => import('./components/Testimonials'));
const Pricing = lazy(() => import('./components/Pricing'));
const FAQ = lazy(() => import('./components/FAQ'));
const Footer = lazy(() => import('./components/Footer'));
import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />
      <Hero />
      <Suspense fallback={<SectionLoader />}>
        <Features />
        <Testimonials />
        <Pricing />
        <FAQ />
        <Footer />
      </Suspense>
    </div>
  );
}

export default App;

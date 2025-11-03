import { Suspense, lazy } from 'react';
import SectionLoader from '../components/SectionLoader';
import Navbar from '../components/Navbar';

const Testimonials = lazy(() => import('../components/Testimonials'));
const Footer = lazy(() => import('../components/Footer'));

const TestimonialsPage = () => {
  return (
    <>
      <Navbar />
      <Suspense fallback={<SectionLoader />}>
        <Testimonials />
        <Footer />
      </Suspense>
    </>
  );
};

export default TestimonialsPage;



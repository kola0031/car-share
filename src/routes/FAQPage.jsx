import { Suspense, lazy } from 'react';
import SectionLoader from '../components/SectionLoader';
import Navbar from '../components/Navbar';

const FAQ = lazy(() => import('../components/FAQ'));
const Footer = lazy(() => import('../components/Footer'));

const FAQPage = () => {
  return (
    <>
      <Navbar />
      <Suspense fallback={<SectionLoader />}>
        <FAQ />
        <Footer />
      </Suspense>
    </>
  );
};

export default FAQPage;



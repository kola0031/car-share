import { Suspense, lazy } from 'react';
import SectionLoader from '../components/SectionLoader';
import Navbar from '../components/Navbar';

const Pricing = lazy(() => import('../components/Pricing'));
const Footer = lazy(() => import('../components/Footer'));

const PricingPage = () => {
  return (
    <>
      <Navbar />
      <Suspense fallback={<SectionLoader />}>
        <Pricing />
        <Footer />
      </Suspense>
    </>
  );
};

export default PricingPage;



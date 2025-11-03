import { Suspense, lazy } from 'react';
import SectionLoader from '../components/SectionLoader';
import Navbar from '../components/Navbar';

const Features = lazy(() => import('../components/Features'));
const Footer = lazy(() => import('../components/Footer'));

const FeaturesPage = () => {
  return (
    <>
      <Navbar />
      <Suspense fallback={<SectionLoader />}>
        <Features />
        <Footer />
      </Suspense>
    </>
  );
};

export default FeaturesPage;



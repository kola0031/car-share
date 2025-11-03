import { memo } from 'react';
import './Features.css';

const Features = () => {
  const features = [
    { title: 'Online bookings', description: 'Get a free website with a seamless reservation engine', icon: '📱' },
    { title: 'Damage & liability insurance', description: 'Make your trips secure with the option to purchase insurance', icon: '🛡️' },
    { title: 'Identity verification', description: 'Secure rentals with robust ID verification', icon: '✅' },
    { title: 'Insurance verification', description: 'Verify whether the renter has right insurance', icon: '🔍' },
    { title: 'Rental agreements', description: 'Automated rental agreements synced with bookings', icon: '📄' },
    { title: 'Seamless payments', description: 'Effortlessly manage online payments & security deposits', icon: '💳' },
    { title: 'Turo sync', description: 'Sync your Turo calendar and reservation data', icon: '🔄' },
    { title: 'Expense management', description: 'Add expenses, sync with revenue, and view profit', icon: '📊' },
    { title: 'Fleet metrics', description: 'Understand your car rental business in-depth', icon: '📈' },
    { title: 'And much more', description: 'Manual Bookings, Customer Management, Fleet Management, Coupons, etc…', icon: '✨' },
  ];

  return (
    <section id="features" className="features">
      <div className="features-container">
        <div className="section-header">
          <h2 className="section-title">1Now Software</h2>
          <h3 className="section-subtitle">Everything your car rental business needs to</h3>
          <h3 className="section-subtitle highlight">increase profits</h3>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h4 className="feature-title">{feature.title}</h4>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="best-software">
          <h2 className="best-title">The Best Car Rental Software for Turo Hosts</h2>
          <p className="best-description">
            Manage your fleet, bookings & payments with 1Now. Earn up to $18,000 per year by skipping Turo's 25% fee.
          </p>
          <ul className="best-features-list">
            <li>Real-time fleet tracking</li>
            <li>Automated bookings & payments</li>
            <li>Expense tracking + profit insights</li>
            <li>Stripe & Square integration</li>
            <li>Analytics to grow your business</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default memo(Features);


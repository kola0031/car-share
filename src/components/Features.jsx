import { memo } from 'react';
import './Features.css';

const Features = () => {
  const features = [
    { title: 'HostPilot Portal', description: 'Access your fleet anytime with HostPilot-powered virtual listings and real-time management', icon: '💻' },
    { title: 'Full Booking Management', description: 'HostPilot handles all guest bookings via Turo, Booking.com, and direct channels', icon: '📅' },
    { title: 'PackMyShare Integration', description: 'Secure vehicle parking and pickup/drop-off logistics at premium Atlanta facilities', icon: '🅿️' },
    { title: 'Customer Service', description: '24/7 guest support handled by HostPilot team — you stay hands-free', icon: '🎧' },
    { title: 'Revenue Distribution', description: 'Transparent revenue sharing with real-time tracking and payouts', icon: '💰' },
    { title: 'Maintenance Coordination', description: 'Scheduled maintenance and inspections via partner auto shops', icon: '🔧' },
    { title: 'Cleaning Services', description: 'Professional cleaning services available through partner network', icon: '✨' },
    { title: 'Marketing & Listings', description: 'Multi-platform listing management and optimization to maximize bookings', icon: '📢' },
    { title: 'Fleet Analytics', description: 'Track performance, revenue, and optimize your fleet operations', icon: '📊' },
    { title: 'Automated Operations', description: 'AI-powered fleet optimization and automation tools for maximum efficiency', icon: '🤖' },
  ];

  return (
    <section id="features" className="features">
      <div className="features-container">
        <div className="section-header">
          <h2 className="section-title">HostPilot Platform</h2>
          <h3 className="section-subtitle">Everything you need for</h3>
          <h3 className="section-subtitle highlight">hands-free vehicle income</h3>
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
          <h2 className="best-title">Atlanta's Leading Tech-Driven Vehicle Management Platform</h2>
          <p className="best-description">
            HostPilot manages all operations — from listings to logistics — so you can focus on earning passive income. We handle everything while you own the assets.
          </p>
          <ul className="best-features-list">
            <li>Full-service fleet management</li>
            <li>Multi-platform booking management</li>
            <li>Secure storage & logistics via PackMyShare</li>
            <li>Transparent revenue sharing</li>
            <li>AI-powered optimization tools</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default memo(Features);


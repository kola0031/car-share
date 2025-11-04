import { memo } from 'react';
import './Pricing.css';

const Pricing = () => {
  const handleCTAClick = (e, planName) => {
    e.preventDefault();
    // For demo/profit demo calls, scroll to footer
    if (planName === 'Enterprise') {
      const footer = document.querySelector('footer');
      if (footer) {
        footer.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // For start buttons, you can customize this - scroll to footer or show a message
      const footer = document.querySelector('footer');
      if (footer) {
        footer.scrollIntoView({ behavior: 'smooth' });
      }
      // Alternative: alert for demo purposes
      // alert(`You clicked to start with the ${planName} plan!`);
    }
  };
  const plans = [
    {
      name: 'HostPilot Subscription',
      price: '$150',
      period: '/month',
      cars: 'Per host',
      features: [
        'VEVS system access & host portal',
        'PackMyShare parking ($97.85/car/month included)',
        'Full booking management',
        'Customer service & support',
        'Revenue distribution & tracking',
        'Maintenance coordination',
        'Multi-platform listing management'
      ],
      cta: 'GET STARTED',
      popular: true
    },
    {
      name: 'One-Time Setup',
      price: '€580',
      period: 'one-time',
      cars: 'Integration fee',
      features: [
        'System setup & onboarding',
        'VEVS portal configuration',
        'PackMyShare facility setup',
        'Account integration',
        'Initial vehicle listing',
        'Training & documentation'
      ],
      cta: 'LEARN MORE',
      popular: false
    },
    {
      name: 'Optional Add-ons',
      price: 'Custom',
      period: 'pricing',
      cars: 'As needed',
      features: [
        'Maintenance services',
        'Cleaning services',
        'Additional storage',
        'Premium support tiers',
        'Custom integrations',
        'Expandable fleet options'
      ],
      cta: 'CONTACT US',
      popular: false,
      custom: true
    }
  ];

  return (
    <section id="pricing" className="pricing">
      <div className="pricing-container">
        <div className="limited-offer">
          <h2 className="offer-title">Complete Fleet Management Solution</h2>
          <h3 className="offer-subtitle">Everything included in one subscription</h3>
          <p className="offer-description">
            Get full-service management with HostPilot. VEVS portal access, PackMyShare parking, booking management, customer service, and revenue distribution — all included.
          </p>
          <ul className="offer-features">
            <li>VEVS-powered host portal</li>
            <li>PackMyShare parking ($97.85/car/month included)</li>
            <li>Multi-platform booking management</li>
            <li>24/7 customer service & support</li>
          </ul>
          <a 
            href="#footer" 
            className="offer-cta"
            onClick={(e) => {
              e.preventDefault();
              const footer = document.querySelector('footer');
              if (footer) {
                footer.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            GET STARTED
          </a>
        </div>

        <div className="pricing-header">
          <h2 className="pricing-title">Simple, Transparent Pricing</h2>
          <p className="pricing-subtitle">All-inclusive subscription with no hidden fees</p>
        </div>

        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <div key={index} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              <h3 className="plan-name">{plan.name}</h3>
              <div className="plan-price">
                <span className="price-amount">{plan.price}</span>
                <span className="price-period">{plan.period}</span>
              </div>
              <p className="plan-cars">{plan.cars}</p>
              <ul className="plan-features">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
              <a 
                href={plan.custom ? "#footer" : "#footer"} 
                className={`plan-cta ${plan.popular ? 'popular-cta' : ''}`}
                onClick={(e) => handleCTAClick(e, plan.name)}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default memo(Pricing);


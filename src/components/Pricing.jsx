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
      name: 'Starter',
      price: '$150',
      period: '/month',
      cars: 'Up to 10 cars',
      features: [
        'Custom website',
        'Fleet management software',
        'Automated ID verification',
        'Automated insurance verification',
        'Damage & liability insurance',
        'And much more'
      ],
      cta: 'START FOR FREE',
      popular: false
    },
    {
      name: 'Professional',
      price: '$260',
      period: '/month',
      cars: 'UP TO 25 cars',
      features: [
        'Everything in starter',
        'Unlimited locations',
        'Analytics for Turo & direct rentals',
        'Expense management',
        'All integrations',
        '24/7 support'
      ],
      cta: 'START FOR FREE',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Book a call',
      period: '',
      cars: 'Unlimited cars',
      features: [
        'Everything in professional',
        'Mobile application',
        'Available on the App Store and Google Play Store',
        'Customized according to your business'
      ],
      cta: 'PROFIT DEMO CALL',
      popular: false,
      custom: true
    }
  ];

  return (
    <section id="pricing" className="pricing">
      <div className="pricing-container">
        <div className="limited-offer">
          <h2 className="offer-title">Limited Time Offer!</h2>
          <h3 className="offer-subtitle">Free custom website</h3>
          <p className="offer-description">
            Get a free, mobile friendly website with 1Now. Launch in 1 day and boost profit by 75% - earn an extra $18,000 per year.
          </p>
          <ul className="offer-features">
            <li>Sync with your Turo calendar</li>
            <li>Manage your fleet in one dashboard</li>
            <li>Stripe & Square integration</li>
            <li>SEO-optimized to attract more renters</li>
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
            START FOR FREE
          </a>
        </div>

        <div className="pricing-header">
          <h2 className="pricing-title">Transparent & simple pricing</h2>
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


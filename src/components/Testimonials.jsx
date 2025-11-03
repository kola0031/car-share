import { memo } from 'react';
import './Testimonials.css';

const Testimonials = () => {
  const testimonials = [
    {
      quote: "1Now gives you full control to shape your rental service exactly the way you want!",
      author: "Infine Auto"
    },
    {
      quote: "The software is user-friendly, quick, and makes managing rentals effortless.",
      author: "Tprausa Rentals"
    },
    {
      quote: "I have made $13,250 in extra revenue through 1Now",
      author: "Ehoma rentals"
    },
    {
      quote: "My average daily rate has gone up to $106 thanks to 1Now",
      author: "Motive Rentals"
    }
  ];

  const successStory = {
    title: "We helped north star go direct",
    amount: "$22,000",
    period: "IN 3 MONTHS"
  };

  return (
    <section className="testimonials">
      <div className="testimonials-container">
        <div className="success-story">
          <h3 className="success-subtitle">We helped north star go direct</h3>
          <h2 className="success-title">THEY earnED {successStory.amount}</h2>
          <div className="success-period">{successStory.period}</div>
        </div>

        <div className="profit-section">
          <h2 className="profit-title">Track daily profits, manage your fleet and grow revenue — all in one place</h2>
          <p className="profit-description">
            Fleet management software built for Turo Hosts. Monitor profits, optimize fleet usage and grow your direct booking revenue — all from one powerful dashboard.
          </p>
        </div>

        <div className="protection-section">
          <h2 className="protection-title">WE PROTECT YOUR CARS</h2>
          <p className="protection-description">
            We provide car insurance for your renters and ensure thorough protection by verifying both renters insurance and identification before granting full coverage
          </p>
        </div>

        <div className="money-section">
          <h2 className="money-title">We make sure you get paid on time</h2>
        </div>

        <div className="calculation-section">
          <h3 className="calculation-subtitle">Turo Hosts can Make More Money™!</h3>
          <h2 className="calculation-amount">$18,000*</h2>
          <p className="calculation-note">per year for every 5 cars</p>
          <p className="calculation-formula">
            *Save $25 in fees per day x 5 cars x 12 days per month x 12 months = $18,000
          </p>
        </div>

        <div className="hosts-section">
          <h2 className="hosts-title">WE have helped 125+ turo hosts make more money™</h2>
        </div>

        <div className="boost-section">
          <h3 className="boost-subtitle">Our Software Helps You</h3>
          <h2 className="boost-title">boost profits by 75%</h2>
          <p className="boost-description">
            Average daily rental: $75. Turo takes 25% = $18. If your profit is $25 per day, avoiding that fee boosts profit by 75%
          </p>
        </div>

        <div className="section-header">
          <h2 className="section-title">Our Clients Love Us</h2>
          <h3 className="section-subtitle">Testimonials</h3>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <p className="testimonial-quote">"{testimonial.quote}"</p>
              <p className="testimonial-author">— {testimonial.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default memo(Testimonials);


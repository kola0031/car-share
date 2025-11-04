import { memo } from 'react';
import './Testimonials.css';

const Testimonials = () => {
  const testimonials = [
    {
      quote: "HostPilot handles everything — I just check my portal and see the revenue. It's truly passive income.",
      author: "Atlanta Fleet Owner"
    },
    {
      quote: "The PackMyShare integration makes logistics seamless. I don't worry about storage or pickup anymore.",
      author: "Premium Host"
    },
    {
      quote: "Having HostPilot manage all my bookings across Turo and other platforms has doubled my bookings.",
      author: "Atlanta Vehicle Host"
    },
    {
      quote: "The VEVS portal is incredibly intuitive. I can see everything happening with my fleet in real-time.",
      author: "Enterprise Client"
    }
  ];

  const successStory = {
    title: "HostPilot Success Story",
    amount: "100+",
    period: "ACTIVE HOSTS IN ATLANTA"
  };

  return (
    <section className="testimonials">
      <div className="testimonials-container">
        <div className="success-story">
          <h3 className="success-subtitle">{successStory.title}</h3>
          <h2 className="success-title">{successStory.amount}</h2>
          <div className="success-period">{successStory.period}</div>
        </div>

        <div className="profit-section">
          <h2 className="profit-title">Monitor your fleet, track revenue, and grow passive income — all hands-free</h2>
          <p className="profit-description">
            Full-service fleet management platform for vehicle hosts. Access your VEVS portal anytime to see bookings, revenue, and fleet status — while HostPilot handles all operations.
          </p>
        </div>

        <div className="protection-section">
          <h2 className="protection-title">SECURE STORAGE & LOGISTICS</h2>
          <p className="protection-description">
            Your vehicles are safely stored at PackMyShare facilities in Atlanta. We handle all pickup and drop-off logistics, ensuring your fleet is secure and accessible for guests.
          </p>
        </div>

        <div className="money-section">
          <h2 className="money-title">Transparent revenue sharing — you always know where your money comes from</h2>
        </div>

        <div className="calculation-section">
          <h3 className="calculation-subtitle">Complete Fleet Management Solution</h3>
          <h2 className="calculation-amount">$150/mo</h2>
          <p className="calculation-note">per host — includes everything</p>
          <p className="calculation-formula">
            VEVS portal + PackMyShare parking + booking management + customer service + revenue tracking
          </p>
        </div>

        <div className="hosts-section">
          <h2 className="hosts-title">JOINING ATLANTA'S LEADING TECH-DRIVEN VEHICLE MANAGEMENT PLATFORM</h2>
        </div>

        <div className="boost-section">
          <h3 className="boost-subtitle">HostPilot's Value Proposition</h3>
          <h2 className="boost-title">HANDS-FREE PASSIVE INCOME</h2>
          <p className="boost-description">
            You own the vehicles. We handle listings, bookings, customer service, logistics, and maintenance. You focus on earning while we manage everything else.
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


import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LeadCapture from './LeadCapture';
import './Hero.css';

const Hero = () => {
  const navigate = useNavigate();
  const [showLeadForm, setShowLeadForm] = useState(false);

  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            <strong>Full-Service Fleet Management: Turn Your Vehicles Into Passive Income</strong>
          </h1>
          <p className="hero-subtitle">
            HostPilot manages everything for you — listings, bookings, maintenance, and guest support — while you earn passive income from your fleet. <strong>Hands-free vehicle income.</strong> Get started in Atlanta today!
          </p>
          <div className="hero-buttons">
            <a 
              href="#footer" 
              className="hero-btn-primary"
              onClick={(e) => {
                e.preventDefault();
                setShowLeadForm(true);
              }}
            >
              GET STARTED TODAY
            </a>
            <a 
              href="#footer" 
              className="hero-btn-secondary"
              onClick={(e) => {
                e.preventDefault();
                const footer = document.querySelector('footer');
                if (footer) {
                  footer.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              SCHEDULE A CALL
            </a>
            <a 
              href="#pricing" 
              className="hero-btn-secondary"
              onClick={(e) => {
                e.preventDefault();
                const pricing = document.querySelector('#pricing');
                if (pricing) {
                  pricing.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              VIEW PRICING
            </a>
            <a 
              href="/bookings" 
              className="hero-btn-secondary"
              onClick={(e) => {
                e.preventDefault();
                navigate('/bookings');
              }}
            >
              BOOK A CAR
            </a>
          </div>
          {showLeadForm && (
            <div className="hero-lead-form">
              <LeadCapture 
                type="host" 
                onSuccess={() => {
                  setShowLeadForm(false);
                  setTimeout(() => navigate('/register'), 2000);
                }}
              />
            </div>
          )}
        </div>
        
        <div className="hero-stats">
          <div className="stats-item">
            <h2>Atlanta's leading platform for</h2>
            <div className="stat-number">100+</div>
            <h3>Vehicle Hosts</h3>
            <div className="stat-highlight">PASSIVE INCOME</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;


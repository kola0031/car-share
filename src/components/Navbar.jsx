import { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <span className="logo-text">1Now</span>
        </div>
        
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <a 
            href="#features"
            onClick={(e) => {
              e.preventDefault();
              const features = document.querySelector('#features');
              if (features) {
                features.scrollIntoView({ behavior: 'smooth' });
              }
              setIsMenuOpen(false);
            }}
          >
            Features
          </a>
          <a 
            href="#pricing"
            onClick={(e) => {
              e.preventDefault();
              const pricing = document.querySelector('#pricing');
              if (pricing) {
                pricing.scrollIntoView({ behavior: 'smooth' });
              }
              setIsMenuOpen(false);
            }}
          >
            Pricing
          </a>
          <a 
            href="#footer"
            onClick={(e) => {
              e.preventDefault();
              const footer = document.querySelector('footer');
              if (footer) {
                footer.scrollIntoView({ behavior: 'smooth' });
              }
              setIsMenuOpen(false);
            }}
          >
            Make More Money™
          </a>
          <a 
            href="#footer"
            onClick={(e) => {
              e.preventDefault();
              alert('Blog section coming soon!');
              setIsMenuOpen(false);
            }}
          >
            Blogs
          </a>
          <a 
            href="#footer" 
            className="login-link"
            onClick={(e) => {
              e.preventDefault();
              alert('Login functionality coming soon!');
              setIsMenuOpen(false);
            }}
          >
            Login
          </a>
          <a 
            href="#footer" 
            className="cta-button"
            onClick={(e) => {
              e.preventDefault();
              const footer = document.querySelector('footer');
              if (footer) {
                footer.scrollIntoView({ behavior: 'smooth' });
              }
              setIsMenuOpen(false);
            }}
          >
            BOOK A FREE PROFIT DEMO CALL
          </a>
          <a 
            href="#footer" 
            className="cta-button-secondary"
            onClick={(e) => {
              e.preventDefault();
              const footer = document.querySelector('footer');
              if (footer) {
                footer.scrollIntoView({ behavior: 'smooth' });
              }
              setIsMenuOpen(false);
            }}
          >
            START FOR FREE
          </a>
        </div>

        <button 
          className="navbar-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      
      <div className="top-banner">
        Limited time offer: Free custom website
      </div>
    </nav>
  );
};

export default Navbar;


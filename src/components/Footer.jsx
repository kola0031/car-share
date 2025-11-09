import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer id="footer" className="footer">
      <div className="footer-container">
        <div className="footer-cta">
          <h2 className="footer-cta-title">Ready to earn passive income from your fleet?</h2>
          <div className="footer-cta-buttons">
            <Link 
              to="/register" 
              className="footer-btn-primary"
            >
              GET STARTED TODAY
            </Link>
            <a 
              href="#footer" 
              className="footer-btn-secondary"
              onClick={(e) => {
                e.preventDefault();
                alert('Thank you for your interest! Please contact us to schedule a consultation call.');
              }}
            >
              SCHEDULE A CALL
            </a>
          </div>
        </div>

        <div className="footer-content">
          <div className="footer-address">
            <p>Atlanta, Georgia</p>
            <p>United States</p>
            <div className="footer-social">
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="Twitter">🐦</a>
              <a href="#" aria-label="LinkedIn">💼</a>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4>Platform</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#faq">How It Works</a></li>
                <li><a href="#testimonials">Testimonials</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Services</h4>
              <ul>
                <li><a href="#features">Fleet Management</a></li>
                <li><a href="#features">PackMyShare Integration</a></li>
                <li><a href="#features">HostPilot Portal</a></li>
                <li><a href="#support">Support</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Company</h4>
              <ul>
                <li><a href="#terms">Terms of Service</a></li>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#contact">Contact Us</a></li>
                <li><a href="#faq">FAQs</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-newsletter">
            <h4>Stay Updated: Get Fleet Management Tips & Updates</h4>
            <form className="newsletter-form">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="newsletter-input"
                required
              />
              <button type="submit" className="newsletter-submit">SUBMIT</button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p>HostPilot is Atlanta's leading tech-driven vehicle management platform. We help hosts earn passive income through full-service fleet management. HostPilot partners with PackMyShare and leading booking platforms.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


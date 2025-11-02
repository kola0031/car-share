import './Footer.css';

const Footer = () => {
  return (
    <footer id="footer" className="footer">
      <div className="footer-container">
        <div className="footer-cta">
          <h2 className="footer-cta-title">Ready to make more MONEY™?</h2>
          <div className="footer-cta-buttons">
            <a 
              href="#footer" 
              className="footer-btn-primary"
              onClick={(e) => {
                e.preventDefault();
                alert('Thank you! You can sign up for 1Now by contacting us or visiting our sign-up page.');
              }}
            >
              START FOR FREE
            </a>
            <a 
              href="#footer" 
              className="footer-btn-secondary"
              onClick={(e) => {
                e.preventDefault();
                alert('Thank you for your interest! Please contact us to schedule a free profit demo call.');
              }}
            >
              BOOK A FREE PROFIT DEMO CALL
            </a>
          </div>
        </div>

        <div className="footer-content">
          <div className="footer-address">
            <p>309 5th Avenue</p>
            <p>New York, NY 10016</p>
            <div className="footer-social">
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="Twitter">🐦</a>
              <a href="#" aria-label="LinkedIn">💼</a>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#website">Free Custom Website</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#demo">Video Demo</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Product</h4>
              <ul>
                <li><a href="#make-more-money">Make More Money™</a></li>
                <li><a href="#demo">Book a Free Profit Demo Call</a></li>
                <li><a href="#start">Start for Free</a></li>
                <li><a href="#support">Support / Need Help?</a></li>
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
            <h4>Sign Up for Our Newsletter, Get Tricks to Earn More Money</h4>
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
          <p>1Now helps Turo Hosts go direct and Make More Money. 1Now is not affiliated with Turo.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


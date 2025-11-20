import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <span className="logo-text">HostPilot</span>
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
            href="#faq"
            onClick={(e) => {
              e.preventDefault();
              const faq = document.querySelector('#faq');
              if (faq) {
                faq.scrollIntoView({ behavior: 'smooth' });
              }
              setIsMenuOpen(false);
            }}
          >
            How It Works
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
          {isAuthenticated ? (
            <>
              {user?.role === 'driver' ? (
                <>
                  <Link
                    to="/bookings"
                    className="login-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Book a Trip
                  </Link>
                  <Link
                    to="/driver/trips"
                    className="login-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Trips
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="login-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              <a
                href="#"
                className="login-link"
                onClick={(e) => {
                  e.preventDefault();
                  logout();
                  navigate('/');
                  setIsMenuOpen(false);
                }}
              >
                Logout
              </a>
            </>
          ) : (
            <>
              <Link
                to="/bookings"
                className="login-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Book a Car
              </Link>
              <Link
                to="/login"
                className="login-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            </>
          )}
          {!isAuthenticated && (
            <Link
              to="/register"
              className="cta-button"
              onClick={() => setIsMenuOpen(false)}
            >
              GET STARTED
            </Link>
          )}
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
            SCHEDULE A CALL
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
        Atlanta's leading tech-driven vehicle management platform
      </div>
    </nav>
  );
};

export default Navbar;


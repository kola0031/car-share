import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            <strong>Turo hosts and car rental operators: INCREASE YOUR profits with private rentals</strong>
          </h1>
          <p className="hero-subtitle">
            Combine the power of Turo with your own private rental platform. Launch a free website and <strong>keep 100% of your revenue.</strong> Get started in just one day!
          </p>
          <div className="hero-buttons">
            <a 
              href="#footer" 
              className="hero-btn-primary"
              onClick={(e) => {
                e.preventDefault();
                const footer = document.querySelector('footer');
                if (footer) {
                  footer.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              MAKE MORE MONEY™
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
              BOOK A FREE PROFIT DEMO CALL
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
              START FOR FREE
            </a>
          </div>
        </div>
        
        <div className="hero-stats">
          <div className="stats-item">
            <h2>We are a New York-based company helping</h2>
            <div className="stat-number">125+</div>
            <h3>Turo hosts</h3>
            <div className="stat-highlight">MAKE MORE MONEY™</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;


import { useState } from 'react';
import { leadsAPI } from '../utils/api';
import './LeadCapture.css';

const LeadCapture = ({ type = 'host', onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await leadsAPI.create({
        ...formData,
        type: type,
        source: 'website',
      });
      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setSuccess(false);
        setFormData({ name: '', email: '', phone: '' });
      }, 3000);
    } catch (error) {
      setError(error.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="lead-capture-success">
        <div className="success-icon">✓</div>
        <h3>Thank you!</h3>
        <p>We'll be in touch soon to help you get started.</p>
      </div>
    );
  }

  return (
    <form className="lead-capture-form" onSubmit={handleSubmit}>
      {error && <div className="lead-error">{error}</div>}
      <div className="lead-form-group">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your Name"
          required
          disabled={loading}
        />
      </div>
      <div className="lead-form-group">
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Your Email"
          required
          disabled={loading}
        />
      </div>
      <div className="lead-form-group">
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone (Optional)"
          disabled={loading}
        />
      </div>
      <button type="submit" className="lead-submit-btn" disabled={loading}>
        {loading ? 'Submitting...' : type === 'host' ? 'Become a Host' : 'Get Started'}
      </button>
    </form>
  );
};

export default LeadCapture;


import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { hostsAPI, fleetsAPI } from '../utils/api';
import ProtectedRoute from '../components/ProtectedRoute';
import './Onboarding.css';

const Onboarding = () => {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState('');
  const [hostId, setHostId] = useState(null);

  const [formData, setFormData] = useState({
    companyName: '',
    parkMyShareLocation: 'Atlanta, GA',
  });

  useEffect(() => {
    if (authLoading) return;

    const init = async () => {
      try {
        setError('');

        // Check authentication
        if (!user) {
          setError('Please log in to continue.');
          navigate('/login');
          return;
        }

        // Get hostId - try from user object first, then from API
        let currentHostId = user?.hostId;

        if (!currentHostId && user?.id) {
          try {
            const host = await hostsAPI.getByUserId(user.id);
            if (host) {
              currentHostId = host.id;
              // Refresh user to get updated hostId
              await refreshUser();
            }
          } catch (err) {
            console.warn('Could not find host:', err);
          }
        }

        if (!currentHostId) {
          setError('Host profile not found. Please ensure you registered as a host.');
          setInitializing(false);
          return;
        }

        setHostId(currentHostId);

        // Load host data to check status
        try {
          const host = await hostsAPI.getOne(currentHostId);

          // If already completed, redirect
          if (host.onboardingStatus === 'completed') {
            navigate('/dashboard');
            return;
          }

          // Pre-fill form if data exists
          if (host.companyName) {
            setFormData(prev => ({ ...prev, companyName: host.companyName }));
          }
          if (host.parkMyShareLocation) {
            setFormData(prev => ({ ...prev, parkMyShareLocation: host.parkMyShareLocation }));
          }
        } catch (err) {
          console.warn('Could not load host data:', err);
          // Continue anyway - we have hostId
        }
      } catch (error) {
        console.error('Initialization error:', error);
        setError(error.message || 'Failed to initialize. Please try refreshing.');
      } finally {
        setInitializing(false);
      }
    };

    init();
  }, [user, authLoading, navigate, refreshUser]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleComplete = async () => {
    if (!hostId) {
      setError('Host ID not found. Please refresh the page.');
      return;
    }

    // Verify token exists before making request
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Onboarding: No token found in localStorage');
      setError('Session expired. Please log in again.');
      // Optional: Redirect to login after a delay
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Update host with company name and location, then mark as completed
      await hostsAPI.update(hostId, {
        companyName: formData.companyName || user?.name + "'s Fleet",
        parkMyShareLocation: formData.parkMyShareLocation || 'Atlanta, GA',
        onboardingStatus: 'completed',
      });

      // Optionally create a default fleet (non-blocking)
      try {
        await fleetsAPI.create({
          name: 'Main Fleet',
        });
      } catch (fleetError) {
        console.warn('Could not create default fleet:', fleetError);
        // Continue anyway - fleet creation is optional
      }

      // Refresh user data
      if (refreshUser) {
        await refreshUser();
      }

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setError(error.message || 'Failed to complete setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while initializing
  if (authLoading || initializing) {
    return (
      <ProtectedRoute>
        <div className="onboarding-container">
          <div className="onboarding-card">
            <div className="onboarding-header">
              <h1 className="onboarding-title">Welcome to HostPilot!</h1>
              <p className="onboarding-subtitle">Loading your account...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Show error state if hostId not found
  if (!hostId && !initializing) {
    return (
      <ProtectedRoute>
        <div className="onboarding-container">
          <div className="onboarding-card">
            <div className="onboarding-header">
              <h1 className="onboarding-title">Welcome to HostPilot!</h1>
              <p className="onboarding-subtitle">Setup Required</p>
            </div>
            {error && (
              <div className="error-message" style={{
                padding: '16px',
                margin: '16px 0',
                backgroundColor: '#fee',
                color: '#c33',
                borderRadius: '8px',
                border: '1px solid #fcc',
              }}>
                {error}
              </div>
            )}
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="onboarding-container">
        <div className="onboarding-card">
          <div className="onboarding-header">
            <h1 className="onboarding-title">Welcome to HostPilot!</h1>
            <p className="onboarding-subtitle">Let's get your account set up</p>
          </div>

          {error && (
            <div className="error-message" style={{
              padding: '12px',
              margin: '16px 0',
              backgroundColor: '#fee',
              color: '#c33',
              borderRadius: '4px',
              border: '1px solid #fcc',
            }}>
              {error}
            </div>
          )}

          {/* Simple Single Form */}
          <div className="step-content">
            <div className="step-form">
              <h2>Basic Information</h2>
              <p className="step-help">Tell us a bit about your business</p>

              <div className="form-group">
                <label htmlFor="companyName">Company/Fleet Name</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder={user?.name ? `${user.name}'s Fleet` : 'My Fleet'}
                  disabled={loading}
                />
                <small>You can change this later in settings</small>
              </div>

              <div className="form-group">
                <label htmlFor="parkMyShareLocation">Location</label>
                <input
                  type="text"
                  id="parkMyShareLocation"
                  name="parkMyShareLocation"
                  value={formData.parkMyShareLocation}
                  onChange={handleChange}
                  placeholder="Atlanta, GA"
                  disabled={loading}
                />
                <small>Where your vehicles will be stored and guests can pick them up</small>
              </div>

              <div className="onboarding-summary">
                <h3>What's Next?</h3>
                <ul>
                  <li>✓ Access your HostPilot dashboard</li>
                  <li>✓ Add vehicles to your fleet</li>
                  <li>✓ Set up your booking calendar</li>
                  <li>✓ Start earning passive income!</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Complete Button */}
          <div className="onboarding-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={handleComplete}
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Setting up...' : 'Complete Setup'}
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Onboarding;


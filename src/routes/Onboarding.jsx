import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { hostsAPI, fleetsAPI } from '../utils/api';
import ProtectedRoute from '../components/ProtectedRoute';
import './Onboarding.css';

const Onboarding = () => {
  const { user, loading: authLoading, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState('');
  const [hostId, setHostId] = useState(null);
  
  const [formData, setFormData] = useState({
    companyName: '',
    parkMyShareLocation: 'Atlanta, GA',
  });

  const initializeOnboarding = useCallback(async () => {
    setInitializing(true);
    setError('');

    try {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        setInitializing(false);
        navigate('/login');
        return;
      }

      // If user doesn't have hostId, try to refresh user data first
      let currentUser = user;
      if (!currentUser?.hostId && refreshUser) {
        currentUser = await refreshUser();
      }

      // If still no hostId, try to get host by userId
      if (!currentUser?.hostId && currentUser?.id) {
        try {
          const host = await hostsAPI.getByUserId(currentUser.id);
          if (host) {
            // Update user context with hostId
            if (refreshUser) {
              await refreshUser();
            }
            currentUser = { ...currentUser, hostId: host.id };
          }
        } catch (err) {
          console.warn('Could not find host by userId:', err);
        }
      }

      // If we still don't have hostId, this is an error
      if (!currentUser?.hostId) {
        setError('Host profile not found. Please ensure you registered as a host. If the problem persists, please contact support.');
        setInitializing(false);
        return;
      }

      // Load host data
      await loadHostData(currentUser.hostId);
    } catch (error) {
      console.error('Error initializing onboarding:', error);
      setError(error.message || 'Failed to initialize onboarding. Please try refreshing the page.');
    } finally {
      setInitializing(false);
    }
  }, [user, refreshUser, navigate]);

  useEffect(() => {
    // Wait for auth to finish loading before proceeding
    if (authLoading) {
      return;
    }

    initializeOnboarding();
  }, [user, authLoading, initializeOnboarding]);

  const loadHostData = async (hostId) => {
    try {
      const host = await hostsAPI.getOne(hostId);
      setHostData(host);
      
      // If onboarding is already completed, redirect to dashboard
      if (host.onboardingStatus === 'completed') {
        navigate('/dashboard');
        return;
      }
      
      // Pre-fill form data if available
      if (host.companyName) {
        setFormData(prev => ({ ...prev, companyName: host.companyName }));
      }
      if (host.parkMyShareLocation) {
        setFormData(prev => ({ ...prev, parkMyShareLocation: host.parkMyShareLocation }));
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

    setError('');
    
    // Ensure we have hostId
    const hostId = user?.hostId || hostData?.id;
    if (!hostId) {
      setError('Host ID not found. Please try refreshing the page or logging out and back in.');
      return;
    }
    
    if (currentStep === 1) {
      // Update company name
      try {
        setLoading(true);
        await hostsAPI.update(hostId, {
          companyName: formData.companyName || user?.name + "'s Fleet",
        });
        // Refresh host data
        await loadHostData(hostId);
        setCurrentStep(2);
      } catch (error) {
        console.error('Error updating host:', error);
        setError(error.message || 'Failed to update company name. Please try again.');
      } finally {
        setLoading(false);
      }
    } else if (currentStep === 2) {
      // Create fleet
      try {
        setLoading(true);
        await fleetsAPI.create({
          name: 'Main Fleet',
        });
      } catch (fleetError) {
        console.warn('Could not create default fleet:', fleetError);
        // Continue anyway - fleet creation is optional
      }
    } else if (currentStep === 3) {
      // Add vehicle
      if (formData.vehicleMake && formData.vehicleModel) {
        try {
          setLoading(true);
          await vehiclesAPI.create({
            make: formData.vehicleMake,
            model: formData.vehicleModel,
            year: formData.vehicleYear,
            licensePlate: formData.vehicleLicensePlate,
            vin: formData.vehicleVIN,
            status: 'available',
            hostId: hostId,
          });
          setCurrentStep(4);
        } catch (error) {
          console.error('Error creating vehicle:', error);
          setError(error.message || 'Failed to create vehicle. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        setCurrentStep(4);
      }
    } else if (currentStep === 4) {
      // Complete onboarding
      try {
        setLoading(true);
        await hostsAPI.update(hostId, {
          onboardingStatus: 'completed',
          parkMyShareLocation: formData.parkMyShareLocation || 'Atlanta, GA',
        });
        // Refresh user data to get updated onboarding status
        if (refreshUser) {
          await refreshUser();
        }
        navigate('/dashboard');
      } catch (error) {
        console.error('Error completing onboarding:', error);
        setError(error.message || 'Failed to complete onboarding. Please try again.');
      } finally {
        setLoading(false);
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
              whiteSpace: 'pre-line'
            }}>
              {error}
              {(error.includes('Host profile not found') || 
                error.includes('session') || 
                error.includes('expired') || 
                error.includes('invalid') ||
                error.includes('Authentication')) && (
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={initializeOnboarding}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Retry
                  </button>
                  {(error.includes('session') || error.includes('expired') || error.includes('invalid')) && (
                    <button 
                      onClick={() => {
                        logout();
                        navigate('/login');
                      }}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Go to Login
                    </button>
                  )}
                </div>
              )}
              {error.includes('Unable to connect to server') && (
                <div style={{ marginTop: '12px' }}>
                  <button 
                    onClick={initializeOnboarding}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Retry After Starting Server
                  </button>
                </div>
              )}
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


import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { hostsAPI, fleetsAPI, vehiclesAPI } from '../utils/api';
import ProtectedRoute from '../components/ProtectedRoute';
import './Onboarding.css';

const Onboarding = () => {
  const { user, loading: authLoading, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState('');
  const [hostData, setHostData] = useState(null);
  
  const [formData, setFormData] = useState({
    companyName: '',
    parkMyShareLocation: '',
    fleetName: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleLicensePlate: '',
    vehicleVIN: '',
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
    } catch (error) {
      console.error('Error loading host data:', error);
      setError(error.message || 'Failed to load host data. Please try refreshing the page.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = async () => {
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
          name: formData.fleetName || 'Main Fleet',
        });
        setCurrentStep(3);
      } catch (error) {
        console.error('Error creating fleet:', error);
        setError(error.message || 'Failed to create fleet. Please try again.');
      } finally {
        setLoading(false);
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
    }
  };

  const handleSkip = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleNext();
    }
  };

  const steps = [
    { number: 1, title: 'Company Information', description: 'Tell us about your business' },
    { number: 2, title: 'Create Fleet', description: 'Set up your first fleet' },
    { number: 3, title: 'Add Vehicle', description: 'Add your first vehicle (optional)' },
    { number: 4, title: 'Complete Setup', description: 'Finalize your account' },
  ];

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
            <p className="onboarding-subtitle">Let's get your account set up in just a few steps</p>
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

          {/* Progress Steps */}
          <div className="steps-indicator">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`step-item ${currentStep >= step.number ? 'active' : ''} ${currentStep === step.number ? 'current' : ''}`}
              >
                <div className="step-number">{step.number}</div>
                <div className="step-info">
                  <div className="step-title">{step.title}</div>
                  <div className="step-description">{step.description}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="step-content">
            {currentStep === 1 && (
              <div className="step-form">
                <h2>Company Information</h2>
                <p className="step-help">Tell us about your business or fleet name</p>
                <div className="form-group">
                  <label htmlFor="companyName">Company/Fleet Name</label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder={user?.name + "'s Fleet"}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="step-form">
                <h2>Create Your First Fleet</h2>
                <p className="step-help">Organize your vehicles into fleets for better management</p>
                <div className="form-group">
                  <label htmlFor="fleetName">Fleet Name</label>
                  <input
                    type="text"
                    id="fleetName"
                    name="fleetName"
                    value={formData.fleetName}
                    onChange={handleChange}
                    placeholder="Main Fleet"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="step-form">
                <h2>Add Your First Vehicle (Optional)</h2>
                <p className="step-help">You can add more vehicles later from the dashboard</p>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="vehicleMake">Make</label>
                    <input
                      type="text"
                      id="vehicleMake"
                      name="vehicleMake"
                      value={formData.vehicleMake}
                      onChange={handleChange}
                      placeholder="Toyota"
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="vehicleModel">Model</label>
                    <input
                      type="text"
                      id="vehicleModel"
                      name="vehicleModel"
                      value={formData.vehicleModel}
                      onChange={handleChange}
                      placeholder="Camry"
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="vehicleYear">Year</label>
                    <input
                      type="number"
                      id="vehicleYear"
                      name="vehicleYear"
                      value={formData.vehicleYear}
                      onChange={handleChange}
                      placeholder="2023"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="vehicleLicensePlate">License Plate (Optional)</label>
                    <input
                      type="text"
                      id="vehicleLicensePlate"
                      name="vehicleLicensePlate"
                      value={formData.vehicleLicensePlate}
                      onChange={handleChange}
                      placeholder="ABC-1234"
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="vehicleVIN">VIN (Optional)</label>
                    <input
                      type="text"
                      id="vehicleVIN"
                      name="vehicleVIN"
                      value={formData.vehicleVIN}
                      onChange={handleChange}
                      placeholder="1HGBH41JXMN109186"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="step-form">
                <h2>Complete Your Setup</h2>
                <p className="step-help">Almost done! Just confirm your location for PackMyShare integration</p>
                <div className="form-group">
                  <label htmlFor="parkMyShareLocation">PackMyShare Location</label>
                  <input
                    type="text"
                    id="parkMyShareLocation"
                    name="parkMyShareLocation"
                    value={formData.parkMyShareLocation}
                    onChange={handleChange}
                    placeholder="Atlanta, GA"
                    disabled={loading}
                  />
                  <small>This is where your vehicles will be stored and guests can pick them up</small>
                </div>
                <div className="onboarding-summary">
                  <h3>What's Next?</h3>
                  <ul>
                    <li>✓ Access your HostPilot portal dashboard</li>
                    <li>✓ Add more vehicles to your fleet</li>
                    <li>✓ Set up your booking calendar</li>
                    <li>✓ Start earning passive income!</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="onboarding-actions">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={loading}
              >
                Back
              </button>
            )}
            <div className="actions-right">
              {currentStep < 4 && (
                <button
                  type="button"
                  className="btn-skip"
                  onClick={handleSkip}
                  disabled={loading}
                >
                  Skip
                </button>
              )}
              <button
                type="button"
                className="btn-primary"
                onClick={handleNext}
                disabled={loading}
              >
                {loading ? 'Saving...' : currentStep === 4 ? 'Complete Setup' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Onboarding;


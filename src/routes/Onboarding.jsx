import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { hostsAPI, fleetsAPI, vehiclesAPI } from '../utils/api';
import ProtectedRoute from '../components/ProtectedRoute';
import './Onboarding.css';

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    // Verify token is available before loading host data
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please log in again.');
      return;
    }
    loadHostData();
  }, [user]);

  const loadHostData = async () => {
    if (!user?.hostId) {
      // If user doesn't have hostId, they might have just registered
      // Wait a moment and check again, or show an error
      console.warn('User does not have hostId yet');
      setError('Host profile not found. Please try logging out and logging back in.');
      return;
    }
    try {
      const host = await hostsAPI.getOne(user.hostId);
      setHostData(host);
      if (host.onboardingStatus === 'completed') {
        navigate('/dashboard');
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
    
    if (currentStep === 1) {
      // Update company name
      try {
        setLoading(true);
        if (!user?.hostId) {
          setError('Host ID not found. Please try logging in again.');
          return;
        }
        await hostsAPI.update(user.hostId, {
          companyName: formData.companyName || user.name + "'s Fleet",
        });
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
        if (!user?.hostId) {
          setError('Host ID not found. Please try logging out and logging back in.');
          return;
        }
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
            hostId: user.hostId,
          });
          setCurrentStep(4);
        } catch (error) {
          console.error('Error creating vehicle:', error);
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
        await hostsAPI.update(user.hostId, {
          onboardingStatus: 'completed',
          parkMyShareLocation: formData.parkMyShareLocation || 'Atlanta, GA',
        });
        navigate('/dashboard');
      } catch (error) {
        console.error('Error completing onboarding:', error);
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
              border: '1px solid #fcc'
            }}>
              {error}
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


import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { bookingsAPI, vehiclesAPI } from '../utils/api';
import ProtectedRoute from '../components/ProtectedRoute';
import './Bookings.css';

const Bookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    location: '',
    startDate: '',
    endDate: '',
  });
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    driverName: user?.name || '',
    driverEmail: user?.email || '',
    driverPhone: '',
    driverLicense: '',
    specialRequests: '',
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchParams.startDate || !searchParams.endDate) {
      alert('Please select pickup and return dates');
      return;
    }

    setLoading(true);
    try {
      const vehicles = await bookingsAPI.getAvailable(
        searchParams.startDate,
        searchParams.endDate,
        searchParams.location
      );
      setAvailableVehicles(vehicles);
    } catch (error) {
      console.error('Error searching vehicles:', error);
      alert('Error searching for vehicles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (vehicle, startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const days = Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
    );
    return (vehicle.dailyRate || 0) * days;
  };

  const handleBook = async (vehicle) => {
    if (!user) {
      navigate('/login?redirect=/bookings');
      return;
    }

    if (!user.driverId) {
      alert('Please complete your driver profile first');
      navigate('/driver/register');
      return;
    }

    const totalAmount = calculateTotal(vehicle, searchParams.startDate, searchParams.endDate);
    
    try {
      setLoading(true);
      const booking = await bookingsAPI.create({
        driverId: user.driverId,
        vehicleId: vehicle.id,
        pickupDate: searchParams.startDate,
        returnDate: searchParams.endDate,
        pickupLocation: vehicle.parkMyShareLocation || 'PackMyShare Location',
        returnLocation: vehicle.parkMyShareLocation || 'PackMyShare Location',
        totalAmount: totalAmount,
        dailyRate: vehicle.dailyRate,
        driverName: bookingData.driverName,
        driverEmail: bookingData.driverEmail,
        driverPhone: bookingData.driverPhone,
        driverLicense: bookingData.driverLicense,
        specialRequests: bookingData.specialRequests,
      });
      
      alert('Booking created successfully! Redirecting to your trips...');
      navigate('/driver/trips');
    } catch (error) {
      console.error('Error creating booking:', error);
      alert(error.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  return (
    <div className="bookings-page">
      <div className="bookings-header">
        <h1>Book Your Perfect Ride</h1>
        <p>Search available vehicles and book your trip in minutes</p>
      </div>

      <div className="bookings-container">
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-field">
              <label>Pickup Location</label>
              <input
                type="text"
                placeholder="Atlanta, GA"
                value={searchParams.location}
                onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
              />
            </div>
            <div className="search-field">
              <label>Pickup Date</label>
              <input
                type="date"
                value={searchParams.startDate}
                onChange={(e) => setSearchParams({ ...searchParams, startDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="search-field">
              <label>Return Date</label>
              <input
                type="date"
                value={searchParams.endDate}
                onChange={(e) => setSearchParams({ ...searchParams, endDate: e.target.value })}
                min={searchParams.startDate || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <button type="submit" className="search-btn" disabled={loading}>
              {loading ? 'Searching...' : 'Search Vehicles'}
            </button>
          </form>
        </div>

        <div className="vehicles-section">
          {availableVehicles.length > 0 ? (
            <>
              <h2>Available Vehicles ({availableVehicles.length})</h2>
              <div className="vehicles-grid">
                {availableVehicles.map((vehicle) => {
                  const total = calculateTotal(vehicle, searchParams.startDate, searchParams.endDate);
                  const days = searchParams.startDate && searchParams.endDate
                    ? Math.ceil((new Date(searchParams.endDate) - new Date(searchParams.startDate)) / (1000 * 60 * 60 * 24))
                    : 0;

                  return (
                    <div key={vehicle.id} className="vehicle-card-booking">
                      <div className="vehicle-image-placeholder">
                        {vehicle.photos && vehicle.photos.length > 0 ? (
                          <img src={vehicle.photos[0]} alt={`${vehicle.make} ${vehicle.model}`} />
                        ) : (
                          <div className="vehicle-icon">🚗</div>
                        )}
                      </div>
                      <div className="vehicle-info-booking">
                        <h3>{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                        <p className="vehicle-location">📍 {vehicle.parkMyShareLocation || 'Atlanta, GA'}</p>
                        <div className="vehicle-features">
                          {vehicle.features && vehicle.features.length > 0 && (
                            <div className="features-list">
                              {vehicle.features.slice(0, 3).map((feature, idx) => (
                                <span key={idx} className="feature-tag">{feature}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="vehicle-pricing">
                          <div className="daily-rate">{formatCurrency(vehicle.dailyRate)}/day</div>
                          {days > 0 && (
                            <div className="total-price">
                              Total: {formatCurrency(total)} ({days} {days === 1 ? 'day' : 'days'})
                            </div>
                          )}
                        </div>
                        <button
                          className="book-btn"
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            document.getElementById('booking-modal')?.showModal();
                          }}
                          disabled={loading}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : availableVehicles.length === 0 && searchParams.startDate && searchParams.endDate ? (
            <div className="no-results">
              <p>No vehicles available for the selected dates. Try different dates or location.</p>
            </div>
          ) : (
            <div className="search-prompt">
              <p>Enter your search criteria above to find available vehicles</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedVehicle && (
        <dialog id="booking-modal" className="booking-modal">
          <div className="modal-content">
            <h2>Complete Your Booking</h2>
            <div className="selected-vehicle-summary">
              <h3>{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</h3>
              <p>{formatCurrency(selectedVehicle.dailyRate)}/day</p>
              <p>Total: {formatCurrency(calculateTotal(selectedVehicle, searchParams.startDate, searchParams.endDate))}</p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleBook(selectedVehicle);
              }}
            >
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={bookingData.driverName}
                  onChange={(e) => setBookingData({ ...bookingData, driverName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={bookingData.driverEmail}
                  onChange={(e) => setBookingData({ ...bookingData, driverEmail: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={bookingData.driverPhone}
                  onChange={(e) => setBookingData({ ...bookingData, driverPhone: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Driver's License Number</label>
                <input
                  type="text"
                  value={bookingData.driverLicense}
                  onChange={(e) => setBookingData({ ...bookingData, driverLicense: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Special Requests (Optional)</label>
                <textarea
                  value={bookingData.specialRequests}
                  onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => document.getElementById('booking-modal')?.close()}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-confirm" disabled={loading}>
                  {loading ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default Bookings;


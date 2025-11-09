import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { tripsAPI, bookingsAPI } from '../utils/api';
import ProtectedRoute from '../components/ProtectedRoute';
import './DriverTrips.css';

const DriverTrips = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, active, past

  useEffect(() => {
    if (user?.driverId) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tripsData, bookingsData] = await Promise.all([
        tripsAPI.getAll({ driverId: user.driverId }),
        bookingsAPI.getAll({ driverId: user.driverId }),
      ]);
      setTrips(tripsData);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrip = async (tripId) => {
    try {
      await tripsAPI.start(tripId, {
        mileageStart: 0,
        fuelLevelStart: 100,
      });
      await loadData();
      alert('Trip started successfully!');
    } catch (error) {
      console.error('Error starting trip:', error);
      alert('Failed to start trip. Please try again.');
    }
  };

  const handleCompleteTrip = async (tripId) => {
    const mileageEnd = prompt('Enter ending mileage:');
    const fuelLevelEnd = prompt('Enter fuel level (0-100):');
    
    if (!mileageEnd || !fuelLevelEnd) return;

    try {
      await tripsAPI.complete(tripId, {
        mileageEnd: parseInt(mileageEnd),
        fuelLevelEnd: parseInt(fuelLevelEnd),
      });
      await loadData();
      alert('Trip completed successfully!');
    } catch (error) {
      console.error('Error completing trip:', error);
      alert('Failed to complete trip. Please try again.');
    }
  };

  const getTripStatus = (trip) => {
    if (trip.status === 'scheduled') return 'upcoming';
    if (trip.status === 'active') return 'active';
    if (trip.status === 'completed' || trip.status === 'cancelled') return 'past';
    return 'upcoming';
  };

  const filteredTrips = trips.filter(trip => {
    if (activeTab === 'upcoming') return getTripStatus(trip) === 'upcoming';
    if (activeTab === 'active') return getTripStatus(trip) === 'active';
    if (activeTab === 'past') return getTripStatus(trip) === 'past';
    return true;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="driver-trips-page">
        <div className="loading-state">Loading your trips...</div>
      </div>
    );
  }

  return (
    <div className="driver-trips-page">
      <div className="trips-header">
        <h1>My Trips</h1>
        <button className="btn-primary" onClick={() => navigate('/bookings')}>
          Book a New Trip
        </button>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming ({trips.filter(t => getTripStatus(t) === 'upcoming').length})
        </button>
        <button
          className={`tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active ({trips.filter(t => getTripStatus(t) === 'active').length})
        </button>
        <button
          className={`tab ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Past ({trips.filter(t => getTripStatus(t) === 'past').length})
        </button>
      </div>

      <div className="trips-list">
        {filteredTrips.length > 0 ? (
          filteredTrips.map((trip) => {
            const booking = bookings.find(b => b.id === trip.bookingId);
            return (
              <div key={trip.id} className="trip-card">
                <div className="trip-header">
                  <div className="trip-vehicle">
                    <h3>{booking?.vehicleId || 'Vehicle'}</h3>
                    <span className={`status-badge status-${trip.status}`}>
                      {trip.status}
                    </span>
                  </div>
                  {booking && (
                    <div className="trip-amount">
                      {formatCurrency(booking.totalAmount)}
                    </div>
                  )}
                </div>

                <div className="trip-details">
                  <div className="detail-item">
                    <span className="detail-label">Pickup:</span>
                    <span className="detail-value">
                      {formatDate(booking?.pickupDate || trip.pickupTime)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Return:</span>
                    <span className="detail-value">
                      {formatDate(booking?.returnDate || trip.returnTime)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{trip.pickupLocation || 'PackMyShare'}</span>
                  </div>
                </div>

                {trip.status === 'scheduled' && (
                  <div className="trip-actions">
                    <button
                      className="btn-start"
                      onClick={() => handleStartTrip(trip.id)}
                    >
                      Start Trip
                    </button>
                  </div>
                )}

                {trip.status === 'active' && (
                  <div className="trip-actions">
                    <button
                      className="btn-complete"
                      onClick={() => handleCompleteTrip(trip.id)}
                    >
                      Complete Trip
                    </button>
                    <button
                      className="btn-support"
                      onClick={() => alert('Support chat coming soon!')}
                    >
                      Get Support
                    </button>
                  </div>
                )}

                {trip.status === 'completed' && (
                  <div className="trip-completed">
                    <p>✓ Trip completed on {formatDate(trip.returnTime)}</p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="no-trips">
            <p>No {activeTab} trips found.</p>
            {activeTab === 'upcoming' && (
              <button className="btn-primary" onClick={() => navigate('/bookings')}>
                Book Your First Trip
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverTrips;


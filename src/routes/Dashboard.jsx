import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, reservationsAPI, vehiclesAPI } from '../utils/api';
import ProtectedRoute from '../components/ProtectedRoute';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentReservations, setRecentReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, reservationsData] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentReservations(),
      ]);
      setStats(statsData);
      setRecentReservations(reservationsData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="dashboard-loading">
          <div className="loader">Loading dashboard...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="dashboard">
        <div className="dashboard-header">
          <div className="dashboard-header-content">
            <div>
              <h1 className="dashboard-title">Dashboard</h1>
              <p className="dashboard-subtitle">
                Welcome back, {user?.name || 'User'}!
              </p>
            </div>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="dashboard-tabs">
            <button
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`tab ${activeTab === 'reservations' ? 'active' : ''}`}
              onClick={() => setActiveTab('reservations')}
            >
              Reservations
            </button>
            <button
              className={`tab ${activeTab === 'vehicles' ? 'active' : ''}`}
              onClick={() => setActiveTab('vehicles')}
            >
              Vehicles
            </button>
          </div>

          {activeTab === 'overview' && stats && (
            <div className="dashboard-overview">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-content">
                    <h3 className="stat-label">Total Reservations</h3>
                    <p className="stat-value">{stats.totalReservations}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-content">
                    <h3 className="stat-label">Active Reservations</h3>
                    <p className="stat-value">{stats.activeReservations}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">⏳</div>
                  <div className="stat-content">
                    <h3 className="stat-label">Pending</h3>
                    <p className="stat-value">{stats.pendingReservations}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">🚗</div>
                  <div className="stat-content">
                    <h3 className="stat-label">Total Vehicles</h3>
                    <p className="stat-value">{stats.totalVehicles}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-content">
                    <h3 className="stat-label">Total Revenue</h3>
                    <p className="stat-value">{formatCurrency(stats.totalRevenue)}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">📅</div>
                  <div className="stat-content">
                    <h3 className="stat-label">Monthly Revenue</h3>
                    <p className="stat-value">{formatCurrency(stats.monthlyRevenue)}</p>
                  </div>
                </div>
              </div>

              <div className="recent-reservations">
                <h2 className="section-title">Recent Reservations</h2>
                {recentReservations.length > 0 ? (
                  <div className="reservations-list">
                    {recentReservations.map((reservation) => (
                      <div key={reservation.id} className="reservation-card">
                        <div className="reservation-info">
                          <h4>{reservation.customerName}</h4>
                          <p>{reservation.customerEmail}</p>
                          <p className="reservation-dates">
                            {formatDate(reservation.pickupDate)} - {formatDate(reservation.returnDate)}
                          </p>
                        </div>
                        <div className="reservation-status">
                          <span className={`status-badge ${reservation.status}`}>
                            {reservation.status}
                          </span>
                          {reservation.totalAmount && (
                            <p className="reservation-amount">
                              {formatCurrency(reservation.totalAmount)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">No reservations yet</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reservations' && (
            <div className="dashboard-section">
              <h2 className="section-title">Reservations Management</h2>
              <p className="section-description">
                Reservation management features coming soon...
              </p>
            </div>
          )}

          {activeTab === 'vehicles' && (
            <div className="dashboard-section">
              <h2 className="section-title">Fleet Management</h2>
              <p className="section-description">
                Vehicle management features coming soon...
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;


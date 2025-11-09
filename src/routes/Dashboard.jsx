import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  hostsAPI, 
  fleetsAPI, 
  subscriptionsAPI, 
  performanceAPI, 
  ticketsAPI,
  vehiclesAPI,
  reservationsAPI 
} from '../utils/api';
import ProtectedRoute from '../components/ProtectedRoute';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [hostData, setHostData] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [fleets, setFleets] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [recentReservations, setRecentReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user?.hostId) {
      loadHostPortalData();
    } else if (user?.id) {
      // Try to get host by user ID
      loadHostByUserId();
    }
  }, [user]);

  const loadHostByUserId = async () => {
    try {
      const host = await hostsAPI.getByUserId(user.id);
      if (host) {
        await loadHostPortalData(host.id);
      }
    } catch (error) {
      console.error('Error loading host:', error);
      setLoading(false);
    }
  };

  const loadHostPortalData = async (hostId = null) => {
    try {
      setLoading(true);
      const id = hostId || user?.hostId;
      if (!id) {
        setLoading(false);
        return;
      }

      const [
        dashboardData,
        performanceData,
        subscriptionData,
        fleetsData,
        ticketsData,
        vehiclesData,
        reservationsData
      ] = await Promise.all([
        hostsAPI.getDashboard(id).catch(() => null),
        performanceAPI.getDashboard(id).catch(() => null),
        subscriptionsAPI.getCurrent(id).catch(() => null),
        fleetsAPI.getAll().catch(() => []),
        ticketsAPI.getAll(id).catch(() => []),
        vehiclesAPI.getAll().catch(() => []),
        reservationsAPI.getAll().catch(() => [])
      ]);

      setHostData(dashboardData);
      setPerformance(performanceData?.performance || null);
      setSubscription(subscriptionData);
      setFleets(fleetsData);
      setTickets(ticketsData.slice(0, 5)); // Show recent 5 tickets
      setVehicles(vehiclesData);
      setRecentReservations(reservationsData.slice(0, 5)); // Show recent 5 reservations

      // Check onboarding status
      if (dashboardData?.host?.onboardingStatus !== 'completed') {
        navigate('/onboarding');
        return;
      }
    } catch (error) {
      console.error('Error loading host portal:', error);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="dashboard-loading">
          <div className="loader">Loading Host Portal...</div>
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
              <h1 className="dashboard-title">HostPilot Portal</h1>
              <p className="dashboard-subtitle">
                Welcome back, {user?.name || 'Host'}! {hostData?.host?.companyName && `• ${hostData.host.companyName}`}
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
              className={`tab ${activeTab === 'performance' ? 'active' : ''}`}
              onClick={() => setActiveTab('performance')}
            >
              Performance
            </button>
            <button
              className={`tab ${activeTab === 'fleet' ? 'active' : ''}`}
              onClick={() => setActiveTab('fleet')}
            >
              Fleet
            </button>
            <button
              className={`tab ${activeTab === 'subscription' ? 'active' : ''}`}
              onClick={() => setActiveTab('subscription')}
            >
              Subscription
            </button>
            <button
              className={`tab ${activeTab === 'tickets' ? 'active' : ''}`}
              onClick={() => setActiveTab('tickets')}
            >
              Tickets
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="dashboard-overview">
              {/* Key Performance Metrics */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-content">
                    <h3 className="stat-label">Total Revenue</h3>
                    <p className="stat-value">{formatCurrency(performance?.totalRevenue)}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">📈</div>
                  <div className="stat-content">
                    <h3 className="stat-label">Net Revenue</h3>
                    <p className="stat-value">{formatCurrency(performance?.netRevenue)}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">🚗</div>
                  <div className="stat-content">
                    <h3 className="stat-label">Total Vehicles</h3>
                    <p className="stat-value">{performance?.totalVehicles || vehicles.length || 0}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-content">
                    <h3 className="stat-label">Utilization Rate</h3>
                    <p className="stat-value">{formatPercentage(performance?.utilizationRate)}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">⏱️</div>
                  <div className="stat-content">
                    <h3 className="stat-label">Revenue Uptime</h3>
                    <p className="stat-value">{formatPercentage(performance?.revenueUptime)}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">💵</div>
                  <div className="stat-content">
                    <h3 className="stat-label">Avg Daily Revenue</h3>
                    <p className="stat-value">{formatCurrency(performance?.averageDailyRevenue)}</p>
                  </div>
                </div>
              </div>

              {/* Subscription Status */}
              {subscription && (
                <div className="subscription-banner">
                  <div className="subscription-info">
                    <h3>Current Plan: {subscription.serviceTier}</h3>
                    <p>{formatCurrency(subscription.monthlyFee)}/month • Next billing: {formatDate(subscription.nextBillingDate)}</p>
                  </div>
                  <span className={`subscription-status ${subscription.status}`}>
                    {subscription.status}
                  </span>
                </div>
              )}

              {/* Recent Activity */}
              <div className="activity-grid">
                <div className="activity-section">
                  <h2 className="section-title">Recent Reservations</h2>
                  {recentReservations.length > 0 ? (
                    <div className="reservations-list">
                      {recentReservations.map((reservation) => (
                        <div key={reservation.id} className="reservation-card">
                          <div className="reservation-info">
                            <h4>{reservation.customerName || 'Guest'}</h4>
                            <p>{reservation.customerEmail || 'N/A'}</p>
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

                <div className="activity-section">
                  <h2 className="section-title">Recent Tickets</h2>
                  {tickets.length > 0 ? (
                    <div className="tickets-list">
                      {tickets.map((ticket) => (
                        <div key={ticket.id} className="ticket-card">
                          <div className="ticket-info">
                            <h4>{ticket.title || 'Untitled Ticket'}</h4>
                            <p className="ticket-type">{ticket.type.replace('_', ' ')}</p>
                            <p className="ticket-date">{formatDate(ticket.createdAt)}</p>
                          </div>
                          <span className={`ticket-status ${ticket.status}`}>
                            {ticket.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-state">No tickets yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && performance && (
            <div className="dashboard-section">
              <h2 className="section-title">Performance Analytics</h2>
              <div className="performance-grid">
                <div className="performance-card">
                  <h3>Revenue Metrics</h3>
                  <div className="metric-row">
                    <span>Total Revenue:</span>
                    <strong>{formatCurrency(performance.totalRevenue)}</strong>
                  </div>
                  <div className="metric-row">
                    <span>Net Revenue:</span>
                    <strong>{formatCurrency(performance.netRevenue)}</strong>
                  </div>
                  <div className="metric-row">
                    <span>Total Costs:</span>
                    <strong>{formatCurrency(performance.totalCosts)}</strong>
                  </div>
                </div>

                <div className="performance-card">
                  <h3>Fleet Metrics</h3>
                  <div className="metric-row">
                    <span>Utilization Rate:</span>
                    <strong>{formatPercentage(performance.utilizationRate)}</strong>
                  </div>
                  <div className="metric-row">
                    <span>Revenue Uptime:</span>
                    <strong>{formatPercentage(performance.revenueUptime)}</strong>
                  </div>
                  <div className="metric-row">
                    <span>Avg Daily Revenue:</span>
                    <strong>{formatCurrency(performance.averageDailyRevenue)}</strong>
                  </div>
                </div>

                <div className="performance-card">
                  <h3>Cost Analysis</h3>
                  <div className="metric-row">
                    <span>Maintenance Cost Ratio:</span>
                    <strong>{formatPercentage(performance.maintenanceCostRatio)}</strong>
                  </div>
                  <div className="metric-row">
                    <span>Active Vehicles:</span>
                    <strong>{performance.activeVehicles || 0}</strong>
                  </div>
                  <div className="metric-row">
                    <span>Total Reservations:</span>
                    <strong>{performance.totalReservations || 0}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fleet' && (
            <div className="dashboard-section">
              <h2 className="section-title">Fleet Management</h2>
              {fleets.length > 0 ? (
                <div className="fleets-grid">
                  {fleets.map((fleet) => (
                    <div key={fleet.id} className="fleet-card">
                      <h3>{fleet.name}</h3>
                      <div className="fleet-metrics">
                        <div className="fleet-metric">
                          <span>Vehicles:</span>
                          <strong>{fleet.totalVehicles || 0}</strong>
                        </div>
                        <div className="fleet-metric">
                          <span>Utilization:</span>
                          <strong>{formatPercentage(fleet.utilizationRate)}</strong>
                        </div>
                        <div className="fleet-metric">
                          <span>Avg Daily Revenue:</span>
                          <strong>{formatCurrency(fleet.averageDailyRevenue)}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No fleets created yet. Create your first fleet to get started.</p>
              )}

              <div className="vehicles-section">
                <h3 className="subsection-title">All Vehicles ({vehicles.length})</h3>
                {vehicles.length > 0 ? (
                  <div className="vehicles-grid">
                    {vehicles.map((vehicle) => (
                      <div key={vehicle.id} className="vehicle-card">
                        <h4>{vehicle.make} {vehicle.model}</h4>
                        <p className="vehicle-year">{vehicle.year}</p>
                        <span className={`vehicle-status ${vehicle.status}`}>
                          {vehicle.status || 'available'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">No vehicles added yet</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'subscription' && subscription && (
            <div className="dashboard-section">
              <h2 className="section-title">Subscription Management</h2>
              <div className="subscription-details">
                <div className="subscription-card">
                  <div className="subscription-header">
                    <h3>{subscription.serviceTier} Plan</h3>
                    <span className={`subscription-status ${subscription.status}`}>
                      {subscription.status}
                    </span>
                  </div>
                  <div className="subscription-body">
                    <div className="subscription-detail">
                      <span>Monthly Fee:</span>
                      <strong>{formatCurrency(subscription.monthlyFee)}</strong>
                    </div>
                    <div className="subscription-detail">
                      <span>Next Billing Date:</span>
                      <strong>{formatDate(subscription.nextBillingDate)}</strong>
                    </div>
                    <div className="subscription-detail">
                      <span>Auto Renew:</span>
                      <strong>{subscription.autoRenew ? 'Yes' : 'No'}</strong>
                    </div>
                    <div className="subscription-detail">
                      <span>Start Date:</span>
                      <strong>{formatDate(subscription.startDate)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="dashboard-section">
              <h2 className="section-title">Operational Tickets</h2>
              {tickets.length > 0 ? (
                <div className="tickets-list-full">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="ticket-card-full">
                      <div className="ticket-header">
                        <h4>{ticket.title || 'Untitled Ticket'}</h4>
                        <span className={`ticket-priority ${ticket.priority}`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <p className="ticket-description">{ticket.description || 'No description'}</p>
                      <div className="ticket-footer">
                        <span className="ticket-type">{ticket.type.replace('_', ' ')}</span>
                        <span className={`ticket-status ${ticket.status}`}>
                          {ticket.status}
                        </span>
                        <span className="ticket-date">{formatDate(ticket.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No operational tickets</p>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;



import { useState, useEffect } from 'react';
import { fleetsAPI, vehiclesAPI } from '../utils/api';
import './FleetDetails.css';

const FleetDetails = ({ fleetId, onClose, onUpdate }) => {
    const [fleet, setFleet] = useState(null);
    const [availableVehicles, setAvailableVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});

    useEffect(() => {
        loadFleetDetails();
        loadAvailableVehicles();
    }, [fleetId]);

    const loadFleetDetails = async () => {
        try {
            const data = await fleetsAPI.getOne(fleetId);
            setFleet(data);
            setEditData({
                name: data.name,
                description: data.description || '',
                location: data.location || '',
            });
        } catch (err) {
            setError('Failed to load fleet details');
        } finally {
            setLoading(false);
        }
    };

    const loadAvailableVehicles = async () => {
        try {
            const vehicles = await vehiclesAPI.getAll();
            setAvailableVehicles(vehicles);
        } catch (err) {
            console.error('Failed to load vehicles:', err);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const updated = await fleetsAPI.update(fleetId, editData);
            setFleet({ ...fleet, ...updated });
            setSuccess('Fleet updated successfully!');
            setIsEditing(false);
            if (onUpdate) onUpdate(updated);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to update fleet');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${fleet.name}"?`)) {
            return;
        }

        setLoading(true);
        try {
            await fleetsAPI.delete(fleetId);
            setSuccess('Fleet deleted successfully!');
            setTimeout(() => {
                if (onClose) onClose();
            }, 1000);
        } catch (err) {
            setError(err.message || 'Failed to delete fleet');
            setLoading(false);
        }
    };

    const handleAddVehicle = async (vehicleId) => {
        setError('');
        try {
            await fleetsAPI.addVehicle(fleetId, vehicleId);
            setSuccess('Vehicle added to fleet!');
            await loadFleetDetails();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to add vehicle');
        }
    };

    const handleRemoveVehicle = async (vehicleId) => {
        if (!confirm('Remove this vehicle from the fleet?')) {
            return;
        }

        setError('');
        try {
            await fleetsAPI.removeVehicle(fleetId, vehicleId);
            setSuccess('Vehicle removed from fleet!');
            await loadFleetDetails();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to remove vehicle');
        }
    };

    if (loading && !fleet) {
        return (
            <div className="fleet-details-modal">
                <div className="fleet-details-content">
                    <div className="loading">Loading fleet details...</div>
                </div>
            </div>
        );
    }

    const fleetVehicleIds = fleet?.vehicles?.map(v => v.id) || [];
    const unassignedVehicles = availableVehicles.filter(v => !fleetVehicleIds.includes(v.id));

    return (
        <div className="fleet-details-modal" onClick={onClose}>
            <div className="fleet-details-content" onClick={(e) => e.stopPropagation()}>
                <div className="fleet-details-header">
                    <h2>{fleet?.name}</h2>
                    <button className="btn-close" onClick={onClose}>✕</button>
                </div>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {isEditing ? (
                    <form onSubmit={handleUpdate} className="fleet-edit-form">
                        <div className="form-group">
                            <label>Fleet Name</label>
                            <input
                                type="text"
                                value={editData.name}
                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                value={editData.description}
                                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                rows="3"
                            />
                        </div>
                        <div className="form-group">
                            <label>Location</label>
                            <input
                                type="text"
                                value={editData.location}
                                onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                            />
                        </div>
                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={() => setIsEditing(false)}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn-submit">
                                Save Changes
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="fleet-info">
                        <div className="info-row">
                            <span className="label">Description:</span>
                            <span>{fleet?.description || 'No description'}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Location:</span>
                            <span>{fleet?.location || 'Not specified'}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Status:</span>
                            <span className={`status-badge ${fleet?.status}`}>{fleet?.status}</span>
                        </div>
                        <div className="fleet-actions">
                            <button className="btn-edit" onClick={() => setIsEditing(true)}>
                                Edit Fleet
                            </button>
                            <button className="btn-delete" onClick={handleDelete}>
                                Delete Fleet
                            </button>
                        </div>
                    </div>
                )}

                {/* Fleet Metrics */}
                {fleet?.metrics && (
                    <div className="fleet-metrics-grid">
                        <div className="metric">
                            <span className="metric-label">Vehicles</span>
                            <span className="metric-value">{fleet.metrics.totalVehicles}</span>
                        </div>
                        <div className="metric">
                            <span className="metric-label">Active</span>
                            <span className="metric-value">{fleet.metrics.activeVehicles}</span>
                        </div>
                        <div className="metric">
                            <span className="metric-label">Utilization</span>
                            <span className="metric-value">{fleet.metrics.utilizationRate}%</span>
                        </div>
                        <div className="metric">
                            <span className="metric-label">Revenue</span>
                            <span className="metric-value">${fleet.metrics.totalRevenue}</span>
                        </div>
                    </div>
                )}

                {/* Fleet Vehicles */}
                <div className="fleet-vehicles-section">
                    <h3>Fleet Vehicles ({fleet?.vehicles?.length || 0})</h3>
                    {fleet?.vehicles && fleet.vehicles.length > 0 ? (
                        <div className="vehicles-list">
                            {fleet.vehicles.map((vehicle) => (
                                <div key={vehicle.id} className="vehicle-item">
                                    <div className="vehicle-info">
                                        <strong>{vehicle.make} {vehicle.model}</strong>
                                        <span className="vehicle-year">{vehicle.year}</span>
                                        <span className={`vehicle-status ${vehicle.status}`}>
                                            {vehicle.status}
                                        </span>
                                    </div>
                                    <button
                                        className="btn-remove"
                                        onClick={() => handleRemoveVehicle(vehicle.id)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="empty-state">No vehicles in this fleet yet</p>
                    )}
                </div>

                {/* Available Vehicles to Add */}
                {unassignedVehicles.length > 0 && (
                    <div className="available-vehicles-section">
                        <h3>Add Vehicles to Fleet</h3>
                        <div className="vehicles-list">
                            {unassignedVehicles.map((vehicle) => (
                                <div key={vehicle.id} className="vehicle-item">
                                    <div className="vehicle-info">
                                        <strong>{vehicle.make} {vehicle.model}</strong>
                                        <span className="vehicle-year">{vehicle.year}</span>
                                        <span className={`vehicle-status ${vehicle.status}`}>
                                            {vehicle.status}
                                        </span>
                                    </div>
                                    <button
                                        className="btn-add"
                                        onClick={() => handleAddVehicle(vehicle.id)}
                                    >
                                        + Add
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FleetDetails;

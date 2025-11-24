import { useState } from 'react';
import { fleetsAPI, vehiclesAPI } from '../utils/api';
import './FleetManager.css';

const FleetManager = ({ hostId, onFleetCreated, onFleetDeleted }) => {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newFleet, setNewFleet] = useState({
        name: '',
        description: '',
        location: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newFleet.name.trim()) {
            setError('Fleet name is required');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const fleet = await fleetsAPI.create(newFleet);
            setSuccess(`Fleet "${fleet.name}" created successfully!`);
            setNewFleet({ name: '', description: '', location: '' });
            setShowCreateForm(false);

            if (onFleetCreated) {
                onFleetCreated(fleet);
            }

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to create fleet');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fleet-manager">
            <div className="fleet-manager-header">
                <h3>Fleet Management</h3>
                <button
                    className="btn-create-fleet"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                >
                    {showCreateForm ? '✕ Cancel' : '+ Create Fleet'}
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {showCreateForm && (
                <form onSubmit={handleSubmit} className="fleet-create-form">
                    <div className="form-group">
                        <label htmlFor="fleetName">Fleet Name *</label>
                        <input
                            type="text"
                            id="fleetName"
                            value={newFleet.name}
                            onChange={(e) => setNewFleet({ ...newFleet, name: e.target.value })}
                            placeholder="e.g., Downtown Fleet, Airport Fleet"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="fleetDescription">Description</label>
                        <textarea
                            id="fleetDescription"
                            value={newFleet.description}
                            onChange={(e) => setNewFleet({ ...newFleet, description: e.target.value })}
                            placeholder="Describe this fleet..."
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="fleetLocation">Location</label>
                        <input
                            type="text"
                            id="fleetLocation"
                            value={newFleet.location}
                            onChange={(e) => setNewFleet({ ...newFleet, location: e.target.value })}
                            placeholder="e.g., Atlanta, GA"
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={() => setShowCreateForm(false)}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Fleet'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default FleetManager;

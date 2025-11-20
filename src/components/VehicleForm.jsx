import { useState } from 'react';
import PropTypes from 'prop-types';
import './VehicleForm.css';

const VehicleForm = ({ onSubmit, initialData = {}, loading = false }) => {
    const [formData, setFormData] = useState({
        make: initialData.make || '',
        model: initialData.model || '',
        year: initialData.year || new Date().getFullYear(),
        licensePlate: initialData.licensePlate || '',
        vin: initialData.vin || '',
        color: initialData.color || '',
        mileage: initialData.mileage || '',
        ...initialData,
    });

    const [errors, setErrors] = useState({});

    const validateVIN = (vin) => {
        const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
        return vinRegex.test(vin);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.make.trim()) newErrors.make = 'Make is required';
        if (!formData.model.trim()) newErrors.model = 'Model is required';
        if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
            newErrors.year = 'Please enter a valid year';
        }
        if (formData.vin && !validateVIN(formData.vin)) {
            newErrors.vin = 'Invalid VIN format (17 characters, no I, O, or Q)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };

    return (
        <form className="vehicle-form" onSubmit={handleSubmit}>
            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="make">Make *</label>
                    <input
                        type="text"
                        id="make"
                        name="make"
                        value={formData.make}
                        onChange={handleChange}
                        placeholder="e.g., Toyota"
                        disabled={loading}
                    />
                    {errors.make && <span className="error">{errors.make}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="model">Model *</label>
                    <input
                        type="text"
                        id="model"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        placeholder="e.g., Camry"
                        disabled={loading}
                    />
                    {errors.model && <span className="error">{errors.model}</span>}
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="year">Year *</label>
                    <input
                        type="number"
                        id="year"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        disabled={loading}
                    />
                    {errors.year && <span className="error">{errors.year}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="color">Color</label>
                    <input
                        type="text"
                        id="color"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        placeholder="e.g., Silver"
                        disabled={loading}
                    />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="vin">VIN</label>
                <input
                    type="text"
                    id="vin"
                    name="vin"
                    value={formData.vin}
                    onChange={handleChange}
                    placeholder="17-character VIN"
                    maxLength="17"
                    disabled={loading}
                />
                {errors.vin && <span className="error">{errors.vin}</span>}
                <small>Optional: 17-character Vehicle Identification Number</small>
            </div>

            <div className="form-group">
                <label htmlFor="licensePlate">License Plate</label>
                <input
                    type="text"
                    id="licensePlate"
                    name="licensePlate"
                    value={formData.licensePlate}
                    onChange={handleChange}
                    placeholder="e.g., ABC 1234"
                    disabled={loading}
                />
            </div>

            <div className="form-group">
                <label htmlFor="mileage">Mileage</label>
                <input
                    type="number"
                    id="mileage"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleChange}
                    placeholder="Current mileage"
                    min="0"
                    disabled={loading}
                />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Continue'}
            </button>
        </form>
    );
};

VehicleForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    initialData: PropTypes.object,
    loading: PropTypes.bool,
};

export default VehicleForm;

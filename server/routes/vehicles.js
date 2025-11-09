import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  getVehicles,
  saveVehicles,
  createVehicle,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} from '../database/vehicles.js';

const router = express.Router();

// Get all vehicles for user
router.get('/', (req, res) => {
  try {
    const vehicles = getVehicles().filter(v => v.userId === req.user.userId);
    res.json(vehicles);
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ message: 'Error fetching vehicles' });
  }
});

// Get single vehicle
router.get('/:id', (req, res) => {
  try {
    const vehicle = getVehicleById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    if (vehicle.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(vehicle);
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({ message: 'Error fetching vehicle' });
  }
});

// Create vehicle
router.post('/', [
  body('make').trim().notEmpty(),
  body('model').trim().notEmpty(),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
  body('dailyRate').isFloat({ min: 0 }),
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const vehicles = getVehicles();
    const newVehicle = createVehicle({
      ...req.body,
      userId: req.user.userId,
      status: req.body.status || 'available',
    });

    vehicles.push(newVehicle);
    saveVehicles(vehicles);

    res.status(201).json(newVehicle);
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({ message: 'Error creating vehicle' });
  }
});

// Update vehicle
router.put('/:id', (req, res) => {
  try {
    const vehicle = getVehicleById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    if (vehicle.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updated = updateVehicle(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({ message: 'Error updating vehicle' });
  }
});

// Delete vehicle
router.delete('/:id', (req, res) => {
  try {
    const vehicle = getVehicleById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    if (vehicle.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    deleteVehicle(req.params.id);
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ message: 'Error deleting vehicle' });
  }
});

export default router;


import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  getDrivers,
  getDriverById,
  getDriverByUserId,
  createDriver,
  updateDriver,
  deleteDriver,
} from '../database/drivers.js';

const router = express.Router();

// Get all drivers
router.get('/', (req, res) => {
  try {
    const drivers = getDrivers();
    res.json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ message: 'Error fetching drivers' });
  }
});

// Get driver by ID
router.get('/:id', (req, res) => {
  try {
    const driver = getDriverById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    console.error('Error fetching driver:', error);
    res.status(500).json({ message: 'Error fetching driver' });
  }
});

// Get driver by user ID
router.get('/user/:userId', (req, res) => {
  try {
    const driver = getDriverByUserId(req.params.userId);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found for this user' });
    }
    res.json(driver);
  } catch (error) {
    console.error('Error fetching driver:', error);
    res.status(500).json({ message: 'Error fetching driver' });
  }
});

// Create new driver
router.post('/', [
  body('userId').notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('name').notEmpty().trim(),
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if driver already exists
    const existingDriver = getDriverByUserId(req.body.userId);
    if (existingDriver) {
      return res.status(400).json({ message: 'Driver already exists for this user' });
    }

    const driver = createDriver(req.body);
    res.status(201).json(driver);
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).json({ message: 'Error creating driver' });
  }
});

// Update driver
router.put('/:id', (req, res) => {
  try {
    const driver = updateDriver(req.params.id, req.body);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).json({ message: 'Error updating driver' });
  }
});

// Delete driver
router.delete('/:id', (req, res) => {
  try {
    const deleted = deleteDriver(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    console.error('Error deleting driver:', error);
    res.status(500).json({ message: 'Error deleting driver' });
  }
});

export default router;


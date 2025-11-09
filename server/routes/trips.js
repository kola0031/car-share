import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  getTrips,
  getTripById,
  getTripByBookingId,
  getActiveTrips,
  getTripsByDriverId,
  getTripsByHostId,
  createTrip,
  updateTrip,
  deleteTrip,
} from '../database/trips.js';

const router = express.Router();

// Get all trips
router.get('/', (req, res) => {
  try {
    const { driverId, hostId, status } = req.query;
    let trips = getTrips();
    
    if (driverId) {
      trips = trips.filter(t => t.driverId === driverId);
    }
    if (hostId) {
      trips = trips.filter(t => t.hostId === hostId);
    }
    if (status) {
      trips = trips.filter(t => t.status === status);
    }
    
    res.json(trips.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ message: 'Error fetching trips' });
  }
});

// Get active trips
router.get('/active', (req, res) => {
  try {
    const activeTrips = getActiveTrips();
    res.json(activeTrips);
  } catch (error) {
    console.error('Error fetching active trips:', error);
    res.status(500).json({ message: 'Error fetching active trips' });
  }
});

// Get trip by ID
router.get('/:id', (req, res) => {
  try {
    const trip = getTripById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.json(trip);
  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({ message: 'Error fetching trip' });
  }
});

// Start trip (pickup)
router.post('/:id/start', [
  body('mileageStart').optional().isNumeric(),
  body('fuelLevelStart').optional().isNumeric(),
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const trip = updateTrip(req.params.id, {
      status: 'active',
      pickupTime: new Date().toISOString(),
      mileageStart: req.body.mileageStart || null,
      fuelLevelStart: req.body.fuelLevelStart || null,
      conditionStart: req.body.conditionStart || null,
    });
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.json(trip);
  } catch (error) {
    console.error('Error starting trip:', error);
    res.status(500).json({ message: 'Error starting trip' });
  }
});

// Complete trip (return)
router.post('/:id/complete', [
  body('mileageEnd').optional().isNumeric(),
  body('fuelLevelEnd').optional().isNumeric(),
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const trip = updateTrip(req.params.id, {
      status: 'completed',
      returnTime: new Date().toISOString(),
      mileageEnd: req.body.mileageEnd || null,
      fuelLevelEnd: req.body.fuelLevelEnd || null,
      conditionEnd: req.body.conditionEnd || null,
      issues: req.body.issues || [],
    });
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.json(trip);
  } catch (error) {
    console.error('Error completing trip:', error);
    res.status(500).json({ message: 'Error completing trip' });
  }
});

// Update trip
router.put('/:id', (req, res) => {
  try {
    const trip = updateTrip(req.params.id, req.body);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.json(trip);
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({ message: 'Error updating trip' });
  }
});

// Delete trip
router.delete('/:id', (req, res) => {
  try {
    const deleted = deleteTrip(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ message: 'Error deleting trip' });
  }
});

export default router;


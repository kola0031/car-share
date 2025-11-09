import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  getFleets,
  getFleetById,
  getFleetsByHostId,
  createFleet,
  updateFleet,
  deleteFleet,
} from '../database/fleets.js';
import { getVehicles } from '../database/vehicles.js';
import { getReservations } from '../database/reservations.js';
import { getHostByUserId } from '../database/hosts.js';

const router = express.Router();

// Get all fleets for authenticated host
router.get('/', (req, res) => {
  try {
    // Get host ID from JWT token or look it up by userId
    let hostId = req.user.hostId;
    if (!hostId) {
      const host = getHostByUserId(req.user.userId);
      if (!host) {
        return res.status(404).json({ message: 'Host not found for this user' });
      }
      hostId = host.id;
    }
    const fleets = getFleetsByHostId(hostId);
    res.json(fleets);
  } catch (error) {
    console.error('Error fetching fleets:', error);
    res.status(500).json({ message: 'Error fetching fleets' });
  }
});

// Get fleet by ID
router.get('/:id', (req, res) => {
  try {
    const fleet = getFleetById(req.params.id);
    if (!fleet) {
      return res.status(404).json({ message: 'Fleet not found' });
    }
    
    // Get fleet vehicles and calculate metrics
    const vehicles = getVehicles().filter(v => fleet.vehicleIds.includes(v.id));
    const reservations = getReservations().filter(r => 
      fleet.vehicleIds.includes(r.vehicleId)
    );
    
    // Calculate utilization rate
    const activeVehicles = vehicles.filter(v => 
      v.status === 'available' || v.status === 'rented'
    ).length;
    const utilizationRate = vehicles.length > 0 
      ? (activeVehicles / vehicles.length) * 100 
      : 0;
    
    // Calculate average daily revenue
    const totalRevenue = reservations
      .filter(r => r.status === 'completed' || r.status === 'confirmed')
      .reduce((sum, r) => sum + (r.totalAmount || 0), 0);
    const averageDailyRevenue = vehicles.length > 0 
      ? totalRevenue / (vehicles.length * 30) 
      : 0;
    
    res.json({
      ...fleet,
      vehicles,
      totalVehicles: vehicles.length,
      activeVehicles,
      utilizationRate,
      averageDailyRevenue,
      totalReservations: reservations.length,
    });
  } catch (error) {
    console.error('Error fetching fleet:', error);
    res.status(500).json({ message: 'Error fetching fleet' });
  }
});

// Create new fleet
router.post('/', [
  body('name').optional().trim(),
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Get host ID from JWT token or look it up by userId
    let hostId = req.user.hostId;
    if (!hostId) {
      const host = getHostByUserId(req.user.userId);
      if (!host) {
        return res.status(404).json({ message: 'Host not found for this user' });
      }
      hostId = host.id;
    }

    const fleet = createFleet({
      ...req.body,
      hostId: hostId,
    });
    res.status(201).json(fleet);
  } catch (error) {
    console.error('Error creating fleet:', error);
    res.status(500).json({ message: 'Error creating fleet' });
  }
});

// Update fleet
router.put('/:id', (req, res) => {
  try {
    const fleet = updateFleet(req.params.id, req.body);
    if (!fleet) {
      return res.status(404).json({ message: 'Fleet not found' });
    }
    res.json(fleet);
  } catch (error) {
    console.error('Error updating fleet:', error);
    res.status(500).json({ message: 'Error updating fleet' });
  }
});

// Delete fleet
router.delete('/:id', (req, res) => {
  try {
    const deleted = deleteFleet(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Fleet not found' });
    }
    res.json({ message: 'Fleet deleted successfully' });
  } catch (error) {
    console.error('Error deleting fleet:', error);
    res.status(500).json({ message: 'Error deleting fleet' });
  }
});

export default router;


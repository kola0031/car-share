import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  getFleets,
  getFleetById,
  getFleetsByHostId,
  createFleet,
  updateFleet,
  deleteFleet,
  addVehicleToFleet,
  removeVehicleFromFleet,
} from '../database/fleets.js';
import { getVehiclesByHostId } from '../database/vehicles.js';
import { getReservationsByHostId } from '../database/reservations.js';
import { getHostByUserId } from '../database/hosts.js';

const router = express.Router();

// Get all fleets for authenticated host
router.get('/', async (req, res) => {
  try {
    // Get host ID from JWT token or look it up by userId
    let hostId = req.user.hostId;
    if (!hostId) {
      const host = await getHostByUserId(req.user.userId);
      if (!host) {
        return res.status(404).json({ message: 'Host not found for this user' });
      }
      hostId = host._id.toString();
    }

    const fleets = await getFleetsByHostId(hostId);
    res.json(fleets.map(f => ({
      id: f._id,
      name: f.name,
      description: f.description,
      location: f.location,
      vehicleCount: f.vehicleIds?.length || 0,
      status: f.status,
      createdAt: f.createdAt,
    })));
  } catch (error) {
    console.error('Error fetching fleets:', error);
    res.status(500).json({ message: 'Error fetching fleets' });
  }
});

// Get fleet by ID with detailed metrics
router.get('/:id', async (req, res) => {
  try {
    const fleet = await getFleetById(req.params.id);
    if (!fleet) {
      return res.status(404).json({ message: 'Fleet not found' });
    }

    // Get all host vehicles and filter by fleet
    const allVehicles = await getVehiclesByHostId(fleet.hostId);
    const fleetVehicles = allVehicles.filter(v =>
      fleet.vehicleIds.includes(v._id.toString())
    );

    // Get reservations for fleet vehicles
    const allReservations = await getReservationsByHostId(fleet.hostId);
    const fleetReservations = allReservations.filter(r =>
      fleet.vehicleIds.includes(r.vehicleId)
    );

    // Calculate metrics
    const activeVehicles = fleetVehicles.filter(v =>
      v.status === 'available' || v.status === 'rented'
    ).length;

    const utilizationRate = fleetVehicles.length > 0
      ? (activeVehicles / fleetVehicles.length) * 100
      : 0;

    const totalRevenue = fleetReservations
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + (r.totalCost || 0), 0);

    const averageDailyRevenue = fleetVehicles.length > 0
      ? totalRevenue / (fleetVehicles.length * 30)
      : 0;

    res.json({
      id: fleet._id,
      name: fleet.name,
      description: fleet.description,
      location: fleet.location,
      status: fleet.status,
      vehicles: fleetVehicles.map(v => ({
        id: v._id,
        make: v.make,
        model: v.model,
        year: v.year,
        status: v.status,
      })),
      metrics: {
        totalVehicles: fleetVehicles.length,
        activeVehicles,
        utilizationRate: utilizationRate.toFixed(2),
        totalReservations: fleetReservations.length,
        totalRevenue,
        averageDailyRevenue: averageDailyRevenue.toFixed(2),
      },
    });
  } catch (error) {
    console.error('Error fetching fleet:', error);
    res.status(500).json({ message: 'Error fetching fleet' });
  }
});

// Create new fleet
router.post('/', [
  body('name').trim().notEmpty().withMessage('Fleet name is required'),
  body('description').optional().trim(),
  body('location').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Get host ID from JWT token or look it up by userId
    let hostId = req.user.hostId;
    if (!hostId) {
      const host = await getHostByUserId(req.user.userId);
      if (!host) {
        return res.status(404).json({ message: 'Host not found for this user' });
      }
      hostId = host._id.toString();
    }

    const fleet = await createFleet({
      ...req.body,
      hostId: hostId,
    });

    res.status(201).json({
      id: fleet._id,
      name: fleet.name,
      description: fleet.description,
      location: fleet.location,
      status: fleet.status,
      vehicleCount: 0,
    });
  } catch (error) {
    console.error('Error creating fleet:', error);
    res.status(500).json({ message: 'Error creating fleet' });
  }
});

// Update fleet
router.put('/:id', async (req, res) => {
  try {
    const fleet = await updateFleet(req.params.id, req.body);
    if (!fleet) {
      return res.status(404).json({ message: 'Fleet not found' });
    }

    res.json({
      id: fleet._id,
      name: fleet.name,
      description: fleet.description,
      location: fleet.location,
      status: fleet.status,
    });
  } catch (error) {
    console.error('Error updating fleet:', error);
    res.status(500).json({ message: 'Error updating fleet' });
  }
});

// Add vehicle to fleet
router.post('/:id/vehicles/:vehicleId', async (req, res) => {
  try {
    const fleet = await addVehicleToFleet(req.params.id, req.params.vehicleId);
    res.json({
      id: fleet._id,
      name: fleet.name,
      vehicleCount: fleet.vehicleIds.length,
    });
  } catch (error) {
    console.error('Error adding vehicle to fleet:', error);
    res.status(500).json({ message: 'Error adding vehicle to fleet' });
  }
});

// Remove vehicle from fleet
router.delete('/:id/vehicles/:vehicleId', async (req, res) => {
  try {
    const fleet = await removeVehicleFromFleet(req.params.id, req.params.vehicleId);
    res.json({
      id: fleet._id,
      name: fleet.name,
      vehicleCount: fleet.vehicleIds.length,
    });
  } catch (error) {
    console.error('Error removing vehicle from fleet:', error);
    res.status(500).json({ message: 'Error removing vehicle from fleet' });
  }
});

// Delete fleet
router.delete('/:id', async (req, res) => {
  try {
    await deleteFleet(req.params.id);
    res.json({ message: 'Fleet deleted successfully' });
  } catch (error) {
    console.error('Error deleting fleet:', error);
    res.status(500).json({ message: 'Error deleting fleet' });
  }
});

export default router;

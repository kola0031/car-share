import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  getHostById,
  getHostByUserId,
  updateHost,
} from '../database/hosts.js';
import { getVehiclesByHostId } from '../database/vehicles.js';
import { getReservationsByHostId } from '../database/reservations.js';

const router = express.Router();

// Middleware to check if user owns the host or is accessing their own host
const checkHostOwnership = async (req, res, next) => {
  const hostId = req.params.id;
  const tokenHostId = req.user?.hostId;

  // If hostId in token matches, allow access
  if (tokenHostId === hostId) {
    return next();
  }

  // Otherwise, check if the host belongs to the user
  const host = await getHostById(hostId);
  if (!host) {
    return res.status(404).json({ message: 'Host not found' });
  }

  if (host.userId !== req.user.userId) {
    return res.status(403).json({ message: 'Access denied' });
  }

  next();
};

// Get host dashboard
router.get('/:id/dashboard', checkHostOwnership, async (req, res) => {
  try {
    const host = await getHostById(req.params.id);
    if (!host) {
      return res.status(404).json({ message: 'Host not found' });
    }

    const vehicles = await getVehiclesByHostId(req.params.id);
    const reservations = await getReservationsByHostId(req.params.id);

    // Calculate metrics
    const totalRevenue = reservations
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + (r.totalCost || 0), 0);

    const activeReservations = reservations.filter(r =>
      r.status === 'confirmed' || r.status === 'active'
    ).length;

    res.json({
      host: {
        id: host._id,
        companyName: host.companyName,
        location: host.parkMyShareLocation,
        serviceTier: host.serviceTier,
        subscriptionStatus: host.subscriptionStatus,
      },
      stats: {
        totalVehicles: vehicles.length,
        totalReservations: reservations.length,
        activeReservations,
        totalRevenue,
      },
      vehicles: vehicles.map(v => ({
        id: v._id,
        make: v.make,
        model: v.model,
        year: v.year,
        status: v.status,
      })),
      recentReservations: reservations.slice(0, 5).map(r => ({
        id: r._id,
        vehicleId: r.vehicleId,
        startDate: r.startDate,
        endDate: r.endDate,
        status: r.status,
        totalCost: r.totalCost,
      })),
    });
  } catch (error) {
    console.error('Error fetching host dashboard:', error);
    res.status(500).json({ message: 'Error fetching host dashboard', error: error.message });
  }
});

// Get host by ID
router.get('/:id', checkHostOwnership, async (req, res) => {
  try {
    const host = await getHostById(req.params.id);
    if (!host) {
      return res.status(404).json({ message: 'Host not found' });
    }

    res.json({
      id: host._id,
      userId: host.userId,
      companyName: host.companyName,
      parkMyShareLocation: host.parkMyShareLocation,
      serviceTier: host.serviceTier,
      subscriptionStatus: host.subscriptionStatus,
      onboardingStatus: host.onboardingStatus,
    });
  } catch (error) {
    console.error('Error fetching host:', error);
    res.status(500).json({ message: 'Error fetching host' });
  }
});

// Update host
router.put('/:id', checkHostOwnership, async (req, res) => {
  try {
    const updatedHost = await updateHost(req.params.id, req.body);
    if (!updatedHost) {
      return res.status(404).json({ message: 'Host not found' });
    }

    res.json({
      id: updatedHost._id,
      companyName: updatedHost.companyName,
      parkMyShareLocation: updatedHost.parkMyShareLocation,
      serviceTier: updatedHost.serviceTier,
      subscriptionStatus: updatedHost.subscriptionStatus,
    });
  } catch (error) {
    console.error('Error updating host:', error);
    res.status(500).json({ message: 'Error updating host' });
  }
});

export default router;

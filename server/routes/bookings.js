import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { getVehicles } from '../database/vehicles.js';
import { getReservations } from '../database/reservations.js';

const router = express.Router();

// Get available vehicles for booking (public endpoint)
router.get('/available', async (req, res) => {
  try {
    const { startDate, endDate, location } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' });
    }

    // Get all vehicles and reservations
    const allVehicles = await getVehicles();
    const allReservations = await getReservations();

    // Find vehicles that are booked during the requested period
    const bookedVehicleIds = allReservations
      .filter(r => {
        const resStart = new Date(r.startDate);
        const resEnd = new Date(r.endDate);
        const requestStart = new Date(startDate);
        const requestEnd = new Date(endDate);

        // Check if reservation overlaps with requested dates
        return (resStart <= requestEnd && resEnd >= requestStart) &&
          (r.status === 'confirmed' || r.status === 'active');
      })
      .map(r => r.vehicleId);

    // Filter available vehicles
    let availableVehicles = allVehicles.filter(v =>
      v.status === 'available' &&
      !bookedVehicleIds.includes(v._id.toString())
    );

    // Filter by location if provided
    if (location) {
      availableVehicles = availableVehicles.filter(v =>
        v.location?.toLowerCase().includes(location.toLowerCase()) ||
        v.parkMyShareLocation?.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Format response
    const formattedVehicles = availableVehicles.map(v => ({
      id: v._id,
      make: v.make,
      model: v.model,
      year: v.year,
      dailyRate: v.dailyRate,
      status: v.status,
      color: v.color,
      images: v.images || [],
    }));

    res.json(formattedVehicles);
  } catch (error) {
    console.error('Error fetching available vehicles:', error);
    res.status(500).json({ message: 'Error searching for vehicles', error: error.message });
  }
});

// Get all bookings (for demonstration - should be protected in production)
router.get('/', async (req, res) => {
  try {
    const reservations = await getReservations();
    res.json(reservations.map(r => ({
      id: r._id,
      vehicleId: r.vehicleId,
      driverId: r.driverId,
      hostId: r.hostId,
      startDate: r.startDate,
      endDate: r.endDate,
      status: r.status,
      totalCost: r.totalCost,
    })));
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

export default router;

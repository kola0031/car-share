import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import {
  getBookings,
  getBookingById,
  getBookingsByDriverId,
  getBookingsByHostId,
  getBookingsByVehicleId,
  createBooking,
  updateBooking,
  deleteBooking,
  getAvailableVehicles,
} from '../database/bookings.js';
import { getVehicles } from '../database/vehicles.js';
import { createTrip } from '../database/trips.js';

const router = express.Router();

// Get all bookings (filtered by user role)
router.get('/', (req, res) => {
  try {
    const { driverId, hostId, vehicleId, status } = req.query;
    let bookings = getBookings();
    
    if (driverId) {
      bookings = bookings.filter(b => b.driverId === driverId);
    }
    if (hostId) {
      bookings = bookings.filter(b => b.hostId === hostId);
    }
    if (vehicleId) {
      bookings = bookings.filter(b => b.vehicleId === vehicleId);
    }
    if (status) {
      bookings = bookings.filter(b => b.status === status);
    }
    
    res.json(bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

// Get available vehicles for booking (public endpoint)
router.get('/available', (req, res) => {
  try {
    const { startDate, endDate, location } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' });
    }
    
    const bookedVehicleIds = getAvailableVehicles(startDate, endDate);
    let availableVehicles = getVehicles().filter(v => 
      v.status === 'available' && 
      !bookedVehicleIds.includes(v.id) &&
      v.verificationStatus === 'verified'
    );
    
    if (location) {
      availableVehicles = availableVehicles.filter(v => 
        v.parkMyShareLocation?.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    res.json(availableVehicles);
  } catch (error) {
    console.error('Error fetching available vehicles:', error);
    res.status(500).json({ message: 'Error fetching available vehicles' });
  }
});

// Get booking by ID
router.get('/:id', (req, res) => {
  try {
    const booking = getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Error fetching booking' });
  }
});

// Create new booking (requires authentication)
router.post('/', [
  authenticateToken,
  body('driverId').notEmpty(),
  body('vehicleId').notEmpty(),
  body('pickupDate').notEmpty(),
  body('returnDate').notEmpty(),
  body('totalAmount').isNumeric(),
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if vehicle is available
    const bookedVehicleIds = getAvailableVehicles(req.body.pickupDate, req.body.returnDate);
    if (bookedVehicleIds.includes(req.body.vehicleId)) {
      return res.status(400).json({ message: 'Vehicle is not available for the selected dates' });
    }

    const vehicle = getVehicles().find(v => v.id === req.body.vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const booking = createBooking({
      ...req.body,
      hostId: vehicle.hostId,
      dailyRate: vehicle.dailyRate,
      numberOfDays: Math.ceil(
        (new Date(req.body.returnDate) - new Date(req.body.pickupDate)) / (1000 * 60 * 60 * 24)
      ),
    });

    // Create trip record
    createTrip({
      bookingId: booking.id,
      driverId: booking.driverId,
      vehicleId: booking.vehicleId,
      hostId: booking.hostId,
      status: 'scheduled',
      pickupLocation: booking.pickupLocation,
      returnLocation: booking.returnLocation,
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Error creating booking' });
  }
});

// Update booking
router.put('/:id', (req, res) => {
  try {
    const booking = updateBooking(req.params.id, req.body);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Error updating booking' });
  }
});

// Cancel booking
router.post('/:id/cancel', (req, res) => {
  try {
    const booking = updateBooking(req.params.id, {
      status: 'cancelled',
    });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Error cancelling booking' });
  }
});

// Delete booking
router.delete('/:id', (req, res) => {
  try {
    const deleted = deleteBooking(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Error deleting booking' });
  }
});

export default router;


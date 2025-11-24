import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  getReservations,
  createReservation,
  getReservationById,
  updateReservation,
  deleteReservation,
  getReservationsByDriverId,
  getReservationsByHostId,
} from '../database/reservations.js';

const router = express.Router();

// Get all reservations for user
router.get('/', async (req, res) => {
  try {
    const reservations = await getReservations();
    // Filter by user - adjust based on role
    const userReservations = reservations.filter(r =>
      r.driverId === req.user.driverId || r.hostId === req.user.hostId
    );
    res.json(userReservations);
  } catch (error) {
    console.error('Get reservations error:', error);
    res.status(500).json({ message: 'Error fetching reservations' });
  }
});

// Get single reservation
router.get('/:id', async (req, res) => {
  try {
    const reservation = await getReservationById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    // Check access
    if (reservation.driverId !== req.user.driverId && reservation.hostId !== req.user.hostId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(reservation);
  } catch (error) {
    console.error('Get reservation error:', error);
    res.status(500).json({ message: 'Error fetching reservation' });
  }
});

// Create reservation
router.post('/', [
  body('vehicleId').notEmpty(),
  body('startDate').notEmpty(),
  body('endDate').notEmpty(),
  body('totalCost').isNumeric(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newReservation = await createReservation({
      ...req.body,
      driverId: req.user.driverId,
      status: 'pending',
    });

    res.status(201).json(newReservation);
  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({ message: 'Error creating reservation' });
  }
});

// Update reservation
router.put('/:id', async (req, res) => {
  try {
    const reservation = await getReservationById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    if (reservation.driverId !== req.user.driverId && reservation.hostId !== req.user.hostId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updated = await updateReservation(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    console.error('Update reservation error:', error);
    res.status(500).json({ message: 'Error updating reservation' });
  }
});

// Delete reservation
router.delete('/:id', async (req, res) => {
  try {
    const reservation = await getReservationById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    if (reservation.driverId !== req.user.driverId && reservation.hostId !== req.user.hostId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await deleteReservation(req.params.id);
    res.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    console.error('Delete reservation error:', error);
    res.status(500).json({ message: 'Error deleting reservation' });
  }
});

export default router;

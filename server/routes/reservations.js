import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  getReservations,
  saveReservations,
  createReservation,
  getReservationById,
  updateReservation,
  deleteReservation,
} from '../database/reservations.js';

const router = express.Router();

// Get all reservations for user
router.get('/', (req, res) => {
  try {
    const reservations = getReservations().filter(r => r.userId === req.user.userId);
    res.json(reservations);
  } catch (error) {
    console.error('Get reservations error:', error);
    res.status(500).json({ message: 'Error fetching reservations' });
  }
});

// Get single reservation
router.get('/:id', (req, res) => {
  try {
    const reservation = getReservationById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    if (reservation.userId !== req.user.userId) {
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
  body('pickupDate').notEmpty(),
  body('returnDate').notEmpty(),
  body('customerName').trim().notEmpty(),
  body('customerEmail').isEmail().normalizeEmail(),
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const reservations = getReservations();
    const newReservation = createReservation({
      ...req.body,
      userId: req.user.userId,
    });

    reservations.push(newReservation);
    saveReservations(reservations);

    res.status(201).json(newReservation);
  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({ message: 'Error creating reservation' });
  }
});

// Update reservation
router.put('/:id', (req, res) => {
  try {
    const reservation = getReservationById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    if (reservation.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updated = updateReservation(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    console.error('Update reservation error:', error);
    res.status(500).json({ message: 'Error updating reservation' });
  }
});

// Delete reservation
router.delete('/:id', (req, res) => {
  try {
    const reservation = getReservationById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    if (reservation.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    deleteReservation(req.params.id);
    res.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    console.error('Delete reservation error:', error);
    res.status(500).json({ message: 'Error deleting reservation' });
  }
});

export default router;


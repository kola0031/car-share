import express from 'express';
import { getReservations } from '../database/reservations.js';
import { getVehicles } from '../database/vehicles.js';

const router = express.Router();

// Get dashboard stats
router.get('/stats', (req, res) => {
  try {
    const reservations = getReservations().filter(r => r.userId === req.user.userId);
    const vehicles = getVehicles().filter(v => v.userId === req.user.userId);

    const stats = {
      totalReservations: reservations.length,
      activeReservations: reservations.filter(r => r.status === 'confirmed' || r.status === 'active').length,
      pendingReservations: reservations.filter(r => r.status === 'pending').length,
      totalVehicles: vehicles.length,
      availableVehicles: vehicles.filter(v => v.status === 'available').length,
      totalRevenue: reservations
        .filter(r => r.status === 'confirmed' || r.status === 'completed')
        .reduce((sum, r) => sum + (r.totalAmount || 0), 0),
      monthlyRevenue: reservations
        .filter(r => {
          const reservationDate = new Date(r.createdAt);
          const now = new Date();
          return (r.status === 'confirmed' || r.status === 'completed') &&
                 reservationDate.getMonth() === now.getMonth() &&
                 reservationDate.getFullYear() === now.getFullYear();
        })
        .reduce((sum, r) => sum + (r.totalAmount || 0), 0),
    };

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
});

// Get recent reservations
router.get('/recent-reservations', (req, res) => {
  try {
    const reservations = getReservations()
      .filter(r => r.userId === req.user.userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    res.json(reservations);
  } catch (error) {
    console.error('Recent reservations error:', error);
    res.status(500).json({ message: 'Error fetching recent reservations' });
  }
});

export default router;


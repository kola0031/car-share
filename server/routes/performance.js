import express from 'express';
import { getHostById } from '../database/hosts.js';
import { getVehiclesByHostId } from '../database/vehicles.js';
import { getReservationsByHostId } from '../database/reservations.js';

const router = express.Router();

// Get performance dashboard for host
router.get('/dashboard/:hostId', async (req, res) => {
  try {
    const host = await getHostById(req.params.hostId);
    if (!host) {
      return res.status(404).json({ message: 'Host not found' });
    }

    const vehicles = await getVehiclesByHostId(req.params.hostId);
    const reservations = await getReservationsByHostId(req.params.hostId);

    // Calculate basic performance metrics
    const totalRevenue = reservations
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + (r.totalCost || 0), 0);

    const activeReservations = reservations.filter(r =>
      r.status === 'confirmed' || r.status === 'active'
    ).length;

    const completedReservations = reservations.filter(r =>
      r.status === 'completed'
    ).length;

    // Calculate revenue uptime (percentage of days with bookings in last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentReservations = reservations.filter(r =>
      new Date(r.createdAt) >= thirtyDaysAgo
    );

    const revenueUptime = recentReservations.length > 0
      ? (recentReservations.length / 30 * 100).toFixed(2)
      : 0;

    res.json({
      host,
      performance: {
        totalRevenue,
        activeReservations,
        completedReservations,
        revenueUptime: parseFloat(revenueUptime),
      },
      totalVehicles: vehicles.length,
      totalReservations: reservations.length,
      vehicles: vehicles.map(v => ({
        id: v._id,
        make: v.make,
        model: v.model,
        status: v.status,
      })),
    });
  } catch (error) {
    console.error('Error fetching performance dashboard:', error);
    res.status(500).json({ message: 'Error fetching performance dashboard', error: error.message });
  }
});

// Get revenue analytics
router.get('/revenue/:hostId', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const reservations = await getReservationsByHostId(req.params.hostId);

    // Filter by date range if provided
    let filteredReservations = reservations;
    if (startDate && endDate) {
      filteredReservations = reservations.filter(r => {
        const resDate = new Date(r.createdAt);
        return resDate >= new Date(startDate) && resDate <= new Date(endDate);
      });
    }

    const totalRevenue = filteredReservations
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + (r.totalCost || 0), 0);

    // Group by date
    const revenueByDate = {};
    filteredReservations.forEach(reservation => {
      const date = new Date(reservation.createdAt).toISOString().split('T')[0];
      if (!revenueByDate[date]) {
        revenueByDate[date] = {
          date,
          bookingRevenue: 0,
          count: 0,
        };
      }
      if (reservation.status === 'completed') {
        revenueByDate[date].bookingRevenue += reservation.totalCost || 0;
      }
      revenueByDate[date].count += 1;
    });

    res.json({
      summary: {
        totalRevenue,
        recordCount: filteredReservations.length,
      },
      byDate: Object.values(revenueByDate).sort((a, b) =>
        new Date(a.date) - new Date(b.date)
      ),
    });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({ message: 'Error fetching revenue analytics', error: error.message });
  }
});

export default router;

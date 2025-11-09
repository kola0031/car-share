import express from 'express';
import { calculateHostPerformance, getRevenueRecordsByHostId } from '../database/revenue.js';
import { getHostById } from '../database/hosts.js';
import { getVehicles } from '../database/vehicles.js';
import { getReservations } from '../database/reservations.js';
import { calculateRevenueUptime } from '../database/revenue.js';

const router = express.Router();

// Get performance dashboard for host
router.get('/dashboard/:hostId', (req, res) => {
  try {
    const host = getHostById(req.params.hostId);
    if (!host) {
      return res.status(404).json({ message: 'Host not found' });
    }

    const performance = calculateHostPerformance(req.params.hostId);
    const vehicles = getVehicles().filter(v => v.hostId === req.params.hostId);
    const reservations = getReservations().filter(r => r.hostId === req.params.hostId);

    // Calculate revenue uptime for each vehicle
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const vehicleUptimes = vehicles.map(vehicle => ({
      vehicleId: vehicle.id,
      vehicleName: vehicle.make + ' ' + vehicle.model,
      revenueUptime: calculateRevenueUptime(
        vehicle.id,
        thirtyDaysAgo.toISOString().split('T')[0],
        now.toISOString().split('T')[0]
      ),
    }));

    // Calculate average revenue uptime
    const averageRevenueUptime = vehicleUptimes.length > 0
      ? vehicleUptimes.reduce((sum, v) => sum + v.revenueUptime, 0) / vehicleUptimes.length
      : 0;

    res.json({
      host,
      performance: {
        ...performance,
        revenueUptime: averageRevenueUptime,
      },
      vehicleUptimes,
      totalVehicles: vehicles.length,
      totalReservations: reservations.length,
    });
  } catch (error) {
    console.error('Error fetching performance dashboard:', error);
    res.status(500).json({ message: 'Error fetching performance dashboard' });
  }
});

// Get revenue analytics
router.get('/revenue/:hostId', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const records = getRevenueRecordsByHostId(req.params.hostId, startDate, endDate);

    const totalRevenue = records.reduce((sum, r) => sum + (r.bookingRevenue || 0), 0);
    const totalCosts = records.reduce((sum, r) => 
      sum + (r.maintenanceCost || 0) + (r.cleaningCost || 0) + (r.subscriptionFee || 0), 0
    );
    const netRevenue = totalRevenue - totalCosts;

    // Group by date
    const revenueByDate = {};
    records.forEach(record => {
      if (!revenueByDate[record.date]) {
        revenueByDate[record.date] = {
          date: record.date,
          bookingRevenue: 0,
          costs: 0,
          netRevenue: 0,
        };
      }
      revenueByDate[record.date].bookingRevenue += record.bookingRevenue || 0;
      revenueByDate[record.date].costs += 
        (record.maintenanceCost || 0) + 
        (record.cleaningCost || 0) + 
        (record.subscriptionFee || 0);
      revenueByDate[record.date].netRevenue = 
        revenueByDate[record.date].bookingRevenue - revenueByDate[record.date].costs;
    });

    res.json({
      summary: {
        totalRevenue,
        totalCosts,
        netRevenue,
        recordCount: records.length,
      },
      byDate: Object.values(revenueByDate).sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      ),
      records,
    });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({ message: 'Error fetching revenue analytics' });
  }
});

export default router;


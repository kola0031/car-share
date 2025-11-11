import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  getHosts,
  getHostById,
  getHostByUserId,
  createHost,
  updateHost,
  deleteHost,
} from '../database/hosts.js';
import { getFleetsByHostId } from '../database/fleets.js';
import { getSubscriptionByHostId } from '../database/subscriptions.js';
import { calculateHostPerformance } from '../database/revenue.js';
import { getVehicles } from '../database/vehicles.js';

const router = express.Router();

// Middleware to check if user owns the host or is accessing their own host
const checkHostOwnership = (req, res, next) => {
  const hostId = req.params.id;
  const userId = req.user?.userId;
  const tokenHostId = req.user?.hostId;

  console.log('checkHostOwnership:', {
    hostId,
    userId,
    tokenHostId,
    userFromToken: req.user
  });

  // If hostId in token matches, allow access
  if (tokenHostId === hostId) {
    console.log('Access granted: token hostId matches');
    return next();
  }

  // Otherwise, check if the host belongs to the user
  const host = getHostById(hostId);
  if (!host) {
    console.log('Host not found:', hostId);
    return res.status(404).json({ message: 'Host not found' });
  }

  console.log('Host found:', {
    hostId: host.id,
    hostUserId: host.userId,
    tokenUserId: userId,
    match: host.userId === userId
  });

  if (host.userId !== userId) {
    console.log('Access denied: userId mismatch');
    return res.status(403).json({ 
      message: 'Access denied. You can only access your own host data.',
      debug: {
        hostUserId: host.userId,
        tokenUserId: userId,
        tokenHostId: tokenHostId
      }
    });
  }

  console.log('Access granted: userId matches');
  next();
};

// Get all hosts (admin only - add admin check if needed)
router.get('/', (req, res) => {
  try {
    const hosts = getHosts();
    res.json(hosts);
  } catch (error) {
    console.error('Error fetching hosts:', error);
    res.status(500).json({ message: 'Error fetching hosts' });
  }
});

// Get host by ID
router.get('/:id', checkHostOwnership, (req, res) => {
  try {
    const host = getHostById(req.params.id);
    if (!host) {
      return res.status(404).json({ message: 'Host not found' });
    }
    res.json(host);
  } catch (error) {
    console.error('Error fetching host:', error);
    res.status(500).json({ message: 'Error fetching host' });
  }
});

// Get host by user ID
router.get('/user/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
    const tokenUserId = req.user?.userId;

    // Users can only access their own host data
    if (userId !== tokenUserId) {
      return res.status(403).json({ message: 'Access denied. You can only access your own host data.' });
    }

    const host = getHostByUserId(userId);
    if (!host) {
      return res.status(404).json({ message: 'Host not found for this user' });
    }
    res.json(host);
  } catch (error) {
    console.error('Error fetching host:', error);
    res.status(500).json({ message: 'Error fetching host' });
  }
});

// Get host dashboard data
router.get('/:id/dashboard', checkHostOwnership, (req, res) => {
  try {
    const host = getHostById(req.params.id);
    if (!host) {
      return res.status(404).json({ message: 'Host not found' });
    }

    const fleets = getFleetsByHostId(req.params.id);
    const subscription = getSubscriptionByHostId(req.params.id);
    const performance = calculateHostPerformance(req.params.id);
    const vehicles = getVehicles().filter(v => v.hostId === req.params.id);

    res.json({
      host,
      fleets,
      subscription,
      performance,
      vehicles: vehicles.length,
      fleetSize: vehicles.length,
    });
  } catch (error) {
    console.error('Error fetching host dashboard:', error);
    res.status(500).json({ message: 'Error fetching host dashboard' });
  }
});

// Create new host
router.post('/', [
  body('userId').notEmpty(),
  body('companyName').optional().trim(),
  body('serviceTier').optional().isIn(['Basic', 'Pro', 'Enterprise']),
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if host already exists for this user
    const existingHost = getHostByUserId(req.body.userId);
    if (existingHost) {
      return res.status(400).json({ message: 'Host already exists for this user' });
    }

    const host = createHost(req.body);
    res.status(201).json(host);
  } catch (error) {
    console.error('Error creating host:', error);
    res.status(500).json({ message: 'Error creating host' });
  }
});

// Update host
router.put('/:id', checkHostOwnership, (req, res) => {
  try {
    const host = updateHost(req.params.id, req.body);
    if (!host) {
      return res.status(404).json({ message: 'Host not found' });
    }
    res.json(host);
  } catch (error) {
    console.error('Error updating host:', error);
    res.status(500).json({ message: 'Error updating host' });
  }
});

// Delete host
router.delete('/:id', checkHostOwnership, (req, res) => {
  try {
    const deleted = deleteHost(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Host not found' });
    }
    res.json({ message: 'Host deleted successfully' });
  } catch (error) {
    console.error('Error deleting host:', error);
    res.status(500).json({ message: 'Error deleting host' });
  }
});

export default router;


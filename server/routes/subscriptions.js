import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  getSubscriptions,
  getSubscriptionById,
  getSubscriptionByHostId,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  SERVICE_TIERS,
} from '../database/subscriptions.js';
import { getHostByUserId } from '../database/hosts.js';

const router = express.Router();

// Get all service tiers
router.get('/tiers', (req, res) => {
  try {
    res.json(SERVICE_TIERS);
  } catch (error) {
    console.error('Error fetching service tiers:', error);
    res.status(500).json({ message: 'Error fetching service tiers' });
  }
});

// Get subscription for authenticated host
router.get('/', (req, res) => {
  try {
    // Get host ID from JWT token or look it up by userId
    let hostId = req.user.hostId || req.query.hostId;
    if (!hostId) {
      const host = getHostByUserId(req.user.userId);
      if (!host) {
        return res.status(404).json({ message: 'Host not found for this user' });
      }
      hostId = host.id;
    }
    
    const subscription = getSubscriptionByHostId(hostId);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    res.json(subscription);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ message: 'Error fetching subscription' });
  }
});

// Get subscription by ID
router.get('/:id', (req, res) => {
  try {
    const subscription = getSubscriptionById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    res.json(subscription);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ message: 'Error fetching subscription' });
  }
});

// Create new subscription
router.post('/', [
  body('hostId').notEmpty(),
  body('serviceTier').isIn(['Basic', 'Pro', 'Enterprise']),
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if subscription already exists
    const existing = getSubscriptionByHostId(req.body.hostId);
    if (existing) {
      return res.status(400).json({ message: 'Subscription already exists for this host' });
    }

    const subscription = createSubscription(req.body);
    res.status(201).json(subscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ message: 'Error creating subscription' });
  }
});

// Update subscription (e.g., upgrade/downgrade tier)
router.put('/:id', [
  body('serviceTier').optional().isIn(['Basic', 'Pro', 'Enterprise']),
  body('status').optional().isIn(['active', 'suspended', 'cancelled']),
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const subscription = updateSubscription(req.params.id, req.body);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    res.json(subscription);
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ message: 'Error updating subscription' });
  }
});

// Cancel subscription
router.post('/:id/cancel', (req, res) => {
  try {
    const subscription = updateSubscription(req.params.id, {
      status: 'cancelled',
      autoRenew: false,
    });
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    res.json(subscription);
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ message: 'Error cancelling subscription' });
  }
});

// Delete subscription
router.delete('/:id', (req, res) => {
  try {
    const deleted = deleteSubscription(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    res.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    res.status(500).json({ message: 'Error deleting subscription' });
  }
});

export default router;


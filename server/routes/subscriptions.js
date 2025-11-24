import express from 'express';
import { getHostByUserId, getHostById, updateHost } from '../database/hosts.js';

const router = express.Router();

// Service tiers definition
const SERVICE_TIERS = {
  basic: {
    name: 'Basic',
    price: 299,
    features: ['Up to 5 vehicles', 'Basic analytics', 'Email support'],
  },
  pro: {
    name: 'Pro',
    price: 499,
    features: ['Up to 20 vehicles', 'Advanced analytics', 'Priority support', 'AI pricing'],
  },
  enterprise: {
    name: 'Enterprise',
    price: 999,
    features: ['Unlimited vehicles', 'Real-time analytics', '24/7 support', 'White-label'],
  },
};

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
router.get('/', async (req, res) => {
  try {
    // Get host ID from JWT token or query
    let hostId = req.user.hostId || req.query.hostId;

    if (!hostId) {
      const host = await getHostByUserId(req.user.userId);
      if (!host) {
        return res.status(404).json({ message: 'Host not found for this user' });
      }
      hostId = host._id.toString();
    }

    const host = await getHostById(hostId);
    if (!host) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Return subscription info from host record
    res.json({
      id: host._id,
      hostId: host._id,
      serviceTier: host.serviceTier || 'none',
      status: host.subscriptionStatus || 'pending',
      monthlyFee: host.monthlySubscriptionFee || 0,
      stripeSubscriptionId: host.stripeSubscriptionId,
      features: SERVICE_TIERS[host.serviceTier?.toLowerCase()]?.features || [],
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ message: 'Error fetching subscription' });
  }
});

// Update subscription (e.g., upgrade/downgrade tier)
router.put('/:id', async (req, res) => {
  try {
    const { serviceTier, status } = req.body;

    const updates = {};
    if (serviceTier) updates.serviceTier = serviceTier;
    if (status) updates.subscriptionStatus = status;

    const host = await updateHost(req.params.id, updates);
    if (!host) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.json({
      id: host._id,
      serviceTier: host.serviceTier,
      status: host.subscriptionStatus,
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ message: 'Error updating subscription' });
  }
});

export default router;

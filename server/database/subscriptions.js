import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUBSCRIPTIONS_FILE = path.join(__dirname, '../data/subscriptions.json');

const dataDir = path.dirname(SUBSCRIPTIONS_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(SUBSCRIPTIONS_FILE)) {
  fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify([], null, 2));
}

// Service Tier Definitions
export const SERVICE_TIERS = {
  Basic: {
    name: 'Basic',
    monthlyFee: 299,
    features: [
      'Maintenance + Cleaning management',
      'Basic reporting',
      'Email support',
    ],
  },
  Pro: {
    name: 'Pro',
    monthlyFee: 399,
    features: [
      'Everything in Basic',
      'Full guest communication',
      'Pricing optimization',
      'Advanced reporting',
      'Priority support',
    ],
  },
  Enterprise: {
    name: 'Enterprise',
    monthlyFee: 599,
    features: [
      'Everything in Pro',
      'Fleet scaling support',
      'Predictive maintenance',
      'Data insights & analytics',
      'Dedicated account manager',
      'Custom integrations',
    ],
  },
};

export const getSubscriptions = () => {
  try {
    const data = fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading subscriptions:', error);
    return [];
  }
};

export const saveSubscriptions = (subscriptions) => {
  try {
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subscriptions, null, 2));
  } catch (error) {
    console.error('Error saving subscriptions:', error);
    throw error;
  }
};

export const createSubscription = (subscriptionData) => {
  const subscriptions = getSubscriptions();
  const tier = SERVICE_TIERS[subscriptionData.serviceTier] || SERVICE_TIERS.Basic;
  
  const newSubscription = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    hostId: subscriptionData.hostId,
    serviceTier: subscriptionData.serviceTier || 'Basic',
    monthlyFee: tier.monthlyFee,
    status: subscriptionData.status || 'active', // active, suspended, cancelled
    startDate: subscriptionData.startDate || new Date().toISOString(),
    nextBillingDate: subscriptionData.nextBillingDate || getNextBillingDate(),
    autoRenew: subscriptionData.autoRenew !== undefined ? subscriptionData.autoRenew : true,
    paymentMethod: subscriptionData.paymentMethod || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...subscriptionData,
  };
  subscriptions.push(newSubscription);
  saveSubscriptions(subscriptions);
  return newSubscription;
};

export const getSubscriptionById = (subscriptionId) => {
  const subscriptions = getSubscriptions();
  return subscriptions.find(s => s.id === subscriptionId);
};

export const getSubscriptionByHostId = (hostId) => {
  const subscriptions = getSubscriptions();
  return subscriptions.find(s => s.hostId === hostId);
};

export const updateSubscription = (subscriptionId, updates) => {
  const subscriptions = getSubscriptions();
  const index = subscriptions.findIndex(s => s.id === subscriptionId);
  if (index !== -1) {
    // Update monthly fee if tier changed
    if (updates.serviceTier && updates.serviceTier !== subscriptions[index].serviceTier) {
      const tier = SERVICE_TIERS[updates.serviceTier];
      if (tier) {
        updates.monthlyFee = tier.monthlyFee;
      }
    }
    subscriptions[index] = { 
      ...subscriptions[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    saveSubscriptions(subscriptions);
    return subscriptions[index];
  }
  return null;
};

export const deleteSubscription = (subscriptionId) => {
  const subscriptions = getSubscriptions();
  const filtered = subscriptions.filter(s => s.id !== subscriptionId);
  saveSubscriptions(filtered);
  return filtered.length !== subscriptions.length;
};

function getNextBillingDate() {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString();
}


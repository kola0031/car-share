import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HOSTS_FILE = path.join(__dirname, '../data/hosts.json');

const dataDir = path.dirname(HOSTS_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(HOSTS_FILE)) {
  fs.writeFileSync(HOSTS_FILE, JSON.stringify([], null, 2));
}

export const getHosts = () => {
  try {
    const data = fs.readFileSync(HOSTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading hosts:', error);
    return [];
  }
};

export const saveHosts = (hosts) => {
  try {
    fs.writeFileSync(HOSTS_FILE, JSON.stringify(hosts, null, 2));
  } catch (error) {
    console.error('Error saving hosts:', error);
    throw error;
  }
};

export const createHost = (hostData) => {
  const hosts = getHosts();
  const newHost = {
    id: `host_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: hostData.userId, // Link to user account
    companyName: hostData.companyName || '',
    serviceTier: hostData.serviceTier || 'Basic', // Basic, Pro, Enterprise
    subscriptionStatus: hostData.subscriptionStatus || 'active',
    subscriptionStartDate: hostData.subscriptionStartDate || new Date().toISOString(),
    monthlySubscriptionFee: hostData.monthlySubscriptionFee || 299,
    fleetSize: 0,
    totalRevenue: 0,
    revenueUptime: 0, // Percentage
    onboardingStatus: hostData.onboardingStatus || 'pending', // pending, in-progress, completed
    hostPilotIntegrationId: hostData.hostPilotIntegrationId || null,
    parkMyShareLocation: hostData.parkMyShareLocation || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...hostData,
  };
  hosts.push(newHost);
  saveHosts(hosts);
  return newHost;
};

export const getHostById = (hostId) => {
  const hosts = getHosts();
  return hosts.find(h => h.id === hostId);
};

export const getHostByUserId = (userId) => {
  const hosts = getHosts();
  return hosts.find(h => h.userId === userId);
};

export const updateHost = (hostId, updates) => {
  const hosts = getHosts();
  const index = hosts.findIndex(h => h.id === hostId);
  if (index !== -1) {
    hosts[index] = { 
      ...hosts[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    saveHosts(hosts);
    return hosts[index];
  }
  return null;
};

export const deleteHost = (hostId) => {
  const hosts = getHosts();
  const filtered = hosts.filter(h => h.id !== hostId);
  saveHosts(filtered);
  return filtered.length !== hosts.length;
};


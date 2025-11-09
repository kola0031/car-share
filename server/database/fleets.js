import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FLEETS_FILE = path.join(__dirname, '../data/fleets.json');

const dataDir = path.dirname(FLEETS_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(FLEETS_FILE)) {
  fs.writeFileSync(FLEETS_FILE, JSON.stringify([], null, 2));
}

export const getFleets = () => {
  try {
    const data = fs.readFileSync(FLEETS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading fleets:', error);
    return [];
  }
};

export const saveFleets = (fleets) => {
  try {
    fs.writeFileSync(FLEETS_FILE, JSON.stringify(fleets, null, 2));
  } catch (error) {
    console.error('Error saving fleets:', error);
    throw error;
  }
};

export const createFleet = (fleetData) => {
  const fleets = getFleets();
  const newFleet = {
    id: `fleet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    hostId: fleetData.hostId,
    name: fleetData.name || 'Main Fleet',
    vehicleIds: fleetData.vehicleIds || [],
    totalVehicles: 0,
    activeVehicles: 0,
    utilizationRate: 0, // Percentage
    averageDailyRevenue: 0,
    maintenanceCostRatio: 0, // Percentage
    guestSatisfactionScore: 0, // 0-5
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...fleetData,
  };
  fleets.push(newFleet);
  saveFleets(fleets);
  return newFleet;
};

export const getFleetById = (fleetId) => {
  const fleets = getFleets();
  return fleets.find(f => f.id === fleetId);
};

export const getFleetsByHostId = (hostId) => {
  const fleets = getFleets();
  return fleets.filter(f => f.hostId === hostId);
};

export const updateFleet = (fleetId, updates) => {
  const fleets = getFleets();
  const index = fleets.findIndex(f => f.id === fleetId);
  if (index !== -1) {
    fleets[index] = { 
      ...fleets[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    saveFleets(fleets);
    return fleets[index];
  }
  return null;
};

export const deleteFleet = (fleetId) => {
  const fleets = getFleets();
  const filtered = fleets.filter(f => f.id !== fleetId);
  saveFleets(filtered);
  return filtered.length !== fleets.length;
};


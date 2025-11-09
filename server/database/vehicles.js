import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VEHICLES_FILE = path.join(__dirname, '../data/vehicles.json');

const dataDir = path.dirname(VEHICLES_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(VEHICLES_FILE)) {
  fs.writeFileSync(VEHICLES_FILE, JSON.stringify([], null, 2));
}

export const getVehicles = () => {
  try {
    const data = fs.readFileSync(VEHICLES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading vehicles:', error);
    return [];
  }
};

export const saveVehicles = (vehicles) => {
  try {
    fs.writeFileSync(VEHICLES_FILE, JSON.stringify(vehicles, null, 2));
  } catch (error) {
    console.error('Error saving vehicles:', error);
    throw error;
  }
};

export const createVehicle = (vehicleData) => {
  const vehicles = getVehicles();
  const newVehicle = {
    id: `vehicle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    ...vehicleData,
  };
  return newVehicle;
};

export const getVehicleById = (vehicleId) => {
  const vehicles = getVehicles();
  return vehicles.find(v => v.id === vehicleId);
};

export const updateVehicle = (vehicleId, updates) => {
  const vehicles = getVehicles();
  const index = vehicles.findIndex(v => v.id === vehicleId);
  if (index !== -1) {
    vehicles[index] = { ...vehicles[index], ...updates, updatedAt: new Date().toISOString() };
    saveVehicles(vehicles);
    return vehicles[index];
  }
  return null;
};

export const deleteVehicle = (vehicleId) => {
  const vehicles = getVehicles();
  const filtered = vehicles.filter(v => v.id !== vehicleId);
  saveVehicles(filtered);
  return filtered.length !== vehicles.length;
};


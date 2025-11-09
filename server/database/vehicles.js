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
    hostId: vehicleData.hostId,
    make: vehicleData.make || '',
    model: vehicleData.model || '',
    year: vehicleData.year || null,
    vin: vehicleData.vin || '',
    licensePlate: vehicleData.licensePlate || '',
    color: vehicleData.color || '',
    mileage: vehicleData.mileage || 0,
    status: vehicleData.status || 'pending', // pending, available, rented, maintenance, inactive
    dailyRate: vehicleData.dailyRate || 0,
    photos: vehicleData.photos || [],
    documents: {
      registration: vehicleData.documents?.registration || null,
      insurance: vehicleData.documents?.insurance || null,
      inspection: vehicleData.documents?.inspection || null,
    },
    verificationStatus: vehicleData.verificationStatus || 'pending', // pending, verified, rejected
    parkMyShareLocation: vehicleData.parkMyShareLocation || null,
    maintenancePlan: vehicleData.maintenancePlan || 'standard', // standard, premium
    features: vehicleData.features || [], // GPS, Bluetooth, etc.
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...vehicleData,
  };
  vehicles.push(newVehicle);
  saveVehicles(vehicles);
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


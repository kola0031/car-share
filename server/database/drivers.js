import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DRIVERS_FILE = path.join(__dirname, '../data/drivers.json');

const dataDir = path.dirname(DRIVERS_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(DRIVERS_FILE)) {
  fs.writeFileSync(DRIVERS_FILE, JSON.stringify([], null, 2));
}

export const getDrivers = () => {
  try {
    const data = fs.readFileSync(DRIVERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading drivers:', error);
    return [];
  }
};

export const saveDrivers = (drivers) => {
  try {
    fs.writeFileSync(DRIVERS_FILE, JSON.stringify(drivers, null, 2));
  } catch (error) {
    console.error('Error saving drivers:', error);
    throw error;
  }
};

export const createDriver = (driverData) => {
  const drivers = getDrivers();
  const newDriver = {
    id: `driver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: driverData.userId, // Link to user account
    name: driverData.name || '',
    email: driverData.email || '',
    phone: driverData.phone || '',
    licenseNumber: driverData.licenseNumber || '',
    licenseExpiry: driverData.licenseExpiry || null,
    dateOfBirth: driverData.dateOfBirth || null,
    address: driverData.address || {},
    verificationStatus: driverData.verificationStatus || 'pending', // pending, verified, rejected
    rating: driverData.rating || 0, // 0-5
    totalTrips: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...driverData,
  };
  drivers.push(newDriver);
  saveDrivers(drivers);
  return newDriver;
};

export const getDriverById = (driverId) => {
  const drivers = getDrivers();
  return drivers.find(d => d.id === driverId);
};

export const getDriverByUserId = (userId) => {
  const drivers = getDrivers();
  return drivers.find(d => d.userId === userId);
};

export const updateDriver = (driverId, updates) => {
  const drivers = getDrivers();
  const index = drivers.findIndex(d => d.id === driverId);
  if (index !== -1) {
    drivers[index] = { 
      ...drivers[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    saveDrivers(drivers);
    return drivers[index];
  }
  return null;
};

export const deleteDriver = (driverId) => {
  const drivers = getDrivers();
  const filtered = drivers.filter(d => d.id !== driverId);
  saveDrivers(filtered);
  return filtered.length !== drivers.length;
};


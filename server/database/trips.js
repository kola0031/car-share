import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TRIPS_FILE = path.join(__dirname, '../data/trips.json');

const dataDir = path.dirname(TRIPS_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(TRIPS_FILE)) {
  fs.writeFileSync(TRIPS_FILE, JSON.stringify([], null, 2));
}

export const getTrips = () => {
  try {
    const data = fs.readFileSync(TRIPS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading trips:', error);
    return [];
  }
};

export const saveTrips = (trips) => {
  try {
    fs.writeFileSync(TRIPS_FILE, JSON.stringify(trips, null, 2));
  } catch (error) {
    console.error('Error saving trips:', error);
    throw error;
  }
};

export const createTrip = (tripData) => {
  const trips = getTrips();
  const newTrip = {
    id: `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    bookingId: tripData.bookingId,
    driverId: tripData.driverId,
    vehicleId: tripData.vehicleId,
    hostId: tripData.hostId,
    status: tripData.status || 'scheduled', // scheduled, active, completed, cancelled
    pickupTime: tripData.pickupTime || null,
    returnTime: tripData.returnTime || null,
    pickupLocation: tripData.pickupLocation || '',
    returnLocation: tripData.returnLocation || '',
    mileageStart: tripData.mileageStart || null,
    mileageEnd: tripData.mileageEnd || null,
    fuelLevelStart: tripData.fuelLevelStart || null, // percentage
    fuelLevelEnd: tripData.fuelLevelEnd || null,
    conditionStart: tripData.conditionStart || null, // photos, notes
    conditionEnd: tripData.conditionEnd || null,
    issues: tripData.issues || [],
    supportTickets: tripData.supportTickets || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...tripData,
  };
  trips.push(newTrip);
  saveTrips(trips);
  return newTrip;
};

export const getTripById = (tripId) => {
  const trips = getTrips();
  return trips.find(t => t.id === tripId);
};

export const getTripByBookingId = (bookingId) => {
  const trips = getTrips();
  return trips.find(t => t.bookingId === bookingId);
};

export const getActiveTrips = () => {
  const trips = getTrips();
  return trips.filter(t => t.status === 'active');
};

export const getTripsByDriverId = (driverId) => {
  const trips = getTrips();
  return trips.filter(t => t.driverId === driverId);
};

export const getTripsByHostId = (hostId) => {
  const trips = getTrips();
  return trips.filter(t => t.hostId === hostId);
};

export const updateTrip = (tripId, updates) => {
  const trips = getTrips();
  const index = trips.findIndex(t => t.id === tripId);
  if (index !== -1) {
    trips[index] = { 
      ...trips[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    saveTrips(trips);
    return trips[index];
  }
  return null;
};

export const deleteTrip = (tripId) => {
  const trips = getTrips();
  const filtered = trips.filter(t => t.id !== tripId);
  saveTrips(filtered);
  return filtered.length !== trips.length;
};


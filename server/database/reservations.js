import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RESERVATIONS_FILE = path.join(__dirname, '../data/reservations.json');

const dataDir = path.dirname(RESERVATIONS_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(RESERVATIONS_FILE)) {
  fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify([], null, 2));
}

export const getReservations = () => {
  try {
    const data = fs.readFileSync(RESERVATIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading reservations:', error);
    return [];
  }
};

export const saveReservations = (reservations) => {
  try {
    fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify(reservations, null, 2));
  } catch (error) {
    console.error('Error saving reservations:', error);
    throw error;
  }
};

export const createReservation = (reservationData) => {
  const reservations = getReservations();
  const newReservation = {
    id: `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
    ...reservationData,
  };
  return newReservation;
};

export const getReservationById = (reservationId) => {
  const reservations = getReservations();
  return reservations.find(r => r.id === reservationId);
};

export const updateReservation = (reservationId, updates) => {
  const reservations = getReservations();
  const index = reservations.findIndex(r => r.id === reservationId);
  if (index !== -1) {
    reservations[index] = { 
      ...reservations[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    saveReservations(reservations);
    return reservations[index];
  }
  return null;
};

export const deleteReservation = (reservationId) => {
  const reservations = getReservations();
  const filtered = reservations.filter(r => r.id !== reservationId);
  saveReservations(filtered);
  return filtered.length !== reservations.length;
};


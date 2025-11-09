import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOOKINGS_FILE = path.join(__dirname, '../data/bookings.json');

const dataDir = path.dirname(BOOKINGS_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(BOOKINGS_FILE)) {
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([], null, 2));
}

export const getBookings = () => {
  try {
    const data = fs.readFileSync(BOOKINGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading bookings:', error);
    return [];
  }
};

export const saveBookings = (bookings) => {
  try {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
  } catch (error) {
    console.error('Error saving bookings:', error);
    throw error;
  }
};

export const createBooking = (bookingData) => {
  const bookings = getBookings();
  const newBooking = {
    id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    driverId: bookingData.driverId,
    vehicleId: bookingData.vehicleId,
    hostId: bookingData.hostId,
    pickupDate: bookingData.pickupDate,
    returnDate: bookingData.returnDate,
    pickupLocation: bookingData.pickupLocation || 'PackMyShare Location',
    returnLocation: bookingData.returnLocation || bookingData.pickupLocation || 'PackMyShare Location',
    totalAmount: bookingData.totalAmount || 0,
    dailyRate: bookingData.dailyRate || 0,
    numberOfDays: bookingData.numberOfDays || 1,
    status: bookingData.status || 'pending', // pending, confirmed, active, completed, cancelled
    paymentStatus: bookingData.paymentStatus || 'pending', // pending, paid, refunded
    paymentIntentId: bookingData.paymentIntentId || null, // Stripe payment intent
    driverName: bookingData.driverName || '',
    driverEmail: bookingData.driverEmail || '',
    driverPhone: bookingData.driverPhone || '',
    driverLicense: bookingData.driverLicense || '',
    specialRequests: bookingData.specialRequests || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...bookingData,
  };
  bookings.push(newBooking);
  saveBookings(bookings);
  return newBooking;
};

export const getBookingById = (bookingId) => {
  const bookings = getBookings();
  return bookings.find(b => b.id === bookingId);
};

export const getBookingsByDriverId = (driverId) => {
  const bookings = getBookings();
  return bookings.filter(b => b.driverId === driverId);
};

export const getBookingsByHostId = (hostId) => {
  const bookings = getBookings();
  return bookings.filter(b => b.hostId === hostId);
};

export const getBookingsByVehicleId = (vehicleId) => {
  const bookings = getBookings();
  return bookings.filter(b => b.vehicleId === vehicleId);
};

export const getAvailableVehicles = (startDate, endDate) => {
  const bookings = getBookings();
  const conflictingBookings = bookings.filter(b => {
    if (b.status === 'cancelled') return false;
    const bookingStart = new Date(b.pickupDate);
    const bookingEnd = new Date(b.returnDate);
    const requestedStart = new Date(startDate);
    const requestedEnd = new Date(endDate);
    
    // Check for overlap
    return (requestedStart <= bookingEnd && requestedEnd >= bookingStart);
  });
  
  const bookedVehicleIds = conflictingBookings.map(b => b.vehicleId);
  return bookedVehicleIds;
};

export const updateBooking = (bookingId, updates) => {
  const bookings = getBookings();
  const index = bookings.findIndex(b => b.id === bookingId);
  if (index !== -1) {
    bookings[index] = { 
      ...bookings[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    saveBookings(bookings);
    return bookings[index];
  }
  return null;
};

export const deleteBooking = (bookingId) => {
  const bookings = getBookings();
  const filtered = bookings.filter(b => b.id !== bookingId);
  saveBookings(filtered);
  return filtered.length !== bookings.length;
};


import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getReservations } from './reservations.js';
import { getVehicles } from './vehicles.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REVENUE_FILE = path.join(__dirname, '../data/revenue.json');

const dataDir = path.dirname(REVENUE_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(REVENUE_FILE)) {
  fs.writeFileSync(REVENUE_FILE, JSON.stringify([], null, 2));
}

export const getRevenueRecords = () => {
  try {
    const data = fs.readFileSync(REVENUE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading revenue records:', error);
    return [];
  }
};

export const saveRevenueRecords = (records) => {
  try {
    fs.writeFileSync(REVENUE_FILE, JSON.stringify(records, null, 2));
  } catch (error) {
    console.error('Error saving revenue records:', error);
    throw error;
  }
};

export const createRevenueRecord = (recordData) => {
  const records = getRevenueRecords();
  const newRecord = {
    id: `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    hostId: recordData.hostId,
    vehicleId: recordData.vehicleId || null,
    reservationId: recordData.reservationId || null,
    date: recordData.date || new Date().toISOString().split('T')[0],
    bookingRevenue: recordData.bookingRevenue || 0, // Revenue from Turo/Booking.com
    maintenanceCost: recordData.maintenanceCost || 0,
    cleaningCost: recordData.cleaningCost || 0,
    subscriptionFee: recordData.subscriptionFee || 0, // Monthly subscription
    netRevenue: recordData.netRevenue || 0, // bookingRevenue - costs
    source: recordData.source || 'turo', // turo, booking.com, direct
    createdAt: new Date().toISOString(),
    ...recordData,
  };
  records.push(newRecord);
  saveRevenueRecords(records);
  return newRecord;
};

export const getRevenueRecordsByHostId = (hostId, startDate = null, endDate = null) => {
  const records = getRevenueRecords();
  let filtered = records.filter(r => r.hostId === hostId);
  
  if (startDate) {
    filtered = filtered.filter(r => r.date >= startDate);
  }
  if (endDate) {
    filtered = filtered.filter(r => r.date <= endDate);
  }
  
  return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
};

// Calculate revenue uptime for a vehicle
export const calculateRevenueUptime = (vehicleId, startDate, endDate) => {
  const reservations = getReservations();
  const vehicleReservations = reservations.filter(r => 
    r.vehicleId === vehicleId &&
    r.status === 'completed' &&
    new Date(r.pickupDate) >= new Date(startDate) &&
    new Date(r.returnDate) <= new Date(endDate)
  );
  
  const totalDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
  let revenueDays = 0;
  
  vehicleReservations.forEach(reservation => {
    const pickup = new Date(reservation.pickupDate);
    const returnDate = new Date(reservation.returnDate);
    const days = Math.ceil((returnDate - pickup) / (1000 * 60 * 60 * 24));
    revenueDays += days;
  });
  
  return totalDays > 0 ? (revenueDays / totalDays) * 100 : 0;
};

// Calculate performance metrics for a host
export const calculateHostPerformance = (hostId) => {
  const reservations = getReservations();
  const vehicles = getVehicles();
  const revenueRecords = getRevenueRecords();
  
  const hostReservations = reservations.filter(r => r.hostId === hostId);
  const hostVehicles = vehicles.filter(v => v.hostId === hostId);
  const hostRevenue = revenueRecords.filter(r => r.hostId === hostId);
  
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const recentReservations = hostReservations.filter(r => 
    new Date(r.createdAt) >= thirtyDaysAgo
  );
  
  const totalRevenue = hostRevenue.reduce((sum, r) => sum + (r.bookingRevenue || 0), 0);
  const totalCosts = hostRevenue.reduce((sum, r) => 
    sum + (r.maintenanceCost || 0) + (r.cleaningCost || 0) + (r.subscriptionFee || 0), 0
  );
  const netRevenue = totalRevenue - totalCosts;
  
  // Calculate utilization rate
  const activeVehicles = hostVehicles.filter(v => v.status === 'available' || v.status === 'rented').length;
  const utilizationRate = hostVehicles.length > 0 
    ? (activeVehicles / hostVehicles.length) * 100 
    : 0;
  
  // Calculate average daily revenue per car
  const averageDailyRevenue = hostVehicles.length > 0 && recentReservations.length > 0
    ? totalRevenue / (hostVehicles.length * 30)
    : 0;
  
  // Calculate maintenance cost ratio
  const maintenanceCostRatio = totalRevenue > 0
    ? ((hostRevenue.reduce((sum, r) => sum + (r.maintenanceCost || 0), 0) / totalRevenue) * 100)
    : 0;
  
  return {
    totalRevenue,
    netRevenue,
    totalCosts,
    utilizationRate,
    averageDailyRevenue,
    maintenanceCostRatio,
    totalVehicles: hostVehicles.length,
    activeVehicles,
    totalReservations: hostReservations.length,
    recentReservations: recentReservations.length,
  };
};


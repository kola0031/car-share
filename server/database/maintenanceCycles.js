import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAINTENANCE_FILE = path.join(__dirname, '../data/maintenanceCycles.json');

const dataDir = path.dirname(MAINTENANCE_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(MAINTENANCE_FILE)) {
  fs.writeFileSync(MAINTENANCE_FILE, JSON.stringify([], null, 2));
}

export const getMaintenanceCycles = () => {
  try {
    const data = fs.readFileSync(MAINTENANCE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading maintenance cycles:', error);
    return [];
  }
};

export const saveMaintenanceCycles = (cycles) => {
  try {
    fs.writeFileSync(MAINTENANCE_FILE, JSON.stringify(cycles, null, 2));
  } catch (error) {
    console.error('Error saving maintenance cycles:', error);
    throw error;
  }
};

export const createMaintenanceCycle = (cycleData) => {
  const cycles = getMaintenanceCycles();
  const newCycle = {
    id: `maint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    hostId: cycleData.hostId,
    vehicleId: cycleData.vehicleId,
    reservationId: cycleData.reservationId || null,
    cycleDate: cycleData.cycleDate || new Date().toISOString(),
    inspection: {
      completed: cycleData.inspection?.completed || false,
      notes: cycleData.inspection?.notes || '',
      issues: cycleData.inspection?.issues || [],
    },
    cleaning: {
      completed: cycleData.cleaning?.completed || false,
      notes: cycleData.cleaning?.notes || '',
      cost: cycleData.cleaning?.cost || 0,
    },
    fluids: {
      checked: cycleData.fluids?.checked || false,
      oilLevel: cycleData.fluids?.oilLevel || 'good', // good, low, needs_change
      coolantLevel: cycleData.fluids?.coolantLevel || 'good',
      brakeFluid: cycleData.fluids?.brakeFluid || 'good',
    },
    tires: {
      checked: cycleData.tires?.checked || false,
      condition: cycleData.tires?.condition || 'good', // good, fair, poor
      pressure: cycleData.tires?.pressure || 'normal',
      notes: cycleData.tires?.notes || '',
    },
    reportUploaded: cycleData.reportUploaded || false,
    reportUrl: cycleData.reportUrl || null,
    performedBy: cycleData.performedBy || null, // Partner vendor or staff
    cost: cycleData.cost || 0,
    status: cycleData.status || 'pending', // pending, in_progress, completed
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...cycleData,
  };
  cycles.push(newCycle);
  saveMaintenanceCycles(cycles);
  return newCycle;
};

export const getMaintenanceCycleById = (cycleId) => {
  const cycles = getMaintenanceCycles();
  return cycles.find(c => c.id === cycleId);
};

export const getMaintenanceCyclesByVehicleId = (vehicleId) => {
  const cycles = getMaintenanceCycles();
  return cycles.filter(c => c.vehicleId === vehicleId).sort((a, b) => 
    new Date(b.cycleDate) - new Date(a.cycleDate)
  );
};

export const getMaintenanceCyclesByHostId = (hostId) => {
  const cycles = getMaintenanceCycles();
  return cycles.filter(c => c.hostId === hostId);
};

export const updateMaintenanceCycle = (cycleId, updates) => {
  const cycles = getMaintenanceCycles();
  const index = cycles.findIndex(c => c.id === cycleId);
  if (index !== -1) {
    cycles[index] = { 
      ...cycles[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    saveMaintenanceCycles(cycles);
    return cycles[index];
  }
  return null;
};

export const deleteMaintenanceCycle = (cycleId) => {
  const cycles = getMaintenanceCycles();
  const filtered = cycles.filter(c => c.id !== cycleId);
  saveMaintenanceCycles(filtered);
  return filtered.length !== cycles.length;
};


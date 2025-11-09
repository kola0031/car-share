import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TICKETS_FILE = path.join(__dirname, '../data/operationalTickets.json');

const dataDir = path.dirname(TICKETS_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(TICKETS_FILE)) {
  fs.writeFileSync(TICKETS_FILE, JSON.stringify([], null, 2));
}

export const TICKET_TYPES = {
  GUEST_CHECKOUT: 'guest_checkout',
  ACCIDENT_REPORT: 'accident_report',
  MAINTENANCE_ALERT: 'maintenance_alert',
  CLEANING_REQUEST: 'cleaning_request',
  VEHICLE_INSPECTION: 'vehicle_inspection',
  OTHER: 'other',
};

export const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  ASSIGNED: 'assigned',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const getTickets = () => {
  try {
    const data = fs.readFileSync(TICKETS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading tickets:', error);
    return [];
  }
};

export const saveTickets = (tickets) => {
  try {
    fs.writeFileSync(TICKETS_FILE, JSON.stringify(tickets, null, 2));
  } catch (error) {
    console.error('Error saving tickets:', error);
    throw error;
  }
};

export const createTicket = (ticketData) => {
  const tickets = getTickets();
  const newTicket = {
    id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    hostId: ticketData.hostId,
    vehicleId: ticketData.vehicleId || null,
    reservationId: ticketData.reservationId || null,
    type: ticketData.type || TICKET_TYPES.OTHER,
    status: ticketData.status || TICKET_STATUS.OPEN,
    priority: ticketData.priority || 'medium', // low, medium, high, urgent
    title: ticketData.title || '',
    description: ticketData.description || '',
    assignedTo: ticketData.assignedTo || null,
    dueDate: ticketData.dueDate || null,
    completedAt: ticketData.completedAt || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...ticketData,
  };
  tickets.push(newTicket);
  saveTickets(tickets);
  return newTicket;
};

export const getTicketById = (ticketId) => {
  const tickets = getTickets();
  return tickets.find(t => t.id === ticketId);
};

export const getTicketsByHostId = (hostId) => {
  const tickets = getTickets();
  return tickets.filter(t => t.hostId === hostId);
};

export const updateTicket = (ticketId, updates) => {
  const tickets = getTickets();
  const index = tickets.findIndex(t => t.id === ticketId);
  if (index !== -1) {
    if (updates.status === TICKET_STATUS.COMPLETED && !tickets[index].completedAt) {
      updates.completedAt = new Date().toISOString();
    }
    tickets[index] = { 
      ...tickets[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    saveTickets(tickets);
    return tickets[index];
  }
  return null;
};

export const deleteTicket = (ticketId) => {
  const tickets = getTickets();
  const filtered = tickets.filter(t => t.id !== ticketId);
  saveTickets(filtered);
  return filtered.length !== tickets.length;
};


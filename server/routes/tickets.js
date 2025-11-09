import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  getTickets,
  getTicketById,
  getTicketsByHostId,
  createTicket,
  updateTicket,
  deleteTicket,
  TICKET_TYPES,
  TICKET_STATUS,
} from '../database/operationalTickets.js';
import { getHostByUserId } from '../database/hosts.js';

const router = express.Router();

// Get all ticket types and statuses
router.get('/types', (req, res) => {
  try {
    res.json({
      types: TICKET_TYPES,
      statuses: TICKET_STATUS,
    });
  } catch (error) {
    console.error('Error fetching ticket types:', error);
    res.status(500).json({ message: 'Error fetching ticket types' });
  }
});

// Get all tickets for authenticated host
router.get('/', (req, res) => {
  try {
    // Get host ID from JWT token or look it up by userId
    let hostId = req.user.hostId || req.query.hostId;
    if (!hostId) {
      const host = getHostByUserId(req.user.userId);
      if (!host) {
        return res.status(404).json({ message: 'Host not found for this user' });
      }
      hostId = host.id;
    }

    const { status, type } = req.query;
    let tickets = getTicketsByHostId(hostId);

    if (status) {
      tickets = tickets.filter(t => t.status === status);
    }
    if (type) {
      tickets = tickets.filter(t => t.type === type);
    }

    res.json(tickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: 'Error fetching tickets' });
  }
});

// Get ticket by ID
router.get('/:id', (req, res) => {
  try {
    const ticket = getTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ message: 'Error fetching ticket' });
  }
});

// Create new ticket
router.post('/', [
  body('type').isIn(Object.values(TICKET_TYPES)),
  body('title').notEmpty().trim(),
  body('description').optional().trim(),
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Get host ID from JWT token or look it up by userId
    let hostId = req.user.hostId || req.body.hostId;
    if (!hostId) {
      const host = getHostByUserId(req.user.userId);
      if (!host) {
        return res.status(404).json({ message: 'Host not found for this user' });
      }
      hostId = host.id;
    }

    const ticket = createTicket({
      ...req.body,
      hostId: hostId,
    });
    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ message: 'Error creating ticket' });
  }
});

// Update ticket
router.put('/:id', [
  body('status').optional().isIn(Object.values(TICKET_STATUS)),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const ticket = updateTicket(req.params.id, req.body);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ message: 'Error updating ticket' });
  }
});

// Delete ticket
router.delete('/:id', (req, res) => {
  try {
    const deleted = deleteTicket(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ message: 'Error deleting ticket' });
  }
});

export default router;


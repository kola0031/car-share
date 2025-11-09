import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  getLeadsByType,
} from '../database/leads.js';

const router = express.Router();

// Get all leads (admin only - add admin check if needed)
router.get('/', (req, res) => {
  try {
    const { type, status } = req.query;
    let leads = getLeads();
    
    if (type) {
      leads = leads.filter(l => l.type === type);
    }
    if (status) {
      leads = leads.filter(l => l.status === status);
    }
    
    res.json(leads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ message: 'Error fetching leads' });
  }
});

// Get lead by ID
router.get('/:id', (req, res) => {
  try {
    const lead = getLeadById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json(lead);
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({ message: 'Error fetching lead' });
  }
});

// Create new lead (public endpoint for lead capture)
router.post('/', [
  body('email').isEmail().normalizeEmail(),
  body('name').optional().trim(),
  body('type').optional().isIn(['host', 'driver']),
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const lead = createLead({
      ...req.body,
      source: req.body.source || 'website',
    });
    res.status(201).json(lead);
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ message: 'Error creating lead' });
  }
});

// Update lead
router.put('/:id', (req, res) => {
  try {
    const lead = updateLead(req.params.id, req.body);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json(lead);
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ message: 'Error updating lead' });
  }
});

// Delete lead
router.delete('/:id', (req, res) => {
  try {
    const deleted = deleteLead(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({ message: 'Error deleting lead' });
  }
});

export default router;


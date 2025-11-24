import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  getVehicles,
  getVehiclesByHostId,
  createVehicle,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  addVehicleDocument,
  addVehicleImage,
} from '../database/vehicles.js';
import { saveBase64File } from '../services/storage.js';

const router = express.Router();

// Get all vehicles for user/host
router.get('/', async (req, res) => {
  try {
    const hostId = req.user.hostId;
    if (!hostId) {
      return res.status(400).json({ message: 'Host ID not found' });
    }
    const vehicles = await getVehiclesByHostId(hostId);
    res.json(vehicles);
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ message: 'Error fetching vehicles' });
  }
});

// Get single vehicle
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await getVehicleById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    if (vehicle.hostId !== req.user.hostId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(vehicle);
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({ message: 'Error fetching vehicle' });
  }
});

// VIN validation helper
const validateVIN = (vin) => {
  // Basic VIN validation (17 characters, alphanumeric, no I, O, Q)
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
  return vinRegex.test(vin);
};

// Create vehicle
router.post('/', [
  body('make').trim().notEmpty(),
  body('model').trim().notEmpty(),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
  body('dailyRate').isFloat({ min: 0 }),
  body('vin').optional().custom((value) => {
    if (value && !validateVIN(value)) {
      throw new Error('Invalid VIN format');
    }
    return true;
  }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newVehicle = await createVehicle({
      ...req.body,
      hostId: req.user.hostId,
      status: req.body.status || 'available',
    });

    res.status(201).json(newVehicle);
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({ message: 'Error creating vehicle' });
  }
});

// Update vehicle
router.put('/:id', async (req, res) => {
  try {
    const vehicle = await getVehicleById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    if (vehicle.hostId !== req.user.hostId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updated = await updateVehicle(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({ message: 'Error updating vehicle' });
  }
});

// Delete vehicle
router.delete('/:id', async (req, res) => {
  try {
    const vehicle = await getVehicleById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    if (vehicle.hostId !== req.user.hostId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await deleteVehicle(req.params.id);
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ message: 'Error deleting vehicle' });
  }
});

// Upload vehicle document (insurance, registration, etc.)
router.post('/:id/documents', [
  body('documentType').isIn(['insurance', 'registration', 'inspection', 'other']).withMessage('Invalid document type'),
  body('documentData').notEmpty().withMessage('Document data is required'),
  body('filename').notEmpty().withMessage('Filename is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const vehicle = getVehicleById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    if (vehicle.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { documentType, documentData, filename } = req.body;

    // Save document
    const savedFile = await saveBase64File(documentData, filename, `vehicles/${vehicle.id}/documents`);

    // Update vehicle with document info
    const documents = vehicle.documents || [];
    documents.push({
      type: documentType,
      filename,
      url: savedFile.url,
      path: savedFile.path,
      uploadedAt: new Date().toISOString(),
    });

    const updated = updateVehicle(req.params.id, { documents });

    res.json({
      message: 'Document uploaded successfully',
      document: documents[documents.length - 1],
      vehicle: updated,
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ message: 'Error uploading document' });
  }
});

// Upload vehicle images
router.post('/:id/images', [
  body('imageData').notEmpty().withMessage('Image data is required'),
  body('filename').notEmpty().withMessage('Filename is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const vehicle = getVehicleById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    if (vehicle.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { imageData, filename } = req.body;

    // Save image
    const savedFile = await saveBase64File(imageData, filename, `vehicles/${vehicle.id}/images`);

    // Update vehicle with image info
    const images = vehicle.images || [];
    images.push({
      filename,
      url: savedFile.url,
      path: savedFile.path,
      uploadedAt: new Date().toISOString(),
    });

    const updated = updateVehicle(req.params.id, { images });

    res.json({
      message: 'Image uploaded successfully',
      image: images[images.length - 1],
      vehicle: updated,
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ message: 'Error uploading image' });
  }
});

export default router;


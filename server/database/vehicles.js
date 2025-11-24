import Vehicle from '../models/Vehicle.js';

export const getVehicles = async () => {
  try {
    return await Vehicle.find();
  } catch (error) {
    console.error('Error reading vehicles:', error);
    return [];
  }
};

export const createVehicle = async (vehicleData) => {
  try {
    const newVehicle = new Vehicle({
      ...vehicleData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await newVehicle.save();
    return newVehicle;
  } catch (error) {
    console.error('Error creating vehicle:', error);
    throw error;
  }
};

export const getVehicleById = async (vehicleId) => {
  try {
    return await Vehicle.findById(vehicleId);
  } catch (error) {
    console.error('Error finding vehicle by ID:', error);
    return null;
  }
};

export const getVehiclesByHostId = async (hostId) => {
  try {
    return await Vehicle.find({ hostId });
  } catch (error) {
    console.error('Error finding vehicles by host ID:', error);
    return [];
  }
};

export const updateVehicle = async (vehicleId, updates) => {
  try {
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      vehicleId,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    return updatedVehicle;
  } catch (error) {
    console.error('Error updating vehicle:', error);
    throw error;
  }
};

export const deleteVehicle = async (vehicleId) => {
  try {
    await Vehicle.findByIdAndDelete(vehicleId);
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    throw error;
  }
};

export const addVehicleDocument = async (vehicleId, documentData) => {
  try {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    vehicle.documents.push({
      ...documentData,
      uploadedAt: new Date(),
    });

    await vehicle.save();
    return vehicle;
  } catch (error) {
    console.error('Error adding vehicle document:', error);
    throw error;
  }
};

export const addVehicleImage = async (vehicleId, imageData) => {
  try {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    vehicle.images.push({
      ...imageData,
      uploadedAt: new Date(),
    });

    await vehicle.save();
    return vehicle;
  } catch (error) {
    console.error('Error adding vehicle image:', error);
    throw error;
  }
};

import Fleet from '../models/Fleet.js';

export const getFleets = async () => {
  try {
    return await Fleet.find();
  } catch (error) {
    console.error('Error reading fleets:', error);
    return [];
  }
};

export const createFleet = async (fleetData) => {
  try {
    const newFleet = new Fleet({
      ...fleetData,
      vehicleIds: fleetData.vehicleIds || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await newFleet.save();
    return newFleet;
  } catch (error) {
    console.error('Error creating fleet:', error);
    throw error;
  }
};

export const getFleetById = async (fleetId) => {
  try {
    return await Fleet.findById(fleetId);
  } catch (error) {
    console.error('Error finding fleet by ID:', error);
    return null;
  }
};

export const getFleetsByHostId = async (hostId) => {
  try {
    return await Fleet.find({ hostId });
  } catch (error) {
    console.error('Error finding fleets by host ID:', error);
    return [];
  }
};

export const updateFleet = async (fleetId, updates) => {
  try {
    const updatedFleet = await Fleet.findByIdAndUpdate(
      fleetId,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    return updatedFleet;
  } catch (error) {
    console.error('Error updating fleet:', error);
    throw error;
  }
};

export const deleteFleet = async (fleetId) => {
  try {
    await Fleet.findByIdAndDelete(fleetId);
    return true;
  } catch (error) {
    console.error('Error deleting fleet:', error);
    throw error;
  }
};

export const addVehicleToFleet = async (fleetId, vehicleId) => {
  try {
    const fleet = await Fleet.findById(fleetId);
    if (!fleet) {
      throw new Error('Fleet not found');
    }

    if (!fleet.vehicleIds.includes(vehicleId)) {
      fleet.vehicleIds.push(vehicleId);
      await fleet.save();
    }

    return fleet;
  } catch (error) {
    console.error('Error adding vehicle to fleet:', error);
    throw error;
  }
};

export const removeVehicleFromFleet = async (fleetId, vehicleId) => {
  try {
    const fleet = await Fleet.findById(fleetId);
    if (!fleet) {
      throw new Error('Fleet not found');
    }

    fleet.vehicleIds = fleet.vehicleIds.filter(id => id !== vehicleId);
    await fleet.save();

    return fleet;
  } catch (error) {
    console.error('Error removing vehicle from fleet:', error);
    throw error;
  }
};

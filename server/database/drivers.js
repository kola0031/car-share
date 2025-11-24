import Driver from '../models/Driver.js';

export const getDrivers = async () => {
  try {
    return await Driver.find();
  } catch (error) {
    console.error('Error reading drivers:', error);
    return [];
  }
};

export const createDriver = async (driverData) => {
  try {
    const newDriver = new Driver({
      ...driverData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await newDriver.save();
    return newDriver;
  } catch (error) {
    console.error('Error creating driver:', error);
    throw error;
  }
};

export const getDriverById = async (driverId) => {
  try {
    return await Driver.findById(driverId);
  } catch (error) {
    console.error('Error finding driver by ID:', error);
    return null;
  }
};

export const getDriverByUserId = async (userId) => {
  try {
    return await Driver.findOne({ userId });
  } catch (error) {
    console.error('Error finding driver by user ID:', error);
    return null;
  }
};

export const updateDriver = async (driverId, updates) => {
  try {
    const updatedDriver = await Driver.findByIdAndUpdate(
      driverId,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    return updatedDriver;
  } catch (error) {
    console.error('Error updating driver:', error);
    throw error;
  }
};

export const deleteDriver = async (driverId) => {
  try {
    await Driver.findByIdAndDelete(driverId);
  } catch (error) {
    console.error('Error deleting driver:', error);
    throw error;
  }
};

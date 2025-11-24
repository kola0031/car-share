import Host from '../models/Host.js';

export const getHosts = async () => {
  try {
    return await Host.find();
  } catch (error) {
    console.error('Error reading hosts:', error);
    return [];
  }
};

export const createHost = async (hostData) => {
  try {
    const newHost = new Host({
      ...hostData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await newHost.save();
    return newHost;
  } catch (error) {
    console.error('Error creating host:', error);
    throw error;
  }
};

export const getHostById = async (hostId) => {
  try {
    return await Host.findById(hostId);
  } catch (error) {
    console.error('Error finding host by ID:', error);
    return null;
  }
};

export const getHostByUserId = async (userId) => {
  try {
    return await Host.findOne({ userId });
  } catch (error) {
    console.error('Error finding host by user ID:', error);
    return null;
  }
};

export const updateHost = async (hostId, updates) => {
  try {
    const updatedHost = await Host.findByIdAndUpdate(
      hostId,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    return updatedHost;
  } catch (error) {
    console.error('Error updating host:', error);
    throw error;
  }
};

export const deleteHost = async (hostId) => {
  try {
    await Host.findByIdAndDelete(hostId);
  } catch (error) {
    console.error('Error deleting host:', error);
    throw error;
  }
};

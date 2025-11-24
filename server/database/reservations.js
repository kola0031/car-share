import Reservation from '../models/Reservation.js';

export const getReservations = async () => {
  try {
    return await Reservation.find();
  } catch (error) {
    console.error('Error reading reservations:', error);
    return [];
  }
};

export const createReservation = async (reservationData) => {
  try {
    const newReservation = new Reservation({
      ...reservationData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await newReservation.save();
    return newReservation;
  } catch (error) {
    console.error('Error creating reservation:', error);
    throw error;
  }
};

export const getReservationById = async (reservationId) => {
  try {
    return await Reservation.findById(reservationId);
  } catch (error) {
    console.error('Error finding reservation by ID:', error);
    return null;
  }
};

export const getReservationsByHostId = async (hostId) => {
  try {
    return await Reservation.find({ hostId }).sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error finding reservations by host ID:', error);
    return [];
  }
};

export const getReservationsByDriverId = async (driverId) => {
  try {
    return await Reservation.find({ driverId }).sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error finding reservations by driver ID:', error);
    return [];
  }
};

export const getReservationsByVehicleId = async (vehicleId) => {
  try {
    return await Reservation.find({ vehicleId }).sort({ startDate: 1 });
  } catch (error) {
    console.error('Error finding reservations by vehicle ID:', error);
    return [];
  }
};

export const updateReservation = async (reservationId, updates) => {
  try {
    const updatedReservation = await Reservation.findByIdAndUpdate(
      reservationId,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    return updatedReservation;
  } catch (error) {
    console.error('Error updating reservation:', error);
    throw error;
  }
};

export const deleteReservation = async (reservationId) => {
  try {
    await Reservation.findByIdAndDelete(reservationId);
  } catch (error) {
    console.error('Error deleting reservation:', error);
    throw error;
  }
};

export const getActiveReservations = async () => {
  try {
    return await Reservation.find({
      status: { $in: ['confirmed', 'active'] }
    }).sort({ startDate: 1 });
  } catch (error) {
    console.error('Error finding active reservations:', error);
    return [];
  }
};

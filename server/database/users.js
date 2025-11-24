import User from '../models/User.js';

export const getUsers = async () => {
  try {
    return await User.find();
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
};

export const createUser = async (userData) => {
  try {
    const newUser = new User({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await newUser.save();
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    return await User.findOne({ _id: userId });
  } catch (error) {
    console.error('Error finding user by ID:', error);
    return null;
  }
};

export const getUserByEmail = async (email) => {
  try {
    return await User.findOne({ email: email.toLowerCase() });
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
};

export const getUserByVerificationToken = async (token) => {
  try {
    return await User.findOne({ verificationToken: token });
  } catch (error) {
    console.error('Error finding user by verification token:', error);
    return null;
  }
};

export const updateUser = async (userId, updates) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    await User.findByIdAndDelete(userId);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

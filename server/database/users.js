import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERS_FILE = path.join(__dirname, '../data/users.json');

// Ensure data directory exists
const dataDir = path.dirname(USERS_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize users file if it doesn't exist
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
}

export const getUsers = () => {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
};

export const saveUsers = (users) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving users:', error);
    throw error;
  }
};

export const createUser = (userData) => {
  const users = getUsers();
  const newUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...userData,
  };
  return newUser;
};

export const getUserById = (userId) => {
  const users = getUsers();
  return users.find(u => u.id === userId);
};

export const updateUser = (userId, updates) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    saveUsers(users);
    return users[index];
  }
  return null;
};

export const getUserByEmail = (email) => {
  const users = getUsers();
  return users.find(u => u.email === email);
};

export const getUserByVerificationToken = (token) => {
  const users = getUsers();
  return users.find(u => u.verificationToken === token);
};


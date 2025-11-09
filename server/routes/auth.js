import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { getUsers, saveUsers, createUser } from '../database/users.js';
import { createHost, getHostByUserId } from '../database/hosts.js';
import { createSubscription } from '../database/subscriptions.js';
import { createDriver, getDriverByUserId } from '../database/drivers.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Register (Host or Driver)
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty(),
  body('companyName').optional().trim(),
  body('role').optional().isIn(['host', 'driver']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, companyName, role = 'host' } = req.body;

    const users = getUsers();
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = createUser({
      email,
      password: hashedPassword,
      name,
      companyName: companyName || '',
      role: role,
      createdAt: new Date().toISOString(),
    });

    users.push(newUser);
    saveUsers(users);

    let hostId = null;
    let driverId = null;

    if (role === 'host') {
      // Create host profile
      const host = createHost({
        userId: newUser.id,
        companyName: companyName || name + "'s Fleet",
        serviceTier: 'Basic',
        subscriptionStatus: 'active',
        monthlySubscriptionFee: 299,
        onboardingStatus: 'pending',
      });
      hostId = host.id;

      // Create subscription
      const subscription = createSubscription({
        hostId: host.id,
        serviceTier: 'Basic',
        status: 'active',
      });
    } else if (role === 'driver') {
      // Create driver profile
      const driver = createDriver({
        userId: newUser.id,
        email: newUser.email,
        name: newUser.name,
        verificationStatus: 'pending',
      });
      driverId = driver.id;
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role, hostId, driverId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        companyName: newUser.companyName,
        role: newUser.role,
        hostId,
        driverId,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const users = getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Get host or driver information
    let hostId = null;
    let driverId = null;
    
    if (user.role === 'host') {
      const host = getHostByUserId(user.id);
      hostId = host ? host.id : null;
    } else if (user.role === 'driver') {
      const driver = getDriverByUserId(user.id);
      driverId = driver ? driver.id : null;
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, hostId, driverId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        companyName: user.companyName,
        role: user.role,
        hostId,
        driverId,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid token' });
      }

      const users = getUsers();
      const user = users.find(u => u.id === decoded.userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get host or driver information
      let hostId = null;
      let driverId = null;
      
      if (user.role === 'host') {
        const host = getHostByUserId(user.id);
        hostId = host ? host.id : null;
      } else if (user.role === 'driver') {
        const driver = getDriverByUserId(user.id);
        driverId = driver ? driver.id : null;
      }

      res.json({
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          companyName: user.companyName,
          role: user.role,
          hostId,
          driverId,
        },
      });
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;


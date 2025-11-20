import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { getUsers, saveUsers, createUser, getUserByVerificationToken, updateUser } from '../database/users.js';
import { createHost, getHostByUserId } from '../database/hosts.js';
import { createSubscription } from '../database/subscriptions.js';
import { createDriver, getDriverByUserId } from '../database/drivers.js';
import { sendVerificationEmail, sendWelcomeEmail } from '../services/email.js';

const router = express.Router();

// Helper to get JWT secret
const getJwtSecret = () => process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Log JWT_SECRET on startup (delayed to ensure env is loaded)
setTimeout(() => {
  const secret = getJwtSecret();
  console.log('Auth routes initialized with JWT_SECRET:', secret ? `${secret.substring(0, 10)}...` : 'undefined');
}, 1000);

// Validation Middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  next();
};

const registerValidation = [
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('companyName').optional().trim(),
  body('role').optional().isIn(['host', 'driver']).withMessage('Invalid role'),
  validate
];

const loginValidation = [
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

// Register (Host or Driver)
router.post('/register', registerValidation, async (req, res) => {
  try {
    console.log('Registration request received:', {
      body: { ...req.body, password: '***' },
      headers: req.headers['content-type']
    });

    const { email, password, name, companyName, role = 'host' } = req.body;

    const users = getUsers();

    // Check if user already exists
    if (users.find(u => u.email === email)) {
      return res.status(409).json({ message: 'User with this email already exists' });
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
      createSubscription({
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
    console.log('Signing registration token');
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role, hostId, driverId },
      getJwtSecret(),
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
router.post('/login', loginValidation, async (req, res) => {
  try {
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
    console.log('Signing login token');
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, hostId, driverId },
      getJwtSecret(),
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

    jwt.verify(token, getJwtSecret(), async (err, decoded) => {
      if (err) {
        console.error('JWT verification failed:', err.message);
        return res.status(403).json({
          message: 'Invalid or expired token',
          error: err.name
        });
      }

      const users = getUsers();
      const user = users.find(u => u.id === decoded.userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Always fetch fresh host or driver information from database
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

// Verify email
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const user = getUserByVerificationToken(token);

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    if (user.emailVerified) {
      return res.status(200).json({ message: 'Email already verified' });
    }

    // Update user as verified
    const updatedUser = updateUser(user.id, {
      emailVerified: true,
      verificationToken: null,
    });

    res.json({
      message: 'Email verified successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        emailVerified: updatedUser.emailVerified,
      }
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
});

// Resend verification email
router.post('/resend-verification', [
  body('email').isEmail().normalizeEmail(),
  validate
], async (req, res) => {
  try {
    const { email } = req.body;

    const users = getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      // Don't reveal if user exists or not
      return res.json({ message: 'If the email exists, a verification link has been sent' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.name, user.verificationToken);
      res.json({ message: 'Verification email sent' });
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      res.status(500).json({ message: 'Failed to send verification email' });
    }
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;


import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import { createUser, getUserByEmail, getUserById, getUserByVerificationToken, updateUser } from '../database/users.js';
import { createHost, getHostByUserId } from '../database/hosts.js';
import { createSubscription } from '../database/subscriptions.js';
import { createDriver, getDriverByUserId } from '../database/drivers.js';
import { sendVerificationEmail } from '../services/email.js';

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

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await createUser({
      email,
      password: hashedPassword,
      name,
      role: role,
      emailVerified: false,
      verificationToken: crypto.randomBytes(32).toString('hex'),
    });

    let hostId = null;
    let driverId = null;

    if (role === 'host') {
      // Create host profile
      const host = await createHost({
        userId: newUser._id.toString(),
        companyName: companyName || name + "'s Fleet",
        serviceTier: 'none',
        subscriptionStatus: 'pending',
        monthlySubscriptionFee: 0,
        onboardingStatus: 'pending',
      });
      hostId = host._id.toString();

      // Update user with hostId
      await updateUser(newUser._id, { hostId });
    } else if (role === 'driver') {
      // Create driver profile
      const driver = await createDriver({
        userId: newUser._id.toString(),
        verificationStatus: 'pending',
      });
      driverId = driver._id.toString();

      // Update user with driverId
      await updateUser(newUser._id, { driverId });
    }

    // Send verification email
    try {
      await sendVerificationEmail(newUser.email, newUser.verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue with registration even if email fails
    }

    // Generate JWT
    console.log('Signing registration token');
    const token = jwt.sign(
      {
        userId: newUser._id.toString(),
        email: newUser.email,
        role: newUser.role,
        hostId,
        driverId
      },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id.toString(),
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        hostId,
        driverId,
        emailVerified: newUser.emailVerified,
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

    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Get host or driver information
    let hostId = user.hostId || null;
    let driverId = user.driverId || null;

    if (user.role === 'host' && !hostId) {
      const host = await getHostByUserId(user._id.toString());
      hostId = host ? host._id.toString() : null;
    } else if (user.role === 'driver' && !driverId) {
      const driver = await getDriverByUserId(user._id.toString());
      driverId = driver ? driver._id.toString() : null;
    }

    // Generate JWT
    console.log('Signing login token');
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        hostId,
        driverId
      },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        hostId,
        driverId,
        emailVerified: user.emailVerified,
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

      const user = await getUserById(decoded.userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Always fetch fresh host or driver information from database
      let hostId = user.hostId || null;
      let driverId = user.driverId || null;

      if (user.role === 'host' && !hostId) {
        const host = await getHostByUserId(user._id.toString());
        hostId = host ? host._id.toString() : null;
      } else if (user.role === 'driver' && !driverId) {
        const driver = await getDriverByUserId(user._id.toString());
        driverId = driver ? driver._id.toString() : null;
      }

      res.json({
        valid: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          hostId,
          driverId,
          emailVerified: user.emailVerified,
        },
      });
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
});

// Verify email
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const user = await getUserByVerificationToken(token);

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    if (user.emailVerified) {
      return res.status(200).json({ message: 'Email already verified' });
    }

    // Update user as verified
    const updatedUser = await updateUser(user._id, {
      emailVerified: true,
      verificationToken: null,
    });

    res.json({
      message: 'Email verified successfully',
      user: {
        id: updatedUser._id.toString(),
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

    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(200).json({ message: 'Email already verified' });
    }

    // Generate new verification token if needed
    if (!user.verificationToken) {
      const newToken = crypto.randomBytes(32).toString('hex');
      await updateUser(user._id, { verificationToken: newToken });
      user.verificationToken = newToken;
    }

    // Send verification email
    await sendVerificationEmail(user.email, user.verificationToken);

    res.json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error while resending verification' });
  }
});

export default router;

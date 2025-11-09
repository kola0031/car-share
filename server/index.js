import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import reservationsRoutes from './routes/reservations.js';
import vehiclesRoutes from './routes/vehicles.js';
import hostsRoutes from './routes/hosts.js';
import fleetsRoutes from './routes/fleets.js';
import subscriptionsRoutes from './routes/subscriptions.js';
import performanceRoutes from './routes/performance.js';
import ticketsRoutes from './routes/tickets.js';
import leadsRoutes from './routes/leads.js';
import bookingsRoutes from './routes/bookings.js';
import tripsRoutes from './routes/trips.js';
import driversRoutes from './routes/drivers.js';
import { authenticateToken } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/reservations', authenticateToken, reservationsRoutes);
app.use('/api/vehicles', authenticateToken, vehiclesRoutes);
app.use('/api/hosts', authenticateToken, hostsRoutes);
app.use('/api/fleets', authenticateToken, fleetsRoutes);
app.use('/api/subscriptions', authenticateToken, subscriptionsRoutes);
app.use('/api/performance', authenticateToken, performanceRoutes);
app.use('/api/tickets', authenticateToken, ticketsRoutes);
app.use('/api/leads', leadsRoutes); // Public endpoint for lead capture
app.use('/api/bookings', bookingsRoutes); // Mixed: some public, some protected
app.use('/api/trips', authenticateToken, tripsRoutes);
app.use('/api/drivers', authenticateToken, driversRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'HostPilot API Server',
    version: '1.0.0',
      endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      reservations: '/api/reservations',
      vehicles: '/api/vehicles',
      hosts: '/api/hosts',
      fleets: '/api/fleets',
      subscriptions: '/api/subscriptions',
      performance: '/api/performance',
      tickets: '/api/tickets',
      leads: '/api/leads',
      bookings: '/api/bookings',
      trips: '/api/trips',
      drivers: '/api/drivers'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});


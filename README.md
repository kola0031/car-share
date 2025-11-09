# HostPilot

A modern React-based website for HostPilot - Atlanta's leading tech-driven vehicle management platform. Full-service fleet management for vehicle hosts to earn passive income.

## Business Model

HostPilot is a complete fleet management platform that:
- **Manages everything** - listings, bookings, maintenance, and guest support
- **VEVS Integration** - hosts access virtual listings via VEVS-powered portals
- **PackMyShare Partnership** - secure vehicle storage and pickup/drop-off logistics
- **Multi-platform booking** - manages bookings across Turo, Booking.com, and direct channels
- **Revenue sharing** - transparent revenue distribution between HostPilot and hosts

### Pricing
- **Subscription**: $150/month per host (includes VEVS access + PackMyShare parking)
- **One-time Setup**: €580 (system setup + onboarding)
- **Optional Add-ons**: Maintenance and cleaning services

## Features

- **Responsive Design** - Works seamlessly on mobile, tablet, and desktop
- **Modern UI** - Beautiful gradients, smooth animations, and intuitive navigation
- **Interactive Components**:
  - Hero section with compelling CTAs
  - Features showcase (VEVS portal, PackMyShare integration, booking management)
  - Pricing tiers (Subscription, One-time Setup, Optional Add-ons)
  - Testimonials section
  - FAQ accordion
  - Newsletter signup
- **User Authentication** - Login, register, and protected dashboard
- **Backend API** - Full REST API with Express.js backend
- **Fleet Management** - Vehicle and reservation management system

## Tech Stack

### Frontend
- React 18.2
- Vite 5.0
- React Router 6.26
- CSS3 (with modern features like gradients and animations)
- Modern dark theme with glassmorphism effects

### Backend
- Node.js
- Express.js
- JWT Authentication
- Bcrypt for password hashing
- JSON file-based database (can be upgraded to MongoDB)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

1. Clone the repository:
```bash
git clone git@github.com:kola0031/car-share.git
cd car-share
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000/api
```

Create a `server/.env` file:
```env
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

4. Start the development servers:

**Option 1: Run both frontend and backend together**
```bash
npm run dev:all
```

**Option 2: Run separately**
```bash
# Terminal 1 - Backend server
npm run dev:server

# Terminal 2 - Frontend
npm run dev
```

5. Open your browser and visit:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-reservations` - Get recent reservations

### Reservations
- `GET /api/reservations` - Get all reservations
- `GET /api/reservations/:id` - Get single reservation
- `POST /api/reservations` - Create reservation
- `PUT /api/reservations/:id` - Update reservation
- `DELETE /api/reservations/:id` - Delete reservation

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/:id` - Get single vehicle
- `POST /api/vehicles` - Create vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

## Project Structure

```
src/
├── components/       # React components
│   ├── Navbar.jsx   # Navigation bar
│   ├── Hero.jsx     # Hero section
│   ├── Features.jsx # Features grid
│   ├── Pricing.jsx  # Pricing tiers
│   ├── FAQ.jsx      # FAQ accordion
│   ├── Footer.jsx   # Footer with links
│   ├── Login.jsx    # Login component
│   ├── Register.jsx # Register component
│   └── ProtectedRoute.jsx # Route protection
├── routes/          # Page routes
│   ├── Dashboard.jsx # Dashboard page
│   └── ...
├── context/         # React Context
│   └── AuthContext.jsx # Authentication context
├── utils/           # Utilities
│   └── api.js       # API helper functions
├── App.jsx          # Main app component
└── main.jsx         # Entry point

server/
├── routes/          # API routes
│   ├── auth.js     # Authentication routes
│   ├── dashboard.js # Dashboard routes
│   ├── reservations.js # Reservation routes
│   └── vehicles.js # Vehicle routes
├── database/        # Database helpers
│   ├── users.js    # User data management
│   ├── vehicles.js # Vehicle data management
│   └── reservations.js # Reservation data management
├── middleware/      # Express middleware
│   └── auth.js     # JWT authentication middleware
└── index.js        # Server entry point
```

## Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## License

This project is for HostPilot - Atlanta's leading tech-driven vehicle management platform.

# HostPilot 🚀

**Atlanta's Leading Tech-Driven Vehicle Management Platform**

A complete fleet management SaaS platform that enables vehicle hosts to earn passive income while we handle everything - from listings and bookings to maintenance and guest support.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-proprietary-red)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)

---

## 🌟 What is HostPilot?

HostPilot is a full-service fleet management platform that:
- **Manages Everything** - Listings, bookings, maintenance, and guest support
- **Multi-Platform Booking** - Integrates with Turo, Booking.com, and direct channels
- **PackMyShare Partnership** - Secure vehicle storage and pickup/drop-off logistics
- **Revenue Sharing** - Transparent distribution between HostPilot and hosts
- **Automated Maintenance** - Partner auto-shops update service logs in real-time

---

## ✨ Features

### 🎯 Stage 1: Enhanced Onboarding (✅ Complete)
- **Multi-Step Wizard** - Streamlined onboarding flow (Company → Vehicle → Documents → Payment)
- **Email Verification** - Secure account verification via email
- **Payment Processing** - Stripe integration with subscription management
- **VIN Validation** - Automatic vehicle identification validation
- **Document Uploads** - Insurance, registration, and inspection documents
- **File Storage** - Secure document and image storage system

### 🚗 Core Platform Features
- **User Authentication** - JWT-based secure authentication
- **Role-Based Access** - Separate interfaces for hosts and drivers
- **Fleet Management** - Vehicle and reservation management
- **Real-time Dashboard** - Live stats and analytics
- **Responsive Design** - Mobile, tablet, and desktop optimized
- **Modern UI** - Glassmorphism, gradients, smooth animations

### 🎨 Premium Design
- Dark theme with vibrant gradients
- Smooth micro-animations
- Accessible UI components
- Professional typography

---

## 🛠️ Tech Stack

### Frontend
- **React 18.2** - Modern UI library
- **Vite 5.0** - Lightning-fast build tool
- **React Router 6.26** - Client-side routing
- **Stripe Elements** - Payment UI components
- **CSS3** - Custom styling with modern features

### Backend
- **Node.js 18+** - JavaScript runtime
- **Express 5.1** - Web framework
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Stripe** - Payment processing
- **Nodemailer** - Email notifications
- **Express Validator** - Input validation

### Development
- **Vite** - Development server
- **Nodemon** - Auto-restart server
- **Concurrently** - Run multiple scripts
- **ESLint** - Code linting

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **Git**

### Installation

1. **Clone the repository**
```bash
git clone git@github.com:kola0031/car-share.git
cd car-share
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**

Create `.env` in the project root:
```env
# Stripe Public Key (Frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

Create `server/.env`:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Secret (MUST CHANGE IN PRODUCTION)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_BASIC_PRICE_ID=price_basic_id
STRIPE_PRO_PRICE_ID=price_pro_id
STRIPE_ENTERPRISE_PRICE_ID=price_enterprise_id

# Email Configuration (Optional - uses console in dev)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
SMTP_FROM=HostPilot <noreply@hostpilot.com>

# Frontend URL
FRONTEND_URL=http://localhost:5175
```

4. **Start Development Servers**

Run both frontend and backend:
```bash
npm run dev:all
```

Or run separately:
```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev
```

5. **Access the Application**
- **Frontend**: http://localhost:5173 (or next available port)
- **Backend API**: http://localhost:3001

---

## 📁 Project Structure

```
Car-share/
├── src/                          # Frontend source
│   ├── components/              # React components
│   │   ├── Navbar.jsx          # Navigation bar
│   │   ├── Hero.jsx            # Hero section
│   │   ├── Features.jsx        # Features grid
│   │   ├── Pricing.jsx         # Pricing tiers
│   │   ├── FAQ.jsx             # FAQ accordion
│   │   ├── Footer.jsx          # Footer
│   │   ├── Login.jsx           # Login form
│   │   ├── Register.jsx        # Registration form
│   │   ├── VehicleForm.jsx     # Vehicle input form
│   │   ├── DocumentUpload.jsx  # File upload
│   │   ├── PaymentForm.jsx     # Stripe payment
│   │   └── ProtectedRoute.jsx  # Route protection
│   ├── routes/                 # Page routes
│   │   ├── Dashboard.jsx       # Host dashboard
│   │   ├── Onboarding.jsx      # Multi-step wizard
│   │   ├── Bookings.jsx        # Booking management
│   │   └── DriverTrips.jsx     # Driver trips
│   ├── context/                # React Context
│   │   └── AuthContext.jsx     # Auth state
│   ├── utils/                  # Utilities
│   │   └── api.js              # API helpers
│   ├── App.jsx                 # Main app
│   └── main.jsx                # Entry point
│
├── server/                      # Backend source
│   ├── routes/                 # API routes
│   │   ├── auth.js            # Authentication
│   │   ├── payments.js        # Payment processing
│   │   ├── vehicles.js        # Vehicle management
│   │   ├── hosts.js           # Host management
│   │   └── ...                # Other routes
│   ├── services/              # Business logic
│   │   ├── email.js          # Email service
│   │   ├── payment.js        # Stripe service
│   │   └── storage.js        # File storage
│   ├── database/              # Data layer
│   │   ├── users.js          # User data
│   │   ├── vehicles.js       # Vehicle data
│   │   └── ...               # Other data
│   ├── middleware/            # Express middleware
│   │   └── auth.js           # JWT verification
│   ├── uploads/              # File storage
│   └── index.js              # Server entry
│
└── docs/                      # Documentation
    └── DEPENDENCIES.md        # Dependency guide
```

---

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/auth/verify-email/:token` - Verify email address
- `POST /api/auth/resend-verification` - Resend verification email

### Payments
- `GET /api/payments/tiers` - Get subscription tiers
- `POST /api/payments/create-customer` - Create Stripe customer
- `POST /api/payments/create-subscription` - Subscribe to plan
- `POST /api/payments/webhook` - Stripe webhook handler

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `POST /api/vehicles` - Create vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `POST /api/vehicles/:id/documents` - Upload document
- `POST /api/vehicles/:id/images` - Upload image

### Hosts
- `GET /api/hosts/:id` - Get host details
- `PUT /api/hosts/:id` - Update host
- `GET /api/hosts/:id/dashboard` - Get dashboard data

---

## 💳 Pricing & Business Model

### Subscription Tiers

#### Basic - $299/month
- Up to 5 vehicles
- Basic analytics
- Email support
- ParkMyShare integration

#### Pro - $499/month
- Up to 20 vehicles
- Advanced analytics
- Priority support
- AI pricing optimization
- Custom branding

#### Enterprise - $999/month
- Unlimited vehicles
- Real-time analytics
- 24/7 phone support
- AI pricing + automation
- White-label solution
- Dedicated account manager

---

## 🧪 Testing

### Test Credit Cards (Stripe)
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future expiry date and CVC

### Test Accounts
Register new accounts through the UI or use the seed script:
```bash
npm run seed:user
```

---

## 📦 Build for Production

```bash
# Build frontend
npm run build

# Start production server
npm start
```

Build artifacts in `dist/` directory.

---

## 🔒 Security Notes

- **JWT Secret**: MUST be changed in production
- **Stripe Keys**: Use production keys for live deployment
- **HTTPS**: Required for production deployment
- **Environment Variables**: Never commit `.env` files
- **Password Hashing**: Using bcrypt with salt rounds

---

## 🤝 Contributing

This is a proprietary project for HostPilot. For questions or collaboration:
- **Email**: info@hostpilot.com
- **Location**: Atlanta, GA

---

## 📄 License

Proprietary - © 2024 HostPilot. All rights reserved.

---

## 🆘 Troubleshooting

### Port Already in Use
If ports 3001 or 5173 are in use, Vite will automatically try the next available port.

### JWT Token Issues
- Clear localStorage in browser DevTools
- Check JWT_SECRET matches in server/.env
- Verify token hasn't expired (7 days default)

### Payment Processing
- Ensure Stripe keys are configured
- Check webhook secret is correct
- Use Stripe test cards for development

### Email Not Sending
- In development, emails log to console
- For production, configure SMTP settings

---

## 📚 Additional Resources

- [DEPENDENCIES.md](./DEPENDENCIES.md) - Detailed dependency documentation
- [Stripe Documentation](https://stripe.com/docs)
- [React Documentation](https://react.dev)
- [Express Documentation](https://expressjs.com)

---

**Built with ❤️ in Atlanta**

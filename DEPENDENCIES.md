# Dependencies Documentation

Complete guide to all project dependencies and their purposes.

---

## 📦 Production Dependencies

### Core Framework & Runtime
| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.2.0 | UI library for building components |
| `react-dom` | ^18.2.0 | React renderer for web |
| `react-router-dom` | ^6.26.2 | Client-side routing and navigation |

### Backend Framework
| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^5.1.0 | Web application framework |
| `cors` | ^2.8.5 | Enable Cross-Origin Resource Sharing |
| `dotenv` | ^17.2.3 | Environment variable management |

### Authentication & Security
| Package | Version | Purpose |
|---------|---------|---------|
| `jsonwebtoken` | ^9.0.2 | JWT token generation and verification |
| `bcryptjs` | ^3.0.3 | Password hashing and comparison |
| `express-validator` | ^7.3.0 | Request validation and sanitization |

### Payment Processing
| Package | Version | Purpose |
|---------|---------|---------|
| `stripe` | ^20.0.0 | Stripe API for backend |
| `@stripe/stripe-js` | ^8.5.2 | Stripe.js library for frontend |
| `@stripe/react-stripe-js` | ^5.4.0 | React components for Stripe |

### Email & Notifications
| Package | Version | Purpose |
|---------|---------|---------|
| `nodemailer` | ^7.0.10 | Email sending service |

### Development Tools
| Package | Version | Purpose |
|---------|---------|---------|
| `concurrently` | ^9.2.1 | Run multiple scripts simultaneously |

---

## 🛠️ Development Dependencies

### Build Tools
| Package | Version | Purpose |
|---------|---------|---------|
| `vite` | ^5.0.8 | Frontend build tool and dev server |
| `@vitejs/plugin-react` | ^4.2.1 | Vite plugin for React support |

### Code Quality
| Package | Version | Purpose |
|---------|---------|---------|
| `eslint` | ^8.55.0 | JavaScript linter |
| `eslint-plugin-react` | ^7.33.2 | React-specific linting rules |
| `eslint-plugin-react-hooks` | ^4.6.0 | Hooks linting rules |
| `eslint-plugin-react-refresh` | ^0.4.5 | React Fast Refresh linting |

### Type Definitions
| Package | Version | Purpose |
|---------|---------|---------|
| `@types/react` | ^18.2.43 | TypeScript definitions for React |
| `@types/react-dom` | ^18.2.17 | TypeScript definitions for React DOM |

### Development Server
| Package | Version | Purpose |
|---------|---------|---------|
| `nodemon` | ^3.1.10 | Auto-restart Node.js server on changes |

### CSS Optimization
| Package | Version | Purpose |
|---------|---------|---------|
| `@fullhuman/postcss-purgecss` | ^5.0.0 | Remove unused CSS in production |

---

## 📝 Dependency Details

### React Ecosystem

#### `react` & `react-dom`
- **What**: Core React library
- **Why**: Modern UI component architecture
- **Used in**: All frontend components
- **Key Features**:
  - Component-based architecture
  - Virtual DOM for performance
  - Hooks for state management
  - Server-side rendering ready

#### `react-router-dom`
- **What**: Routing library for React
- **Why**: Client-side navigation without page reloads
- **Used in**: App routing, navigation
- **Key Features**:
  - Nested routes
  - Protected routes
  - Dynamic routing
  - Browser history management

---

### Backend Framework

#### `express`
- **What**: Minimalist web framework for Node.js
- **Why**: Industry-standard, flexible, extensive middleware
- **Used in**: All API endpoints
- **Key Features**:
  - Middleware support
  - Routing
  - Template engines
  - Error handling

#### `cors`
- **What**: Cross-Origin Resource Sharing middleware
- **Why**: Allow frontend to communicate with backend API
- **Configuration**: Configured for localhost in development
- **Production**: Should restrict to your domain only

#### `dotenv`
- **What**: Loads environment variables from .env files
- **Why**: Secure configuration management
- **Used in**: Server initialization
- **Files**: `server/.env`, `.env`

---

### Authentication

#### `jsonwebtoken`
- **What**: JWT token creation and verification
- **Why**: Stateless authentication
- **Used in**: Login, registration, protected routes
- **Configuration**: 
  - Secret: `JWT_SECRET` in server/.env
  - Expiry: 7 days default
  - Algorithm: HS256

#### `bcryptjs`
- **What**: Password hashing library
- **Why**: Secure password storage
- **Used in**: User registration, login
- **Configuration**: 10 salt rounds

#### `express-validator`
- **What**: Validation and sanitization middleware
- **Why**: Input validation and security
- **Used in**: All POST/PUT endpoints
- **Features**:
  - Email validation
  - Password strength
  - XSS protection

---

### Payment Processing

#### Stripe Suite
- **Backend**: `stripe` - Full Stripe API access
- **Frontend**: `@stripe/stripe-js` - Load Stripe.js
- **React**: `@stripe/react-stripe-js` - React components

**Configuration Required**:
```env
# Backend (server/.env)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend (.env)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Usage**:
- Subscription management
- Payment processing
- Customer creation
- Webhook handling

**Test Cards**:
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002

---

### Email Service

#### `nodemailer`
- **What**: Email sending library
- **Why**: Verification emails, notifications
- **Used in**: 
  - Email verification
  - Welcome emails
  - Maintenance alerts
- **Development**: Logs to console
- **Production**: Configure SMTP

**SMTP Configuration**:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_api_key
SMTP_FROM=HostPilot <noreply@hostpilot.com>
```

---

### Build & Development

#### `vite`
- **What**: Next-generation frontend build tool
- **Why**: Lightning-fast HMR, modern bundling
- **Features**:
  - Instant server start
  - Hot Module Replacement
  - Optimized builds
  - Plugin ecosystem

**Configuration**: `vite.config.js`

#### `nodemon`
- **What**: Auto-restart Node.js applications
- **Why**: Development workflow efficiency
- **Watches**: `server/**/*.js`
- **Ignores**: `node_modules/`, `data/`

#### `concurrently`
- **What**: Run multiple commands simultaneously
- **Why**: Single command for frontend + backend
- **Usage**: `npm run dev:all`

---

### Code Quality

#### ESLint
- **What**: JavaScript linter
- **Why**: Code consistency and error prevention
- **Configuration**: `.eslintrc.cjs`
- **Plugins**:
  - `eslint-plugin-react` - React best practices
  - `eslint-plugin-react-hooks` - Hooks rules
  - `eslint-plugin-react-refresh` - Fast Refresh support

---

## 🔄 Updating Dependencies

### Check for Updates
```bash
npm outdated
```

### Update All
```bash
npm update
```

### Update Specific Package
```bash
npm install package-name@latest
```

### Update Major Versions (be careful!)
```bash
npm install package-name@next
```

---

## ⚠️ Breaking Changes to Watch

### React 18 → 19
- New hooks API
- Server Components
- Automatic batching changes

### Express 5
- Promise rejection handling
- Router changes
- Middleware updates

### Stripe API Versions
- Payment Intent API changes
- Webhook signature versions
- Checkout Session updates

---

## 🔒 Security Considerations

### Regular Updates
- **Security patches**: Update immediately
- **Minor versions**: Update monthly
- **Major versions**: Test thoroughly first

### Vulnerability Scanning
```bash
npm audit
npm audit fix
npm audit fix --force  # Use with caution
```

### Dependencies to Watch
- `jsonwebtoken` - Authentication critical
- `bcryptjs` - Password security
- `stripe` - Payment processing
- `express` - Web framework
- `express-validator` - Input validation

---

## 📊 Bundle Size Impact

### Frontend (Production)
- React + React-DOM: ~130KB gzipped
- React Router: ~15KB gzipped
- Stripe Elements: ~50KB gzipped
- **Total Core**: ~195KB gzipped

### Optimization Strategies
1. Code splitting with React.lazy()
2. Tree shaking (automatic with Vite)
3. PurgeCSS for unused styles
4. Dynamic imports for large components

---

## 🚨 Known Issues

### Current Warnings
None at this time.

### Deprecated Packages
None - all dependencies are actively maintained.

---

## 📞 Support

For dependency-specific issues:
1. Check package documentation
2. Search GitHub issues
3. Check Stack Overflow
4. Contact maintainers

---

**Last Updated**: November 2024  
**Node Version**: 18.x  
**npm Version**: 9.x

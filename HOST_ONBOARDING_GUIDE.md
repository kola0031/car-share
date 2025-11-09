# Host Onboarding Guide - HostPilot

This document explains how to onboard a new host based on the current implementation.

## Current Onboarding Flow

### Step 1: Registration
**Endpoint:** `POST /api/auth/register`

When a new host registers:
1. User account is created
2. Host profile is automatically created with:
   - `onboardingStatus: 'pending'`
   - `serviceTier: 'Basic'`
   - `subscriptionStatus: 'active'`
   - `monthlySubscriptionFee: 299` (should be updated to $150/month for HostPilot)
3. Subscription is created automatically
4. User is redirected to `/onboarding` page

### Step 2: Onboarding Wizard (Frontend)
**Route:** `/onboarding`

The onboarding process consists of 4 steps:

#### Step 1: Company Information
- Collects company/fleet name
- Updates host profile with company name

#### Step 2: Create Fleet
- Creates first fleet for the host
- Fleet name can be customized

#### Step 3: Add Vehicle (Optional)
- Allows host to add their first vehicle
- Fields: Make, Model, Year, License Plate, VIN
- Can be skipped and added later

#### Step 4: Complete Setup
- Sets PackMyShare location
- Marks `onboardingStatus: 'completed'`
- Redirects to dashboard

## How to Onboard a New Host (Manual Process)

### Option 1: Self-Service Registration (Recommended)

1. **Host visits registration page:**
   ```
   http://localhost:5173/register
   ```

2. **Host fills out registration form:**
   - Full Name
   - Email Address
   - Company Name (optional)
   - Password
   - Role: Select "I'm a Host"

3. **System automatically:**
   - Creates user account
   - Creates host profile
   - Creates subscription
   - Redirects to onboarding wizard

4. **Host completes onboarding:**
   - Step 1: Company Information
   - Step 2: Create Fleet
   - Step 3: Add Vehicle (optional)
   - Step 4: Complete Setup

5. **Host is redirected to dashboard:**
   - Can start managing fleet
   - Can add more vehicles
   - Can view stats and reservations

### Option 2: Admin Creates Host (Via API)

```bash
# 1. Register the host
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "companyName": "John\'s Fleet",
    "role": "host"
  }'

# 2. Host will need to complete onboarding via frontend
# Or you can manually update the host:
curl -X PUT http://localhost:3001/api/hosts/{hostId} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "onboardingStatus": "completed",
    "parkMyShareLocation": "Atlanta, GA"
  }'
```

### Option 3: Seed Script (For Testing)

```bash
# Create a test host
npm run seed:user

# This creates:
# Email: test@hostpilot.com
# Password: test123456
# Role: host
# Onboarding Status: pending
```

## Current Implementation Details

### Database Structure

**Host Profile** (`server/data/hosts.json`):
```json
{
  "id": "host_...",
  "userId": "user_...",
  "companyName": "Company Name",
  "serviceTier": "Basic",
  "subscriptionStatus": "active",
  "monthlySubscriptionFee": 299,
  "onboardingStatus": "pending",
  "parkMyShareLocation": null,
  "fleetSize": 0,
  "totalRevenue": 0
}
```

**Subscription** (`server/data/subscriptions.json`):
```json
{
  "id": "sub_...",
  "hostId": "host_...",
  "serviceTier": "Basic",
  "monthlyFee": 299,
  "status": "active",
  "startDate": "2024-01-01T00:00:00.000Z",
  "nextBillingDate": "2024-02-01T00:00:00.000Z"
}
```

### API Endpoints

**Authentication:**
- `POST /api/auth/register` - Register new host
- `POST /api/auth/login` - Login host
- `GET /api/auth/verify` - Verify token

**Host Management:**
- `GET /api/hosts` - Get all hosts (admin)
- `GET /api/hosts/:id` - Get host by ID
- `PUT /api/hosts/:id` - Update host
- `DELETE /api/hosts/:id` - Delete host

**Onboarding:**
- Handled via frontend `/onboarding` route
- Uses `PUT /api/hosts/:id` to update onboarding status

## Missing Features (To Match HostPilot Business Model)

Based on the HostPilot business model, the following features should be added:

### 1. Payment Integration (€580 One-Time Fee)
- **Current:** Not implemented
- **Required:** 
  - Payment processing for €580 integration fee
  - Stripe/PayPal integration
  - Payment confirmation before completing onboarding

### 2. Subscription Pricing Update
- **Current:** $299/month
- **Required:** $150/month (as per HostPilot pricing)
- **Action:** Update `monthlySubscriptionFee` to 150

### 3. VEVS Portal Integration
- **Current:** Not implemented
- **Required:**
  - VEVS portal configuration
  - Portal URL generation
  - Portal access credentials

### 4. PackMyShare Integration
- **Current:** Location field only
- **Required:**
  - Facility selection
  - Facility integration
  - Parking fee calculation ($97.85/car/month)

### 5. Training & Documentation
- **Current:** Not implemented
- **Required:**
  - Onboarding video/tutorial
  - Documentation access
  - Support contact information

## Recommended Improvements

### 1. Add Payment Step to Onboarding

Add a payment step before completing onboarding:

```javascript
// Step 5: Payment Setup
- Integration Fee: €580 (one-time)
- Subscription: $150/month
- Payment method setup
- Stripe integration
```

### 2. Add VEVS Portal Setup

```javascript
// After payment, configure VEVS portal
- Generate portal URL
- Set up portal credentials
- Configure portal settings
```

### 3. Enhanced PackMyShare Integration

```javascript
// PackMyShare facility selection
- List available facilities
- Select facility
- Calculate parking fees
- Set up vehicle storage
```

### 4. Onboarding Completion Checklist

```javascript
✅ Account created
✅ Payment processed (€580)
✅ Subscription active ($150/month)
✅ VEVS portal configured
✅ PackMyShare facility selected
✅ Fleet created
✅ At least one vehicle added (optional)
✅ Training completed
```

## Testing the Onboarding Flow

### 1. Test Registration
```bash
# Register a new host
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Host",
    "email": "host@test.com",
    "password": "test123456",
    "companyName": "Test Fleet",
    "role": "host"
  }'
```

### 2. Test Onboarding Completion
```bash
# Update onboarding status
curl -X PUT http://localhost:3001/api/hosts/{hostId} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "onboardingStatus": "completed",
    "parkMyShareLocation": "Atlanta, GA"
  }'
```

### 3. Verify Host Data
```bash
# Get host information
curl -X GET http://localhost:3001/api/hosts/{hostId} \
  -H "Authorization: Bearer {token}"
```

## Next Steps

1. **Update Pricing:**
   - Change monthly fee from $299 to $150
   - Add €580 one-time integration fee

2. **Add Payment Integration:**
   - Integrate Stripe/PayPal
   - Add payment step to onboarding
   - Store payment information

3. **Add VEVS Portal:**
   - Create portal configuration
   - Generate portal URLs
   - Set up portal credentials

4. **Enhance PackMyShare Integration:**
   - Add facility selection
   - Calculate parking fees
   - Integrate with PackMyShare API

5. **Add Training:**
   - Create onboarding tutorials
   - Add documentation links
   - Provide support contact

## Support

For questions about onboarding:
- Check the onboarding flow at `/onboarding`
- Review API documentation
- Contact support@hostpilot.com


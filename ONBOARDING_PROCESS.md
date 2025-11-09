# Host Onboarding Process - Quick Guide

## 🚀 Quick Start: Onboard a New Host

### Method 1: Self-Service Registration (Recommended)

1. **Host visits:** `http://localhost:5173/register`

2. **Host fills out form:**
   - Name: "John Doe"
   - Email: "john@example.com"
   - Company Name: "John's Fleet" (optional)
   - Password: (minimum 6 characters)
   - Role: Select **"I'm a Host"**

3. **System automatically:**
   - ✅ Creates user account
   - ✅ Creates host profile
   - ✅ Creates subscription ($299/month - needs update to $150)
   - ✅ Sets `onboardingStatus: 'pending'`
   - ✅ Redirects to `/onboarding`

4. **Host completes onboarding wizard:**
   - **Step 1:** Enter company/fleet name
   - **Step 2:** Create first fleet
   - **Step 3:** Add first vehicle (optional - can skip)
   - **Step 4:** Set PackMyShare location (e.g., "Atlanta, GA")

5. **Onboarding complete:**
   - ✅ `onboardingStatus` set to `'completed'`
   - ✅ Redirected to `/dashboard`
   - ✅ Host can start managing fleet

### Method 2: Using Test User (For Testing)

```bash
# Create test host
npm run seed:user

# Login with:
# Email: test@hostpilot.com
# Password: test123456

# Complete onboarding at: http://localhost:5173/onboarding
```

### Method 3: Via API (Programmatic)

```bash
# 1. Register host
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Host",
    "email": "newhost@example.com",
    "password": "password123",
    "companyName": "New Host Fleet",
    "role": "host"
  }'

# Response includes:
# - token (JWT)
# - user object with hostId
# - Host profile created with onboardingStatus: 'pending'

# 2. Host completes onboarding via frontend
# OR manually update:
curl -X PUT http://localhost:3001/api/hosts/{hostId} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "onboardingStatus": "completed",
    "parkMyShareLocation": "Atlanta, GA"
  }'
```

## 📋 Current Onboarding Steps

### Step 1: Company Information
- Collects company/fleet name
- Updates host profile

### Step 2: Create Fleet
- Creates first fleet
- Fleet name can be customized

### Step 3: Add Vehicle (Optional)
- Add first vehicle details:
  - Make, Model, Year
  - License Plate, VIN
- Can be skipped

### Step 4: Complete Setup
- Set PackMyShare location
- Complete onboarding
- Redirect to dashboard

## 🔍 Check Onboarding Status

### Via API:
```bash
# Get host information
curl -X GET http://localhost:3001/api/hosts/{hostId} \
  -H "Authorization: Bearer {token}"

# Response shows:
# - onboardingStatus: 'pending' | 'in-progress' | 'completed'
# - parkMyShareLocation
# - companyName
# - subscriptionStatus
```

### Via Frontend:
- Host logs in
- If `onboardingStatus !== 'completed'`, redirected to `/onboarding`
- If `onboardingStatus === 'completed'`, redirected to `/dashboard`

## ⚠️ Missing Features (HostPilot Business Model)

Based on HostPilot requirements, these are NOT yet implemented:

1. **€580 One-Time Integration Fee**
   - Payment processing needed
   - Stripe/PayPal integration
   - Payment step in onboarding

2. **Subscription Pricing Update**
   - Current: $299/month
   - Required: $150/month
   - Action: Update in `server/database/subscriptions.js`

3. **VEVS Portal Configuration**
   - Portal URL generation
   - Portal credentials
   - Portal setup step

4. **PackMyShare Facility Selection**
   - Facility list
   - Facility selection
   - Parking fee calculation ($97.85/car/month)

5. **Training & Documentation**
   - Onboarding tutorials
   - Documentation access
   - Support contact

## 🛠️ Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| User Registration | ✅ Complete | Creates user + host profile |
| Host Profile Creation | ✅ Complete | Auto-created on registration |
| Subscription Creation | ✅ Complete | Auto-created (needs price update) |
| Onboarding Wizard | ✅ Complete | 4-step process |
| Fleet Creation | ✅ Complete | Step 2 of onboarding |
| Vehicle Addition | ✅ Complete | Step 3 of onboarding |
| PackMyShare Location | ✅ Partial | Location field only |
| Payment Integration | ❌ Missing | Need €580 fee + Stripe |
| VEVS Portal Setup | ❌ Missing | Portal configuration needed |
| Training/Docs | ❌ Missing | Tutorials and documentation |

## 📝 Data Structure

### Host Profile
```json
{
  "id": "host_...",
  "userId": "user_...",
  "companyName": "Company Name",
  "serviceTier": "Basic",
  "subscriptionStatus": "active",
  "monthlySubscriptionFee": 299,  // ⚠️ Should be 150
  "onboardingStatus": "pending",   // pending | in-progress | completed
  "parkMyShareLocation": "Atlanta, GA",
  "fleetSize": 0,
  "totalRevenue": 0
}
```

### Subscription
```json
{
  "id": "sub_...",
  "hostId": "host_...",
  "serviceTier": "Basic",
  "monthlyFee": 299,  // ⚠️ Should be 150
  "status": "active",
  "startDate": "2024-01-01T00:00:00.000Z",
  "nextBillingDate": "2024-02-01T00:00:00.000Z"
}
```

## 🎯 Next Steps to Complete HostPilot Onboarding

1. **Update Pricing:**
   ```javascript
   // In server/database/subscriptions.js
   monthlyFee: 150  // Change from 299
   ```

2. **Add Payment Step:**
   - Add Step 5: Payment Setup
   - Integrate Stripe for €580 fee
   - Store payment method

3. **Add VEVS Portal:**
   - Generate portal URL
   - Set up credentials
   - Add portal step to onboarding

4. **Enhance PackMyShare:**
   - Add facility selection
   - Calculate parking fees
   - Integrate with PackMyShare API

5. **Add Training:**
   - Create tutorials
   - Add documentation
   - Provide support links

## 🔗 Related Files

- **Frontend Onboarding:** `src/routes/Onboarding.jsx`
- **Backend Auth:** `server/routes/auth.js`
- **Host Database:** `server/database/hosts.js`
- **Subscription Database:** `server/database/subscriptions.js`
- **Registration Component:** `src/components/Register.jsx`

## 📞 Support

For questions about onboarding:
- Check onboarding flow: `/onboarding`
- Review API docs
- See full guide: `HOST_ONBOARDING_GUIDE.md`


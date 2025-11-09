# Registration Workflow - Complete Guide

## 🎯 Complete User Journey

### Step 1: Click "Get Started" Button
**Location:** Multiple places on the website
- Hero section: "GET STARTED TODAY"
- Footer: "GET STARTED TODAY"
- Pricing section: "GET STARTED"
- Navbar: "GET STARTED"

**Action:** User clicks any "Get Started" button
**Result:** Navigates to `/register` page

---

### Step 2: Registration Page (`/register`)

**What happens:**
1. User sees registration form
2. User selects role: **"I'm a Host"** (default) or **"I'm a Driver"**
3. User fills out form:
   - Full Name (required)
   - Email Address (required)
   - Company Name (optional, only for hosts)
   - Password (required, min 6 characters)
   - Confirm Password (required)

**On Submit:**
1. Frontend validates:
   - Passwords match
   - Password length ≥ 6 characters
   - All required fields filled

2. **Backend API Call:** `POST /api/auth/register`
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com",
     "password": "password123",
     "companyName": "John's Fleet",
     "role": "host"
   }
   ```

3. **Backend Creates:**
   - ✅ User account (in `users.json`)
   - ✅ Host profile (in `hosts.json`)
     - `onboardingStatus: 'pending'`
     - `subscriptionStatus: 'active'`
     - `serviceTier: 'Basic'`
     - `monthlySubscriptionFee: 299` (should be 150)
   - ✅ Subscription (in `subscriptions.json`)
     - `status: 'active'`
     - `monthlyFee: 299` (should be 150)

4. **Backend Returns:**
   - JWT token
   - User object with `hostId`

5. **Frontend:**
   - Stores token in localStorage
   - Updates AuthContext with user data
   - **Redirects to `/onboarding`** (for hosts)
   - **Redirects to `/bookings`** (for drivers)

---

### Step 3: Onboarding Wizard (`/onboarding`)

**Only for Hosts** - Drivers skip this step

**Protected Route:** Requires authentication
- If not logged in → Redirects to `/login`
- If already completed → Redirects to `/dashboard`

**4-Step Process:**

#### Step 1: Company Information
- **Action:** Enter company/fleet name
- **API Call:** `PUT /api/hosts/{hostId}`
  ```json
  {
    "companyName": "John's Fleet"
  }
  ```
- **Result:** Updates host profile

#### Step 2: Create Fleet
- **Action:** Enter fleet name
- **API Call:** `POST /api/fleets`
  ```json
  {
    "name": "Main Fleet"
  }
  ```
- **Result:** Creates first fleet for host

#### Step 3: Add Vehicle (Optional)
- **Action:** Enter vehicle details
  - Make, Model, Year
  - License Plate, VIN (optional)
- **API Call:** `POST /api/vehicles`
  ```json
  {
    "make": "Toyota",
    "model": "Camry",
    "year": 2023,
    "licensePlate": "ABC-1234",
    "vin": "1HGBH41JXMN109186",
    "status": "available",
    "hostId": "host_..."
  }
  ```
- **Result:** Creates first vehicle
- **Can Skip:** User can skip this step

#### Step 4: Complete Setup
- **Action:** Enter PackMyShare location
- **API Call:** `PUT /api/hosts/{hostId}`
  ```json
  {
    "onboardingStatus": "completed",
    "parkMyShareLocation": "Atlanta, GA"
  }
  ```
- **Result:** 
  - Marks onboarding as complete
  - **Redirects to `/dashboard`**

---

### Step 4: Dashboard (`/dashboard`)

**Protected Route:** Requires authentication
- If not logged in → Redirects to `/login`
- If onboarding not complete → Redirects to `/onboarding`

**What Host Sees:**
- Dashboard stats:
  - Total Reservations
  - Active Reservations
  - Pending Reservations
  - Total Vehicles
  - Total Revenue
  - Monthly Revenue
- Recent Reservations
- Tabs: Overview, Reservations, Vehicles

**Host Can Now:**
- ✅ Manage fleet
- ✅ Add more vehicles
- ✅ View reservations
- ✅ Track revenue
- ✅ Access all features

---

## 📊 Complete Flow Diagram

```
User Clicks "Get Started"
         ↓
   /register Page
         ↓
   Fill Registration Form
         ↓
   Submit Form
         ↓
   POST /api/auth/register
         ↓
   Backend Creates:
   - User Account
   - Host Profile (onboardingStatus: 'pending')
   - Subscription
         ↓
   Returns JWT Token
         ↓
   Frontend Stores Token
         ↓
   Redirect to /onboarding
         ↓
   Step 1: Company Information
         ↓
   Step 2: Create Fleet
         ↓
   Step 3: Add Vehicle (Optional)
         ↓
   Step 4: Complete Setup
         ↓
   Update onboardingStatus: 'completed'
         ↓
   Redirect to /dashboard
         ↓
   Host Can Start Managing Fleet
```

## 🔄 API Calls Summary

### Registration
- **POST** `/api/auth/register`
  - Creates user, host, subscription

### Onboarding
- **GET** `/api/hosts/{hostId}` - Get host data
- **PUT** `/api/hosts/{hostId}` - Update company name
- **POST** `/api/fleets` - Create fleet
- **POST** `/api/vehicles` - Add vehicle
- **PUT** `/api/hosts/{hostId}` - Complete onboarding

### Dashboard
- **GET** `/api/dashboard/stats` - Get dashboard statistics
- **GET** `/api/dashboard/recent-reservations` - Get recent reservations

## ✅ Checklist for New Host

- [ ] Click "Get Started" button
- [ ] Fill registration form
- [ ] Select "I'm a Host"
- [ ] Submit registration
- [ ] Complete Step 1: Company Information
- [ ] Complete Step 2: Create Fleet
- [ ] Complete Step 3: Add Vehicle (or skip)
- [ ] Complete Step 4: Set PackMyShare Location
- [ ] Access Dashboard
- [ ] Start managing fleet

## 🎯 Key Points

1. **Registration is automatic** - Creates user, host, and subscription
2. **Onboarding is required** - Must complete before accessing dashboard
3. **Protected routes** - Dashboard and onboarding require authentication
4. **Role-based routing** - Hosts go to onboarding, drivers go to bookings
5. **Skip options** - Vehicle addition can be skipped in Step 3

## 🔍 Testing the Workflow

1. **Start servers:**
   ```bash
   npm run dev:all
   ```

2. **Visit:** `http://localhost:5173`

3. **Click:** Any "Get Started" button

4. **Fill form:**
   - Name: "Test Host"
   - Email: "testhost@example.com"
   - Password: "test123456"
   - Company: "Test Fleet"
   - Role: "I'm a Host"

5. **Complete onboarding:**
   - Step 1: Enter company name
   - Step 2: Create fleet
   - Step 3: Add vehicle (or skip)
   - Step 4: Set location

6. **Access dashboard:**
   - View stats
   - Manage fleet
   - Add vehicles

## 🚀 Next Steps After Onboarding

Once onboarding is complete, hosts can:
- Add more vehicles to their fleet
- Set up booking calendar
- Configure pricing
- Manage reservations
- Track revenue
- View analytics
- Access VEVS portal (when implemented)
- Manage PackMyShare integration (when implemented)

---

**The registration workflow is now fully functional!** Users can click "Get Started" from anywhere and complete the entire registration and onboarding process seamlessly.


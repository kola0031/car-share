# Host Onboarding Process - Step by Step Guide

## Overview
This guide explains how to onboard a new host in the HostPilot system based on the current implementation.

## Step 1: Host Registration

### Option A: Through the Website
1. Navigate to the homepage (`/`)
2. Click "GET STARTED TODAY" button
3. Fill out the lead capture form (name, email, phone)
4. Click "Become a Host" to register
5. Fill out the registration form:
   - Select "I'm a Host" role
   - Enter name, email, password
   - Optionally enter company name
   - Click "Create Account"

### Option B: Direct Registration
1. Navigate to `/register`
2. Select "I'm a Host" role
3. Fill out the registration form
4. Submit

**What Happens Automatically:**
- User account is created in the `users` database
- Host profile is created in the `hosts` database with:
  - `onboardingStatus: 'pending'`
  - `serviceTier: 'Basic'`
  - `subscriptionStatus: 'active'`
  - `monthlySubscriptionFee: 299`
- Basic subscription is created in the `subscriptions` database
- JWT token is generated and stored in localStorage
- User is redirected to `/onboarding` (if route exists) or `/dashboard`

## Step 2: Host Onboarding Flow

After registration, the host should:

1. **Complete Profile Setup**
   - Access the Host Dashboard at `/dashboard`
   - Complete any pending profile information
   - Verify company details

2. **Add Vehicles to Fleet**
   - Navigate to the Vehicles section in the dashboard
   - Click "Add Vehicle"
   - Fill out vehicle information:
     - Make, Model, Year
     - VIN
     - License Plate
     - Color
     - Mileage
     - Daily Rate
     - Photos (optional)
     - Documents (registration, insurance, inspection)
     - ParkMyShare Location
     - Maintenance Plan (Standard or Premium)
   - Vehicle status will be set to `pending`
   - Verification status will be `pending`

3. **Vehicle Verification**
   - HostPilot team reviews vehicle documents
   - Updates vehicle `verificationStatus` to `verified` or `rejected`
   - Updates vehicle `status` to `available` once verified

4. **Fleet Management**
   - Host can organize vehicles into fleets
   - Create fleet collections for better organization
   - Monitor fleet performance

## Step 3: Subscription Management

The host's subscription is automatically created with:
- **Service Tier**: Basic
- **Status**: Active
- **Monthly Fee**: $299

Host can:
- View subscription details in the dashboard
- Upgrade service tier (Pro, Enterprise)
- View billing history

## Step 4: Start Earning

Once vehicles are verified and available:
1. Vehicles appear in the booking marketplace
2. Drivers can search and book vehicles
3. Bookings automatically create trip records
4. Host receives revenue from bookings
5. Host can monitor performance in the dashboard

## API Endpoints for Host Onboarding

### Registration
```bash
POST /api/auth/register
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "companyName": "John's Fleet",
  "role": "host"
}
```

### Get Host Profile
```bash
GET /api/hosts/user/:userId
Headers: { Authorization: "Bearer <token>" }
```

### Create Vehicle
```bash
POST /api/vehicles
Headers: { Authorization: "Bearer <token>" }
Body: {
  "hostId": "<hostId>",
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "vin": "1HGBH41JXMN109186",
  "licensePlate": "ABC123",
  "color": "Silver",
  "mileage": 15000,
  "dailyRate": 50,
  "parkMyShareLocation": "Atlanta Downtown",
  "maintenancePlan": "standard"
}
```

### Update Vehicle Verification
```bash
PUT /api/vehicles/:vehicleId
Headers: { Authorization: "Bearer <token>" }
Body: {
  "verificationStatus": "verified",
  "status": "available"
}
```

## Database Structure

### Host Record
```json
{
  "id": "host_xxx",
  "userId": "user_xxx",
  "companyName": "John's Fleet",
  "serviceTier": "Basic",
  "subscriptionStatus": "active",
  "monthlySubscriptionFee": 299,
  "onboardingStatus": "pending",
  "hostPilotIntegrationId": null,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Vehicle Record
```json
{
  "id": "vehicle_xxx",
  "hostId": "host_xxx",
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "vin": "1HGBH41JXMN109186",
  "licensePlate": "ABC123",
  "status": "pending",
  "verificationStatus": "pending",
  "dailyRate": 50,
  "parkMyShareLocation": "Atlanta Downtown",
  "maintenancePlan": "standard"
}
```

## Troubleshooting

### Token Expired Error
If you see "Invalid or expired token":
1. Clear localStorage: `localStorage.removeItem('token')`
2. Log in again at `/login`
3. The system will automatically redirect you if the token expires

### Host Profile Not Found
- Ensure the user registered with `role: "host"`
- Check that the host profile was created during registration
- Verify the `userId` matches between user and host records

### Vehicle Not Appearing in Bookings
- Check vehicle `status` is `available`
- Check vehicle `verificationStatus` is `verified`
- Ensure vehicle has a valid `dailyRate`
- Verify `parkMyShareLocation` is set

## Next Steps After Onboarding

1. **Monitor Dashboard**: Track performance metrics, revenue, and bookings
2. **Manage Fleet**: Add more vehicles, organize into fleets
3. **Handle Tickets**: Respond to operational tickets and maintenance requests
4. **Review Analytics**: Use performance dashboard for insights
5. **Upgrade Subscription**: Consider upgrading to Pro or Enterprise tier

## Support

For issues during onboarding:
- Check the browser console for errors
- Verify backend server is running on port 3001
- Check that JWT_SECRET matches in server/.env
- Review server logs for detailed error messages


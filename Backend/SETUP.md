# Blood Donation Backend Setup Guide

## ✅ What's Been Created

Your backend folder now contains:

### 📂 Project Structure
```
Backend/
├── server.js              # Main server file
├── package.json            # Dependencies and scripts
├── README.md              # Detailed documentation
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
│
├── models/                # Database models
│   ├── User.js            # User/Donor/BloodBank model
│   ├── Donation.js        # Blood donation records
│   └── Appointment.js     # Appointment scheduling
│
├── routes/                # API endpoints
│   ├── auth.js            # Authentication routes
│   ├── users.js           # User management routes
│   ├── donors.js          # Donor-specific routes
│   ├── bloodBanks.js      # Blood bank routes
│   ├── donations.js       # Donation management
│   └── appointments.js    # Appointment system
│
├── middleware/            # Custom middleware
│   └── auth.js            # Authentication & authorization
│
└── utils/                 # Utility functions
    ├── emailService.js    # Email notifications
    └── tokenGenerator.js  # Token generation utilities
```

### 🚀 Features Included
- **Complete Authentication System** (Register, Login, Email Verification, Password Reset)
- **User Management** (Donors, Blood Banks, Hospitals, Admin)
- **Appointment Scheduling** with availability checking
- **Blood Donation Tracking** with medical screening
- **Blood Inventory Management** 
- **Geospatial Search** (Find nearby donors/blood banks)
- **Email Notifications** with beautiful templates
- **Role-based Access Control**
- **Security Features** (Rate limiting, account lockout, etc.)

## 🛠️ Next Steps

### 1. Environment Setup
```bash
# Copy the environment template
copy .env.example .env

# Edit .env file with your configuration:
# - MongoDB connection string
# - JWT secret key
# - Email SMTP settings
```

### 2. Database Setup
```bash
# Make sure MongoDB is running locally or set up MongoDB Atlas
# The app will automatically create collections and indexes
```

### 3. Start Development Server
```bash
# Development mode with auto-reload
npm run dev

# Or regular start
npm start
```

### 4. Test the API
```bash
# Health check
curl http://localhost:5000/api/health

# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe", 
    "email": "john@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "role": "donor",
    "dateOfBirth": "1990-01-01",
    "gender": "male",
    "bloodType": "O+",
    "address": {
      "street": "123 Main St",
      "city": "Anytown", 
      "state": "CA",
      "zipCode": "12345"
    }
  }'
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/dashboard` - Get dashboard data
- `GET /api/users/donors` - Get all donors (blood banks only)
- `GET /api/users/blood-banks` - Get all blood banks

### Donations
- `POST /api/donations` - Record new donation
- `GET /api/donations` - Get donations (filtered)
- `GET /api/donations/:id` - Get specific donation
- `PUT /api/donations/:id` - Update donation
- `GET /api/donations/stats/overview` - Get statistics

### Appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - Get appointments
- `GET /api/appointments/:id` - Get specific appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment
- `GET /api/appointments/availability/:bloodBankId` - Check availability

### Blood Banks
- `GET /api/blood-banks` - Get all blood banks
- `GET /api/blood-banks/:id` - Get blood bank details
- `GET /api/blood-banks/:id/inventory` - Get inventory (staff only)
- `GET /api/blood-banks/search/nearby` - Find nearby blood banks

### Donors
- `GET /api/donors` - Get donors (blood banks only)
- `GET /api/donors/:id` - Get donor details
- `GET /api/donors/search/eligible` - Find eligible donors

## 🔐 Authentication

All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 🗄️ Database Models

### User Roles
- `donor` - Blood donors
- `bloodBank` - Blood banks/organizations
- `hospital` - Hospitals
- `admin` - System administrators

### Blood Types
- A+, A-, B+, B-, AB+, AB-, O+, O-

### Appointment Status
- scheduled, confirmed, reminded, checked_in, in_progress, completed, cancelled, no_show, rescheduled

### Donation Status  
- scheduled, in_progress, screening_failed, completed, cancelled, adverse_reaction

## 📧 Email Templates

The system includes beautiful HTML email templates for:
- Email verification
- Password reset
- Appointment confirmations
- Donation thank you messages

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT authentication with expiration
- Account lockout after failed attempts
- Rate limiting on all endpoints
- Email verification requirement
- Role-based access control
- Input validation and sanitization
- Security headers with Helmet

## 🌍 Geospatial Features

- Find donors within a specified radius
- Locate nearby blood banks
- Calculate distances for urgent requests
- Support for MongoDB 2dsphere indexes

## 📊 Analytics & Reporting

- Donation statistics and trends
- Blood type inventory tracking
- Appointment analytics
- User dashboard with personalized data
- Monthly/yearly reporting capabilities

---

## 🚨 Important Notes

1. **Set up your .env file** before starting the server
2. **MongoDB must be running** (local or Atlas)
3. **Configure SMTP settings** for email functionality
4. **Use strong JWT_SECRET** in production
5. **Enable email verification** for new accounts

## 🆘 Need Help?

Check the detailed README.md file in the Backend folder for complete documentation, API examples, and troubleshooting guide.

Happy coding! 🩸❤️
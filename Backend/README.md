# Blood Donation Platform - Backend

A comprehensive Node.js/Express backend API for a blood donation platform that connects donors with blood banks and hospitals.

## 🩸 Features

### Core Features
- **User Management**: Registration, authentication, and profile management for donors, blood banks, and hospitals
- **Appointment System**: Schedule, manage, and track blood donation appointments
- **Donation Tracking**: Record and track blood donations with detailed medical information
- **Blood Inventory**: Track blood bank inventory with expiration dates and availability
- **Location Services**: Find nearby blood banks and donors using geospatial queries
- **Email Notifications**: Automated email system for verification, appointments, and confirmations

### Security Features
- JWT-based authentication and authorization
- Password hashing with bcrypt
- Account lockout protection
- Email verification system
- Rate limiting and security headers
- Role-based access control

### Advanced Features
- Blood type compatibility matching
- Donor eligibility tracking
- Medical screening and health questionnaires
- Appointment availability checking
- Dashboard analytics and statistics
- Bulk operations and reporting

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- NPM or Yarn package manager

### Installation

1. **Navigate to the Backend directory**
   ```bash
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Update the environment variables with your configuration:

   ```env
   NODE_ENV=development
   PORT=5000
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/blood_donation
   
   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   
   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:5173
   
   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```

4. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
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
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification_token_here"
}
```

### User Endpoints

#### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Update User Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John Updated",
  "phone": "+1234567891",
  "preferences": {
    "emailNotifications": true,
    "smsNotifications": false
  }
}
```

#### Get Dashboard Data
```http
GET /api/users/dashboard
Authorization: Bearer <token>
```

### Donor Endpoints

#### Search Eligible Donors
```http
GET /api/donors/search/eligible?bloodType=O+&urgency=high&limit=20
Authorization: Bearer <token>
```

#### Get Donor Details
```http
GET /api/donors/123456789
Authorization: Bearer <token>
```

### Blood Bank Endpoints

#### Get All Blood Banks
```http
GET /api/blood-banks?page=1&limit=10
```

#### Find Nearby Blood Banks
```http
GET /api/blood-banks/search/nearby?latitude=40.7128&longitude=-74.0060&maxDistance=50
```

#### Get Blood Bank Inventory
```http
GET /api/blood-banks/123456789/inventory
Authorization: Bearer <token>
```

### Appointment Endpoints

#### Create Appointment
```http
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "bloodBank": "blood_bank_id",
  "appointmentDate": "2024-02-01",
  "timeSlot": {
    "startTime": "10:00",
    "endTime": "11:00"
  },
  "donationType": "whole_blood"
}
```

#### Get Appointments
```http
GET /api/appointments?status=scheduled&page=1&limit=10
Authorization: Bearer <token>
```

#### Check Availability
```http
GET /api/appointments/availability/blood_bank_id?date=2024-02-01&duration=60
Authorization: Bearer <token>
```

### Donation Endpoints

#### Record Donation
```http
POST /api/donations
Authorization: Bearer <token>
Content-Type: application/json

{
  "donor": "donor_id",
  "donationType": "whole_blood",
  "bloodType": "O+",
  "quantity": 450,
  "donationDate": "2024-01-15T10:30:00Z",
  "preScreening": {
    "hemoglobin": 13.5,
    "bloodPressure": {
      "systolic": 120,
      "diastolic": 80
    },
    "temperature": 98.6,
    "weight": 70,
    "pulse": 72
  }
}
```

#### Get Donations
```http
GET /api/donations?bloodType=O+&status=completed&page=1&limit=10
Authorization: Bearer <token>
```

#### Get Donation Statistics
```http
GET /api/donations/stats/overview
Authorization: Bearer <token>
```

## 🗃️ Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: String (enum: ['donor', 'bloodBank', 'admin', 'hospital']),
  isActive: Boolean,
  isEmailVerified: Boolean,
  
  // Donor-specific fields
  dateOfBirth: Date,
  gender: String,
  bloodType: String,
  medicalHistory: {
    weight: Number,
    lastDonationDate: Date,
    eligibleToDonate: Boolean,
    medicalConditions: [String],
    medications: [String],
    allergies: [String]
  },
  
  // Organization-specific fields
  organizationInfo: {
    name: String,
    licenseNumber: String,
    contactPerson: String,
    operatingHours: Object
  },
  
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  
  location: {
    type: "Point",
    coordinates: [Number] // [longitude, latitude]
  },
  
  preferences: {
    emailNotifications: Boolean,
    smsNotifications: Boolean,
    donationReminders: Boolean
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

### Donation Collection
```javascript
{
  _id: ObjectId,
  donor: ObjectId (ref: User),
  bloodBank: ObjectId (ref: User),
  appointment: ObjectId (ref: Appointment),
  
  donationType: String,
  bloodType: String,
  quantity: Number,
  donationDate: Date,
  
  preScreening: {
    hemoglobin: Number,
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    temperature: Number,
    weight: Number,
    pulse: Number
  },
  
  healthQuestionnaire: Object,
  
  bloodBag: {
    bagNumber: String (unique),
    expirationDate: Date,
    storageRequirements: Object
  },
  
  qualityControl: Object,
  postDonationCare: Object,
  
  status: String,
  notes: String,
  
  createdAt: Date,
  updatedAt: Date
}
```

### Appointment Collection
```javascript
{
  _id: ObjectId,
  donor: ObjectId (ref: User),
  bloodBank: ObjectId (ref: User),
  
  appointmentDate: Date,
  timeSlot: {
    startTime: String,
    endTime: String,
    duration: Number
  },
  
  donationType: String,
  status: String,
  priority: String,
  
  location: Object,
  specialRequirements: Object,
  reminders: Object,
  
  checkIn: Object,
  assignedStaff: Object,
  
  cancellation: Object,
  rescheduling: Object,
  
  feedback: Object,
  notes: String,
  
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/blood_donation |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |
| `SMTP_HOST` | Email SMTP host | smtp.gmail.com |
| `SMTP_PORT` | Email SMTP port | 587 |
| `SMTP_USER` | Email username | Required |
| `SMTP_PASS` | Email password/app password | Required |

### MongoDB Indexes
The application automatically creates the following indexes for optimal performance:
- User email (unique)
- User location (2dsphere for geospatial queries)
- User role and status
- Donation blood bank and date
- Donation blood type and status
- Appointment donor and date
- Appointment blood bank and date

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📦 Deployment

### Production Deployment

1. **Set environment variables**
   ```bash
   export NODE_ENV=production
   export MONGODB_URI=your_production_mongodb_uri
   export JWT_SECRET=your_production_jwt_secret
   # ... other variables
   ```

2. **Install production dependencies**
   ```bash
   npm ci --only=production
   ```

3. **Start the application**
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 📧 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Blood Donation Platform Backend** - Connecting hearts, saving lives! ❤️
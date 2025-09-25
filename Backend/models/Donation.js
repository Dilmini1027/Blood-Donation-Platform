import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  // Donor Information
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Donor information is required']
  },
  
  // Blood Bank Information
  bloodBank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Blood bank information is required']
  },
  
  // Appointment Information
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  
  // Donation Details
  donationType: {
    type: String,
    enum: ['whole_blood', 'plasma', 'platelets', 'double_red_cells'],
    default: 'whole_blood'
  },
  
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: [true, 'Blood type is required']
  },
  
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [350, 'Minimum donation quantity is 350ml'],
    max: [500, 'Maximum donation quantity is 500ml']
  },
  
  unit: {
    type: String,
    default: 'ml',
    enum: ['ml', 'pints']
  },
  
  // Medical Screening
  preScreening: {
    hemoglobin: {
      type: Number,
      required: true,
      min: [12.5, 'Hemoglobin level too low for donation']
    },
    bloodPressure: {
      systolic: {
        type: Number,
        required: true,
        min: [90, 'Systolic pressure too low'],
        max: [180, 'Systolic pressure too high']
      },
      diastolic: {
        type: Number,
        required: true,
        min: [50, 'Diastolic pressure too low'],
        max: [100, 'Diastolic pressure too high']
      }
    },
    temperature: {
      type: Number,
      required: true,
      max: [99.5, 'Temperature too high for donation']
    },
    weight: {
      type: Number,
      required: true,
      min: [50, 'Weight too low for donation']
    },
    pulse: {
      type: Number,
      required: true,
      min: [50, 'Pulse rate too low'],
      max: [100, 'Pulse rate too high']
    }
  },
  
  // Health Questionnaire
  healthQuestionnaire: {
    recentIllness: {
      type: Boolean,
      default: false
    },
    medications: [String],
    recentTravel: {
      type: Boolean,
      default: false
    },
    travelDestinations: [String],
    riskFactors: {
      type: Boolean,
      default: false
    },
    previousDonations: {
      type: Number,
      default: 0
    },
    lastDonationDate: Date
  },
  
  // Donation Process
  status: {
    type: String,
    enum: [
      'scheduled',
      'in_progress',
      'screening_failed',
      'completed',
      'cancelled',
      'adverse_reaction'
    ],
    default: 'scheduled'
  },
  
  donationDate: {
    type: Date,
    required: [true, 'Donation date is required']
  },
  
  startTime: Date,
  endTime: Date,
  
  duration: {
    type: Number, // in minutes
    default: 0
  },
  
  // Staff Information
  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  supervisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Blood Bag Information
  bloodBag: {
    bagNumber: {
      type: String,
      required: true,
      unique: true
    },
    expirationDate: {
      type: Date,
      required: true
    },
    storageRequirements: {
      temperature: {
        type: String,
        default: '2-6°C'
      },
      specialHandling: String
    }
  },
  
  // Quality Control
  qualityControl: {
    visualInspection: {
      color: String,
      clarity: String,
      clots: {
        type: Boolean,
        default: false
      }
    },
    testing: {
      bloodTyping: {
        confirmed: {
          type: Boolean,
          default: false
        },
        result: String
      },
      infectiousDiseases: {
        hiv: { type: String, enum: ['pending', 'negative', 'positive'], default: 'pending' },
        hepatitisB: { type: String, enum: ['pending', 'negative', 'positive'], default: 'pending' },
        hepatitisC: { type: String, enum: ['pending', 'negative', 'positive'], default: 'pending' },
        syphilis: { type: String, enum: ['pending', 'negative', 'positive'], default: 'pending' }
      },
      additionalTests: [{
        testName: String,
        result: String,
        testDate: Date
      }]
    }
  },
  
  // Post-Donation Care
  postDonationCare: {
    observationPeriod: {
      type: Number,
      default: 15 // minutes
    },
    adverseReactions: [{
      type: String,
      severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe']
      },
      treatment: String,
      resolvedAt: Date
    }],
    refreshmentsProvided: {
      type: Boolean,
      default: true
    },
    donorInstructions: [String]
  },
  
  // Location and Transport
  collectionLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    address: String
  },
  
  // Notes and Comments
  notes: String,
  staffNotes: String,
  
  // Donation Value and Impact
  estimatedValue: {
    type: Number,
    default: 0 // in local currency
  },
  
  potentialRecipients: {
    type: Number,
    default: 3 // one donation can help up to 3 people
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
donationSchema.index({ donor: 1, donationDate: -1 });
donationSchema.index({ bloodBank: 1, donationDate: -1 });
donationSchema.index({ bloodType: 1, status: 1 });
donationSchema.index({ 'bloodBag.bagNumber': 1 });
donationSchema.index({ status: 1, donationDate: -1 });
donationSchema.index({ collectionLocation: '2dsphere' });

// Virtual for donation age
donationSchema.virtual('ageInDays').get(function() {
  if (this.donationDate) {
    return Math.floor((Date.now() - this.donationDate.getTime()) / (24 * 60 * 60 * 1000));
  }
  return null;
});

// Virtual for blood expiry status
donationSchema.virtual('isExpired').get(function() {
  if (this.bloodBag && this.bloodBag.expirationDate) {
    return this.bloodBag.expirationDate < new Date();
  }
  return false;
});

// Pre-save middleware to calculate duration
donationSchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60));
  }
  next();
});

// Pre-save middleware to set expiration date
donationSchema.pre('save', function(next) {
  if (this.donationDate && !this.bloodBag.expirationDate) {
    const expirationDate = new Date(this.donationDate);
    
    // Different blood components have different shelf lives
    switch (this.donationType) {
      case 'whole_blood':
        expirationDate.setDate(expirationDate.getDate() + 42); // 42 days
        break;
      case 'plasma':
        expirationDate.setFullYear(expirationDate.getFullYear() + 1); // 1 year
        break;
      case 'platelets':
        expirationDate.setDate(expirationDate.getDate() + 5); // 5 days
        break;
      case 'double_red_cells':
        expirationDate.setDate(expirationDate.getDate() + 42); // 42 days
        break;
      default:
        expirationDate.setDate(expirationDate.getDate() + 42);
    }
    
    this.bloodBag.expirationDate = expirationDate;
  }
  next();
});

const Donation = mongoose.model('Donation', donationSchema);

export default Donation;
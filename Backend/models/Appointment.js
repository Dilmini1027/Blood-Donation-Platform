import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  // Participant Information
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Donor information is required']
  },
  
  bloodBank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Blood bank information is required']
  },
  
  // Appointment Details
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required'],
    validate: {
      validator: function(date) {
        return date > new Date();
      },
      message: 'Appointment date must be in the future'
    }
  },
  
  timeSlot: {
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
    },
    duration: {
      type: Number,
      default: 60 // minutes
    }
  },
  
  // Donation Type
  donationType: {
    type: String,
    enum: ['whole_blood', 'plasma', 'platelets', 'double_red_cells'],
    default: 'whole_blood'
  },
  
  // Status Management
  status: {
    type: String,
    enum: [
      'scheduled',
      'confirmed',
      'reminded',
      'checked_in',
      'in_progress',
      'completed',
      'cancelled',
      'no_show',
      'rescheduled'
    ],
    default: 'scheduled'
  },
  
  // Priority Level
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Location Information
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'USA' }
    },
    locationName: String, // Blood bank name or mobile drive location
    roomNumber: String,
    specialInstructions: String
  },
  
  // Pre-appointment Information
  preScreening: {
    lastMealTime: Date,
    waterIntake: {
      type: String,
      enum: ['adequate', 'insufficient'],
      default: 'adequate'
    },
    sleepHours: {
      type: Number,
      min: 0,
      max: 24
    },
    currentMedications: [String],
    recentIllness: {
      type: Boolean,
      default: false
    },
    recentTravel: {
      type: Boolean,
      default: false
    }
  },
  
  // Special Requirements
  specialRequirements: {
    wheelchairAccessible: {
      type: Boolean,
      default: false
    },
    languagePreference: {
      type: String,
      default: 'English'
    },
    accommodations: [String],
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    }
  },
  
  // Reminders and Notifications
  reminders: {
    email: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      scheduledFor: Date
    },
    sms: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      scheduledFor: Date
    },
    call: {
      attempted: {
        type: Boolean,
        default: false
      },
      successful: {
        type: Boolean,
        default: false
      },
      attemptedAt: Date
    }
  },
  
  // Check-in Information
  checkIn: {
    checkedInAt: Date,
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    waitTime: Number, // minutes
    queuePosition: Number
  },
  
  // Staff Assignment
  assignedStaff: {
    phlebotomist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    nurse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Cancellation/Rescheduling
  cancellation: {
    reason: String,
    cancelledBy: {
      type: String,
      enum: ['donor', 'blood_bank', 'system']
    },
    cancelledAt: Date,
    refundRequired: {
      type: Boolean,
      default: false
    }
  },
  
  rescheduling: {
    originalDate: Date,
    reason: String,
    rescheduledBy: {
      type: String,
      enum: ['donor', 'blood_bank', 'system']
    },
    rescheduledAt: Date,
    rescheduleCount: {
      type: Number,
      default: 0,
      max: [3, 'Maximum 3 reschedules allowed']
    }
  },
  
  // Follow-up
  followUp: {
    required: {
      type: Boolean,
      default: false
    },
    reason: String,
    scheduledDate: Date,
    completed: {
      type: Boolean,
      default: false
    },
    notes: String
  },
  
  // Feedback and Rating
  feedback: {
    donorRating: {
      type: Number,
      min: 1,
      max: 5
    },
    donorComments: String,
    bloodBankRating: {
      type: Number,
      min: 1,
      max: 5
    },
    staffRating: {
      type: Number,
      min: 1,
      max: 5
    },
    overallExperience: String,
    suggestions: String
  },
  
  // Administrative
  notes: String,
  internalNotes: String, // Only visible to blood bank staff
  
  // Related Records
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation'
  },
  
  // Compliance and Documentation
  consentForms: {
    generalConsent: {
      signed: {
        type: Boolean,
        default: false
      },
      signedAt: Date,
      documentVersion: String
    },
    medicalHistory: {
      completed: {
        type: Boolean,
        default: false
      },
      completedAt: Date
    },
    riskAssessment: {
      completed: {
        type: Boolean,
        default: false
      },
      completedAt: Date,
      riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high']
      }
    }
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
appointmentSchema.index({ donor: 1, appointmentDate: -1 });
appointmentSchema.index({ bloodBank: 1, appointmentDate: 1 });
appointmentSchema.index({ appointmentDate: 1, status: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ location: '2dsphere' });
appointmentSchema.index({ 'timeSlot.startTime': 1, appointmentDate: 1 });

// Virtual for appointment duration in a readable format
appointmentSchema.virtual('formattedDuration').get(function() {
  if (this.timeSlot && this.timeSlot.duration) {
    const hours = Math.floor(this.timeSlot.duration / 60);
    const minutes = this.timeSlot.duration % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }
  return null;
});

// Virtual to check if appointment is upcoming
appointmentSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  const appointmentDateTime = new Date(this.appointmentDate);
  return appointmentDateTime > now && ['scheduled', 'confirmed', 'reminded'].includes(this.status);
});

// Virtual to check if appointment is overdue
appointmentSchema.virtual('isOverdue').get(function() {
  const now = new Date();
  const appointmentDateTime = new Date(this.appointmentDate);
  return appointmentDateTime < now && ['scheduled', 'confirmed', 'reminded'].includes(this.status);
});

// Pre-save middleware to validate time slots
appointmentSchema.pre('save', function(next) {
  if (this.timeSlot && this.timeSlot.startTime && this.timeSlot.endTime) {
    const [startHour, startMinute] = this.timeSlot.startTime.split(':').map(Number);
    const [endHour, endMinute] = this.timeSlot.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    if (endMinutes <= startMinutes) {
      return next(new Error('End time must be after start time'));
    }
    
    this.timeSlot.duration = endMinutes - startMinutes;
  }
  next();
});

// Pre-save middleware to handle rescheduling
appointmentSchema.pre('save', function(next) {
  if (this.isModified('appointmentDate') && !this.isNew) {
    if (!this.rescheduling.originalDate) {
      this.rescheduling.originalDate = this._original?.appointmentDate || new Date();
    }
    this.rescheduling.rescheduleCount += 1;
    this.rescheduling.rescheduledAt = new Date();
    this.status = 'rescheduled';
  }
  next();
});

// Method to check availability
appointmentSchema.statics.checkAvailability = async function(bloodBankId, date, startTime, endTime) {
  const existingAppointments = await this.find({
    bloodBank: bloodBankId,
    appointmentDate: {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lt: new Date(date.setHours(23, 59, 59, 999))
    },
    status: { $in: ['scheduled', 'confirmed', 'reminded', 'checked_in', 'in_progress'] },
    $or: [
      {
        'timeSlot.startTime': { $lte: startTime },
        'timeSlot.endTime': { $gt: startTime }
      },
      {
        'timeSlot.startTime': { $lt: endTime },
        'timeSlot.endTime': { $gte: endTime }
      },
      {
        'timeSlot.startTime': { $gte: startTime },
        'timeSlot.endTime': { $lte: endTime }
      }
    ]
  });
  
  return existingAppointments.length === 0;
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
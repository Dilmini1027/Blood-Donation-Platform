import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/appointments
// @desc    Create a new appointment
// @access  Private
router.post('/', [
  auth,
  body('bloodBank').isMongoId().withMessage('Valid blood bank ID is required'),
  body('appointmentDate').isISO8601().withMessage('Valid appointment date is required'),
  body('timeSlot.startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time required'),
  body('timeSlot.endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time required'),
  body('donationType').optional().isIn(['whole_blood', 'plasma', 'platelets', 'double_red_cells'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      bloodBank,
      appointmentDate,
      timeSlot,
      donationType,
      specialRequirements,
      notes
    } = req.body;

    // Verify blood bank exists
    const bloodBankUser = await User.findById(bloodBank);
    if (!bloodBankUser || bloodBankUser.role !== 'bloodBank') {
      return res.status(404).json({
        success: false,
        message: 'Blood bank not found'
      });
    }

    // Check if donor is eligible
    const donor = await User.findById(req.user.id);
    if (!donor.medicalHistory?.eligibleToDonate) {
      return res.status(400).json({
        success: false,
        message: 'You are not currently eligible to donate blood'
      });
    }

    // Check appointment date is in the future
    const appointmentDateTime = new Date(appointmentDate);
    if (appointmentDateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date must be in the future'
      });
    }

    // Check time slot availability
    const isAvailable = await Appointment.checkAvailability(
      bloodBank,
      appointmentDateTime,
      timeSlot.startTime,
      timeSlot.endTime
    );

    if (!isAvailable) {
      return res.status(409).json({
        success: false,
        message: 'Selected time slot is not available'
      });
    }

    // Create appointment
    const appointment = new Appointment({
      donor: req.user.id,
      bloodBank,
      appointmentDate: appointmentDateTime,
      timeSlot,
      donationType,
      specialRequirements,
      notes,
      location: bloodBankUser.location
    });

    await appointment.save();

    await appointment.populate([
      { path: 'donor', select: 'firstName lastName email phone bloodType' },
      { path: 'bloodBank', select: 'organizationInfo.name email phone address' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Appointment scheduled successfully',
      data: { appointment }
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/appointments
// @desc    Get appointments
// @access  Private
router.get('/', [
  auth,
  query('status').optional().isIn(['scheduled', 'confirmed', 'reminded', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query;

    // Build query based on user role
    let query = {};

    if (req.user.role === 'donor') {
      query.donor = req.user.id;
    } else if (req.user.role === 'bloodBank') {
      query.bloodBank = req.user.id;
    }

    // Apply filters
    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.appointmentDate = {};
      if (startDate) query.appointmentDate.$gte = new Date(startDate);
      if (endDate) query.appointmentDate.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const appointments = await Appointment.find(query)
      .populate('donor', 'firstName lastName email phone bloodType')
      .populate('bloodBank', 'organizationInfo.name email phone address')
      .populate('donation', 'status quantity bloodBag')
      .sort({ appointmentDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: appointments.length,
          totalRecords: total
        }
      }
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching appointments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get appointment by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('donor', 'firstName lastName email phone bloodType address')
      .populate('bloodBank', 'organizationInfo.name email phone address')
      .populate('donation', 'status quantity bloodBag donationDate')
      .populate('assignedStaff.phlebotomist', 'firstName lastName')
      .populate('assignedStaff.nurse', 'firstName lastName')
      .populate('assignedStaff.supervisor', 'firstName lastName');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    if (req.user.role === 'donor' && appointment.donor._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (req.user.role === 'bloodBank' && appointment.bloodBank._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { appointment }
    });

  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    const isAuthorized = 
      (req.user.role === 'donor' && appointment.donor.toString() === req.user.id) ||
      (req.user.role === 'bloodBank' && appointment.bloodBank.toString() === req.user.id) ||
      req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Define allowed updates based on role
    let allowedUpdates = [];
    
    if (req.user.role === 'donor') {
      allowedUpdates = ['specialRequirements', 'notes', 'preScreening'];
    } else if (req.user.role === 'bloodBank') {
      allowedUpdates = [
        'status', 'assignedStaff', 'checkIn', 'reminders', 
        'internalNotes', 'followUp', 'consentForms'
      ];
    } else if (req.user.role === 'admin') {
      allowedUpdates = Object.keys(req.body);
    }

    // Prevent status changes if appointment is completed
    if (appointment.status === 'completed' && req.body.status && req.body.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify completed appointment'
      });
    }

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        appointment[field] = req.body[field];
      }
    });

    await appointment.save();

    await appointment.populate([
      { path: 'donor', select: 'firstName lastName email phone bloodType' },
      { path: 'bloodBank', select: 'organizationInfo.name email phone' }
    ]);

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: { appointment }
    });

  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Cancel appointment
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    const isAuthorized = 
      (req.user.role === 'donor' && appointment.donor.toString() === req.user.id) ||
      (req.user.role === 'bloodBank' && appointment.bloodBank.toString() === req.user.id) ||
      req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Cannot cancel completed appointments
    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed appointment'
      });
    }

    // Update appointment status
    appointment.status = 'cancelled';
    appointment.cancellation = {
      reason: req.body.reason || 'No reason provided',
      cancelledBy: req.user.role,
      cancelledAt: new Date()
    };

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/appointments/availability/:bloodBankId
// @desc    Check appointment availability
// @access  Private
router.get('/availability/:bloodBankId', auth, async (req, res) => {
  try {
    const { bloodBankId } = req.params;
    const { date, duration = 60 } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    const bloodBank = await User.findById(bloodBankId);
    if (!bloodBank || bloodBank.role !== 'bloodBank') {
      return res.status(404).json({
        success: false,
        message: 'Blood bank not found'
      });
    }

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
    
    // Get blood bank operating hours
    const operatingHours = bloodBank.organizationInfo?.operatingHours?.[dayOfWeek];
    
    if (!operatingHours || !operatingHours.open || !operatingHours.close) {
      return res.json({
        success: true,
        data: {
          availableSlots: [],
          message: 'Blood bank is closed on this day'
        }
      });
    }

    // Get existing appointments for the date
    const existingAppointments = await Appointment.find({
      bloodBank: bloodBankId,
      appointmentDate: {
        $gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
        $lt: new Date(selectedDate.setHours(23, 59, 59, 999))
      },
      status: { $in: ['scheduled', 'confirmed', 'reminded', 'checked_in', 'in_progress'] }
    });

    // Generate available time slots
    const availableSlots = [];
    const [openHour, openMinute] = operatingHours.open.split(':').map(Number);
    const [closeHour, closeMinute] = operatingHours.close.split(':').map(Number);
    
    let currentTime = openHour * 60 + openMinute;
    const closeTime = closeHour * 60 + closeMinute;
    
    while (currentTime + parseInt(duration) <= closeTime) {
      const startHour = Math.floor(currentTime / 60);
      const startMinute = currentTime % 60;
      const endTime = currentTime + parseInt(duration);
      const endHour = Math.floor(endTime / 60);
      const endMin = endTime % 60;
      
      const startTimeStr = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
      const endTimeStr = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
      
      // Check if slot conflicts with existing appointments
      const hasConflict = existingAppointments.some(apt => {
        const [aptStartHour, aptStartMinute] = apt.timeSlot.startTime.split(':').map(Number);
        const [aptEndHour, aptEndMinute] = apt.timeSlot.endTime.split(':').map(Number);
        const aptStartTime = aptStartHour * 60 + aptStartMinute;
        const aptEndTime = aptEndHour * 60 + aptEndMinute;
        
        return (currentTime < aptEndTime && endTime > aptStartTime);
      });
      
      if (!hasConflict) {
        availableSlots.push({
          startTime: startTimeStr,
          endTime: endTimeStr,
          duration: parseInt(duration)
        });
      }
      
      currentTime += parseInt(duration); // Move to next slot
    }

    res.json({
      success: true,
      data: {
        date,
        availableSlots,
        operatingHours
      }
    });

  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking availability',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
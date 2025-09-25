import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Donation from '../models/Donation.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/donations
// @desc    Create a new donation record
// @access  Private (Blood Bank, Admin)
router.post('/', [
  auth,
  authorize(['bloodBank', 'admin']),
  body('donor').isMongoId().withMessage('Valid donor ID is required'),
  body('donationType').isIn(['whole_blood', 'plasma', 'platelets', 'double_red_cells']),
  body('bloodType').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  body('quantity').isNumeric().isFloat({ min: 350, max: 500 }),
  body('donationDate').isISO8601().withMessage('Valid donation date is required')
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
      donor,
      appointment,
      donationType,
      bloodType,
      quantity,
      donationDate,
      preScreening,
      healthQuestionnaire,
      collectedBy,
      supervisedBy,
      notes
    } = req.body;

    // Verify donor exists and is eligible
    const donorUser = await User.findById(donor);
    if (!donorUser || donorUser.role !== 'donor') {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    if (!donorUser.medicalHistory?.eligibleToDonate) {
      return res.status(400).json({
        success: false,
        message: 'Donor is not eligible to donate'
      });
    }

    // Check if donor has donated recently (3 months minimum gap)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    if (donorUser.medicalHistory?.lastDonationDate && 
        donorUser.medicalHistory.lastDonationDate > threeMonthsAgo) {
      return res.status(400).json({
        success: false,
        message: 'Donor must wait at least 3 months between donations'
      });
    }

    // Generate unique blood bag number
    const bagNumber = `BB${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create donation record
    const donation = new Donation({
      donor,
      bloodBank: req.user.id,
      appointment,
      donationType,
      bloodType,
      quantity,
      donationDate,
      preScreening,
      healthQuestionnaire,
      collectedBy,
      supervisedBy,
      notes,
      bloodBag: {
        bagNumber
      },
      status: 'completed'
    });

    await donation.save();

    // Update donor's last donation date
    donorUser.medicalHistory.lastDonationDate = donationDate;
    await donorUser.save();

    // Update appointment status if linked
    if (appointment) {
      await Appointment.findByIdAndUpdate(appointment, {
        status: 'completed',
        donation: donation._id
      });
    }

    await donation.populate([
      { path: 'donor', select: 'firstName lastName bloodType email phone' },
      { path: 'bloodBank', select: 'organizationInfo.name email' },
      { path: 'collectedBy', select: 'firstName lastName' },
      { path: 'supervisedBy', select: 'firstName lastName' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Donation recorded successfully',
      data: { donation }
    });

  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating donation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/donations
// @desc    Get donations
// @access  Private
router.get('/', [
  auth,
  query('donor').optional().isMongoId(),
  query('bloodBank').optional().isMongoId(),
  query('bloodType').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  query('status').optional().isIn(['scheduled', 'in_progress', 'screening_failed', 'completed', 'cancelled', 'adverse_reaction']),
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
      donor,
      bloodBank,
      bloodType,
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
    if (donor && ['bloodBank', 'admin'].includes(req.user.role)) {
      query.donor = donor;
    }

    if (bloodBank && ['admin'].includes(req.user.role)) {
      query.bloodBank = bloodBank;
    }

    if (bloodType) {
      query.bloodType = bloodType;
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.donationDate = {};
      if (startDate) query.donationDate.$gte = new Date(startDate);
      if (endDate) query.donationDate.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const donations = await Donation.find(query)
      .populate('donor', 'firstName lastName bloodType email phone')
      .populate('bloodBank', 'organizationInfo.name email phone address')
      .populate('appointment', 'appointmentDate timeSlot')
      .populate('collectedBy', 'firstName lastName')
      .populate('supervisedBy', 'firstName lastName')
      .sort({ donationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Donation.countDocuments(query);

    res.json({
      success: true,
      data: {
        donations,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: donations.length,
          totalRecords: total
        }
      }
    });

  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching donations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/donations/:id
// @desc    Get donation by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'firstName lastName bloodType email phone address')
      .populate('bloodBank', 'organizationInfo.name email phone address')
      .populate('appointment', 'appointmentDate timeSlot location')
      .populate('collectedBy', 'firstName lastName')
      .populate('supervisedBy', 'firstName lastName');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Check authorization
    if (req.user.role === 'donor' && donation.donor._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (req.user.role === 'bloodBank' && donation.bloodBank._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { donation }
    });

  } catch (error) {
    console.error('Get donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching donation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/donations/:id
// @desc    Update donation
// @access  Private (Blood Bank, Admin)
router.put('/:id', [
  auth,
  authorize(['bloodBank', 'admin'])
], async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Check authorization for blood bank
    if (req.user.role === 'bloodBank' && donation.bloodBank.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const allowedUpdates = [
      'status', 'preScreening', 'healthQuestionnaire', 'qualityControl',
      'postDonationCare', 'notes', 'staffNotes', 'endTime'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        donation[field] = req.body[field];
      }
    });

    await donation.save();

    await donation.populate([
      { path: 'donor', select: 'firstName lastName bloodType email phone' },
      { path: 'bloodBank', select: 'organizationInfo.name email' },
      { path: 'collectedBy', select: 'firstName lastName' },
      { path: 'supervisedBy', select: 'firstName lastName' }
    ]);

    res.json({
      success: true,
      message: 'Donation updated successfully',
      data: { donation }
    });

  } catch (error) {
    console.error('Update donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating donation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/donations/stats/overview
// @desc    Get donation statistics
// @access  Private
router.get('/stats/overview', auth, async (req, res) => {
  try {
    let matchStage = {};

    // Filter based on user role
    if (req.user.role === 'donor') {
      matchStage.donor = req.user.id;
    } else if (req.user.role === 'bloodBank') {
      matchStage.bloodBank = req.user.id;
    }

    const stats = await Donation.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalDonations: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          averageQuantity: { $avg: '$quantity' },
          completedDonations: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          bloodTypeBreakdown: {
            $push: '$bloodType'
          }
        }
      }
    ]);

    const bloodTypeStats = await Donation.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$bloodType',
          count: { $sum: 1 },
          quantity: { $sum: '$quantity' }
        }
      }
    ]);

    const monthlyTrends = await Donation.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$donationDate' },
            month: { $month: '$donationDate' }
          },
          count: { $sum: 1 },
          quantity: { $sum: '$quantity' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalDonations: 0,
          totalQuantity: 0,
          averageQuantity: 0,
          completedDonations: 0
        },
        bloodTypeBreakdown: bloodTypeStats,
        monthlyTrends: monthlyTrends.reverse()
      }
    });

  } catch (error) {
    console.error('Get donation stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching donation statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
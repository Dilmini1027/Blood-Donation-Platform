import express from 'express';
import { body, query, validationResult } from 'express-validator';
import User from '../models/User.js';
import Donation from '../models/Donation.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
  body('firstName').optional().trim().isLength({ min: 1 }).withMessage('First name cannot be empty'),
  body('lastName').optional().trim().isLength({ min: 1 }).withMessage('Last name cannot be empty'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required')
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

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'firstName', 'lastName', 'phone', 'address', 'preferences',
      'medicalHistory', 'organizationInfo'
    ];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/users/donors
// @desc    Get all donors (for blood banks and hospitals)
// @access  Private (Blood Bank, Hospital, Admin)
router.get('/donors', [
  auth,
  authorize(['bloodBank', 'hospital', 'admin']),
  query('bloodType').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  query('location').optional().isObject(),
  query('available').optional().isBoolean(),
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
      bloodType,
      location,
      available,
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    const query = {
      role: 'donor',
      isActive: true,
      isEmailVerified: true
    };

    if (bloodType) {
      query.bloodType = bloodType;
    }

    if (available === 'true') {
      query['medicalHistory.eligibleToDonate'] = true;
      // Add logic to filter donors who haven't donated recently
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      query['medicalHistory.lastDonationDate'] = { $lt: threeMonthsAgo };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let aggregationPipeline = [
      { $match: query },
      {
        $project: {
          password: 0,
          passwordResetToken: 0,
          passwordResetExpires: 0,
          emailVerificationToken: 0,
          emailVerificationExpires: 0,
          loginAttempts: 0,
          lockUntil: 0
        }
      },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ];

    // Add location-based sorting if location is provided
    if (location && location.coordinates) {
      aggregationPipeline.unshift({
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [
              parseFloat(location.coordinates[0]),
              parseFloat(location.coordinates[1])
            ]
          },
          distanceField: 'distance',
          maxDistance: location.maxDistance || 50000, // 50km default
          spherical: true
        }
      });
    }

    const donors = await User.aggregate(aggregationPipeline);
    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        donors,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: donors.length,
          totalRecords: total
        }
      }
    });

  } catch (error) {
    console.error('Get donors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching donors',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/users/blood-banks
// @desc    Get all blood banks
// @access  Private
router.get('/blood-banks', [
  auth,
  query('location').optional().isObject(),
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
      location,
      page = 1,
      limit = 10
    } = req.query;

    const query = {
      role: 'bloodBank',
      isActive: true
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let aggregationPipeline = [
      { $match: query },
      {
        $project: {
          password: 0,
          passwordResetToken: 0,
          passwordResetExpires: 0,
          emailVerificationToken: 0,
          emailVerificationExpires: 0,
          loginAttempts: 0,
          lockUntil: 0,
          medicalHistory: 0
        }
      },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ];

    // Add location-based sorting if location is provided
    if (location && location.coordinates) {
      aggregationPipeline.unshift({
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [
              parseFloat(location.coordinates[0]),
              parseFloat(location.coordinates[1])
            ]
          },
          distanceField: 'distance',
          maxDistance: location.maxDistance || 100000, // 100km default
          spherical: true
        }
      });
    }

    const bloodBanks = await User.aggregate(aggregationPipeline);
    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        bloodBanks,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: bloodBanks.length,
          totalRecords: total
        }
      }
    });

  } catch (error) {
    console.error('Get blood banks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching blood banks',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/users/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let dashboardData = {
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage
      }
    };

    if (user.role === 'donor') {
      // Get donor-specific dashboard data
      const donationStats = await Donation.aggregate([
        { $match: { donor: user._id } },
        {
          $group: {
            _id: null,
            totalDonations: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' },
            lastDonation: { $max: '$donationDate' }
          }
        }
      ]);

      const recentDonations = await Donation.find({ donor: user._id })
        .populate('bloodBank', 'organizationInfo.name')
        .sort({ donationDate: -1 })
        .limit(5);

      dashboardData.donorStats = {
        totalDonations: donationStats[0]?.totalDonations || 0,
        totalQuantity: donationStats[0]?.totalQuantity || 0,
        lastDonation: donationStats[0]?.lastDonation,
        recentDonations,
        nextEligibleDate: user.medicalHistory?.lastDonationDate ? 
          new Date(user.medicalHistory.lastDonationDate.getTime() + (90 * 24 * 60 * 60 * 1000)) : 
          new Date()
      };
    }

    if (user.role === 'bloodBank') {
      // Get blood bank-specific dashboard data
      const donationStats = await Donation.aggregate([
        { $match: { bloodBank: user._id } },
        {
          $group: {
            _id: null,
            totalCollections: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' },
            averageQuantity: { $avg: '$quantity' }
          }
        }
      ]);

      const bloodTypeStats = await Donation.aggregate([
        { $match: { bloodBank: user._id, status: 'completed' } },
        {
          $group: {
            _id: '$bloodType',
            count: { $sum: 1 },
            quantity: { $sum: '$quantity' }
          }
        }
      ]);

      const recentDonations = await Donation.find({ bloodBank: user._id })
        .populate('donor', 'firstName lastName bloodType')
        .sort({ donationDate: -1 })
        .limit(10);

      dashboardData.bloodBankStats = {
        totalCollections: donationStats[0]?.totalCollections || 0,
        totalQuantity: donationStats[0]?.totalQuantity || 0,
        averageQuantity: donationStats[0]?.averageQuantity || 0,
        bloodTypeBreakdown: bloodTypeStats,
        recentDonations
      };
    }

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
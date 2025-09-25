import express from 'express';
import { query, validationResult } from 'express-validator';
import User from '../models/User.js';
import Donation from '../models/Donation.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/donors
// @desc    Get donors with filtering options
// @access  Private (Blood Bank, Hospital, Admin)
router.get('/', [
  auth,
  authorize(['bloodBank', 'hospital', 'admin']),
  query('bloodType').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  query('location').optional().isObject(),
  query('available').optional().isBoolean(),
  query('minAge').optional().isInt({ min: 18, max: 100 }),
  query('maxAge').optional().isInt({ min: 18, max: 100 }),
  query('gender').optional().isIn(['male', 'female', 'other']),
  query('lastDonationBefore').optional().isISO8601(),
  query('lastDonationAfter').optional().isISO8601(),
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
      minAge,
      maxAge,
      gender,
      lastDonationBefore,
      lastDonationAfter,
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

    if (gender) {
      query.gender = gender;
    }

    // Age filtering (using date of birth)
    if (minAge || maxAge) {
      const currentDate = new Date();
      query.dateOfBirth = {};
      
      if (maxAge) {
        const maxDate = new Date(currentDate.getFullYear() - parseInt(maxAge), currentDate.getMonth(), currentDate.getDate());
        query.dateOfBirth.$gte = maxDate;
      }
      
      if (minAge) {
        const minDate = new Date(currentDate.getFullYear() - parseInt(minAge), currentDate.getMonth(), currentDate.getDate());
        query.dateOfBirth.$lte = minDate;
      }
    }

    // Availability filtering
    if (available === 'true') {
      query['medicalHistory.eligibleToDonate'] = true;
      
      // Filter donors who haven't donated recently (3 months)
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      query.$or = [
        { 'medicalHistory.lastDonationDate': { $exists: false } },
        { 'medicalHistory.lastDonationDate': null },
        { 'medicalHistory.lastDonationDate': { $lt: threeMonthsAgo } }
      ];
    }

    // Last donation date filtering
    if (lastDonationBefore || lastDonationAfter) {
      if (!query['medicalHistory.lastDonationDate']) {
        query['medicalHistory.lastDonationDate'] = {};
      }
      
      if (lastDonationBefore) {
        query['medicalHistory.lastDonationDate'].$lt = new Date(lastDonationBefore);
      }
      
      if (lastDonationAfter) {
        query['medicalHistory.lastDonationDate'].$gt = new Date(lastDonationAfter);
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let aggregationPipeline = [
      { $match: query },
      {
        $addFields: {
          age: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), '$dateOfBirth'] },
                365.25 * 24 * 60 * 60 * 1000
              ]
            }
          }
        }
      },
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
          spherical: true,
          query: query
        }
      });
      
      // Remove the match stage since geoNear handles filtering
      aggregationPipeline = aggregationPipeline.slice(1);
    }

    const donors = await User.aggregate(aggregationPipeline);
    const total = await User.countDocuments(query);

    // Get donation statistics for each donor
    const donorIds = donors.map(donor => donor._id);
    const donationStats = await Donation.aggregate([
      { $match: { donor: { $in: donorIds }, status: 'completed' } },
      {
        $group: {
          _id: '$donor',
          totalDonations: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          lastDonation: { $max: '$donationDate' }
        }
      }
    ]);

    // Merge donation stats with donor data
    const donorsWithStats = donors.map(donor => {
      const stats = donationStats.find(stat => stat._id.toString() === donor._id.toString());
      return {
        ...donor,
        donationHistory: {
          totalDonations: stats?.totalDonations || 0,
          totalQuantity: stats?.totalQuantity || 0,
          lastDonation: stats?.lastDonation || null
        }
      };
    });

    res.json({
      success: true,
      data: {
        donors: donorsWithStats,
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

// @route   GET /api/donors/:id
// @desc    Get donor profile by ID
// @access  Private (Blood Bank, Hospital, Admin)
router.get('/:id', [
  auth,
  authorize(['bloodBank', 'hospital', 'admin'])
], async (req, res) => {
  try {
    const donor = await User.findOne({
      _id: req.params.id,
      role: 'donor'
    }).select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires -loginAttempts -lockUntil');

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    // Get donation history
    const donations = await Donation.find({ donor: donor._id, status: 'completed' })
      .populate('bloodBank', 'organizationInfo.name')
      .sort({ donationDate: -1 })
      .limit(10);

    // Get donation statistics
    const donationStats = await Donation.aggregate([
      { $match: { donor: donor._id, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalDonations: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          averageQuantity: { $avg: '$quantity' },
          firstDonation: { $min: '$donationDate' },
          lastDonation: { $max: '$donationDate' }
        }
      }
    ]);

    // Check eligibility status
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const isEligible = donor.medicalHistory?.eligibleToDonate && 
      (!donor.medicalHistory?.lastDonationDate || donor.medicalHistory.lastDonationDate < threeMonthsAgo);

    let nextEligibleDate = null;
    if (donor.medicalHistory?.lastDonationDate) {
      nextEligibleDate = new Date(donor.medicalHistory.lastDonationDate);
      nextEligibleDate.setMonth(nextEligibleDate.getMonth() + 3);
    }

    res.json({
      success: true,
      data: {
        donor,
        donationHistory: {
          recent: donations,
          statistics: donationStats[0] || {
            totalDonations: 0,
            totalQuantity: 0,
            averageQuantity: 0,
            firstDonation: null,
            lastDonation: null
          }
        },
        eligibility: {
          isEligible,
          nextEligibleDate,
          reasonsIfIneligible: !isEligible ? [
            !donor.medicalHistory?.eligibleToDonate ? 'Medical conditions prevent donation' : null,
            donor.medicalHistory?.lastDonationDate && donor.medicalHistory.lastDonationDate >= threeMonthsAgo ? 
              'Must wait 3 months between donations' : null
          ].filter(Boolean) : []
        }
      }
    });

  } catch (error) {
    console.error('Get donor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching donor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/donors/search/eligible
// @desc    Search for eligible donors by blood type
// @access  Private (Blood Bank, Hospital, Admin)
router.get('/search/eligible', [
  auth,
  authorize(['bloodBank', 'hospital', 'admin']),
  query('bloodType').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Valid blood type required'),
  query('urgency').optional().isIn(['low', 'normal', 'high', 'critical']),
  query('location').optional().isObject(),
  query('limit').optional().isInt({ min: 1, max: 50 })
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

    const { bloodType, urgency, location, limit = 20 } = req.query;

    // Define compatible blood types for transfusion
    const compatibilityMap = {
      'A+': ['A+', 'A-', 'O+', 'O-'],
      'A-': ['A-', 'O-'],
      'B+': ['B+', 'B-', 'O+', 'O-'],
      'B-': ['B-', 'O-'],
      'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      'AB-': ['A-', 'B-', 'AB-', 'O-'],
      'O+': ['O+', 'O-'],
      'O-': ['O-']
    };

    const compatibleTypes = compatibilityMap[bloodType] || [bloodType];

    // Build query for eligible donors
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const query = {
      role: 'donor',
      isActive: true,
      isEmailVerified: true,
      bloodType: { $in: compatibleTypes },
      'medicalHistory.eligibleToDonate': true,
      $or: [
        { 'medicalHistory.lastDonationDate': { $exists: false } },
        { 'medicalHistory.lastDonationDate': null },
        { 'medicalHistory.lastDonationDate': { $lt: threeMonthsAgo } }
      ]
    };

    let aggregationPipeline = [
      { $match: query },
      {
        $addFields: {
          compatibilityScore: {
            $switch: {
              branches: [
                { case: { $eq: ['$bloodType', bloodType] }, then: 10 },
                { case: { $eq: ['$bloodType', 'O-'] }, then: 9 },
                { case: { $eq: ['$bloodType', 'O+'] }, then: 8 },
              ],
              default: 5
            }
          },
          daysSinceLastDonation: {
            $cond: {
              if: { $ne: ['$medicalHistory.lastDonationDate', null] },
              then: {
                $divide: [
                  { $subtract: [new Date(), '$medicalHistory.lastDonationDate'] },
                  24 * 60 * 60 * 1000
                ]
              },
              else: 365
            }
          }
        }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          phone: 1,
          bloodType: 1,
          address: 1,
          location: 1,
          medicalHistory: 1,
          compatibilityScore: 1,
          daysSinceLastDonation: 1,
          age: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), '$dateOfBirth'] },
                365.25 * 24 * 60 * 60 * 1000
              ]
            }
          }
        }
      },
      { $sort: { compatibilityScore: -1, daysSinceLastDonation: -1 } },
      { $limit: parseInt(limit) }
    ];

    // Add location-based sorting for urgent cases
    if (urgency === 'critical' || urgency === 'high') {
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
            maxDistance: urgency === 'critical' ? 25000 : 50000, // 25km for critical, 50km for high
            spherical: true,
            query: query
          }
        });
        
        // Remove the match stage since geoNear handles filtering
        aggregationPipeline = aggregationPipeline.slice(1);
        
        // Sort by distance for urgent cases
        const sortIndex = aggregationPipeline.findIndex(stage => stage.$sort);
        if (sortIndex !== -1) {
          aggregationPipeline[sortIndex].$sort = { 
            distance: 1, 
            compatibilityScore: -1, 
            daysSinceLastDonation: -1 
          };
        }
      }
    }

    const eligibleDonors = await User.aggregate(aggregationPipeline);

    res.json({
      success: true,
      data: {
        bloodType,
        urgency: urgency || 'normal',
        compatibleTypes,
        eligibleDonors,
        count: eligibleDonors.length,
        message: eligibleDonors.length === 0 ? 
          'No eligible donors found for the specified criteria' : 
          `Found ${eligibleDonors.length} eligible donors`
      }
    });

  } catch (error) {
    console.error('Search eligible donors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching for eligible donors',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
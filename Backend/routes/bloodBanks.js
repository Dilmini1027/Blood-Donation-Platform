import express from 'express';
import { query, validationResult } from 'express-validator';
import User from '../models/User.js';
import Donation from '../models/Donation.js';
import Appointment from '../models/Appointment.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/blood-banks
// @desc    Get all blood banks
// @access  Public (with optional authentication for enhanced data)
router.get('/', [
  query('location').optional().isObject(),
  query('services').optional().isArray(),
  query('operatingStatus').optional().isIn(['open', 'closed', 'emergency_only']),
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
      services,
      operatingStatus,
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
          firstName: 1,
          lastName: 1,
          email: 1,
          phone: 1,
          address: 1,
          location: 1,
          organizationInfo: 1,
          profileImage: 1,
          createdAt: 1,
          // Don't expose sensitive information
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
          spherical: true,
          query: query
        }
      });
      
      // Remove the match stage since geoNear handles filtering
      aggregationPipeline = aggregationPipeline.slice(1);
    }

    const bloodBanks = await User.aggregate(aggregationPipeline);
    const total = await User.countDocuments(query);

    // Get additional statistics for each blood bank
    const bloodBankIds = bloodBanks.map(bb => bb._id);
    
    const donationStats = await Donation.aggregate([
      { $match: { bloodBank: { $in: bloodBankIds }, status: 'completed' } },
      {
        $group: {
          _id: '$bloodBank',
          totalCollections: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          lastCollection: { $max: '$donationDate' },
          bloodTypeBreakdown: {
            $push: '$bloodType'
          }
        }
      }
    ]);

    const appointmentStats = await Appointment.aggregate([
      { $match: { bloodBank: { $in: bloodBankIds } } },
      {
        $group: {
          _id: '$bloodBank',
          totalAppointments: { $sum: 1 },
          upcomingAppointments: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $gte: ['$appointmentDate', new Date()] },
                    { $in: ['$status', ['scheduled', 'confirmed', 'reminded']] }
                  ]
                }, 
                1, 
                0
              ]
            }
          }
        }
      }
    ]);

    // Merge statistics with blood bank data
    const bloodBanksWithStats = bloodBanks.map(bloodBank => {
      const donationStat = donationStats.find(stat => stat._id.toString() === bloodBank._id.toString());
      const appointmentStat = appointmentStats.find(stat => stat._id.toString() === bloodBank._id.toString());
      
      // Determine current operating status
      let currentStatus = 'closed';
      if (bloodBank.organizationInfo?.operatingHours) {
        const now = new Date();
        const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const todayHours = bloodBank.organizationInfo.operatingHours[dayOfWeek];
        
        if (todayHours && todayHours.open && todayHours.close) {
          const [openHour, openMinute] = todayHours.open.split(':').map(Number);
          const [closeHour, closeMinute] = todayHours.close.split(':').map(Number);
          const openTime = openHour * 60 + openMinute;
          const closeTime = closeHour * 60 + closeMinute;
          
          if (currentTime >= openTime && currentTime <= closeTime) {
            currentStatus = 'open';
          }
        }
      }

      return {
        ...bloodBank,
        statistics: {
          donations: {
            total: donationStat?.totalCollections || 0,
            totalQuantity: donationStat?.totalQuantity || 0,
            lastCollection: donationStat?.lastCollection || null,
            bloodTypeBreakdown: donationStat?.bloodTypeBreakdown || []
          },
          appointments: {
            total: appointmentStat?.totalAppointments || 0,
            upcoming: appointmentStat?.upcomingAppointments || 0
          }
        },
        currentStatus,
        rating: {
          average: 4.2, // This would come from a reviews system
          totalReviews: 150 // This would come from a reviews system
        }
      };
    });

    res.json({
      success: true,
      data: {
        bloodBanks: bloodBanksWithStats,
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

// @route   GET /api/blood-banks/:id
// @desc    Get blood bank profile by ID
// @access  Public (with optional authentication for enhanced data)
router.get('/:id', async (req, res) => {
  try {
    const bloodBank = await User.findOne({
      _id: req.params.id,
      role: 'bloodBank',
      isActive: true
    }).select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires -loginAttempts -lockUntil -medicalHistory');

    if (!bloodBank) {
      return res.status(404).json({
        success: false,
        message: 'Blood bank not found'
      });
    }

    // Get detailed statistics
    const donationStats = await Donation.aggregate([
      { $match: { bloodBank: bloodBank._id, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalCollections: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          averageQuantity: { $avg: '$quantity' },
          firstCollection: { $min: '$donationDate' },
          lastCollection: { $max: '$donationDate' }
        }
      }
    ]);

    const bloodTypeStats = await Donation.aggregate([
      { $match: { bloodBank: bloodBank._id, status: 'completed' } },
      {
        $group: {
          _id: '$bloodType',
          count: { $sum: 1 },
          quantity: { $sum: '$quantity' },
          lastCollection: { $max: '$donationDate' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const recentDonations = await Donation.find({ 
      bloodBank: bloodBank._id, 
      status: 'completed' 
    })
      .populate('donor', 'firstName lastName bloodType')
      .sort({ donationDate: -1 })
      .limit(10);

    const upcomingAppointments = await Appointment.find({
      bloodBank: bloodBank._id,
      appointmentDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed', 'reminded'] }
    })
      .populate('donor', 'firstName lastName bloodType')
      .sort({ appointmentDate: 1 })
      .limit(10);

    // Calculate current operating status
    let currentStatus = 'closed';
    let nextOpenTime = null;
    
    if (bloodBank.organizationInfo?.operatingHours) {
      const now = new Date();
      const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const todayHours = bloodBank.organizationInfo.operatingHours[dayOfWeek];
      
      if (todayHours && todayHours.open && todayHours.close) {
        const [openHour, openMinute] = todayHours.open.split(':').map(Number);
        const [closeHour, closeMinute] = todayHours.close.split(':').map(Number);
        const openTime = openHour * 60 + openMinute;
        const closeTime = closeHour * 60 + closeMinute;
        
        if (currentTime >= openTime && currentTime <= closeTime) {
          currentStatus = 'open';
        } else if (currentTime < openTime) {
          nextOpenTime = `${todayHours.open} today`;
        } else {
          // Find next day they're open
          const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          let nextDay = (now.getDay() + 1) % 7;
          let daysToCheck = 7;
          
          while (daysToCheck > 0) {
            const nextDayName = daysOfWeek[nextDay];
            const nextDayHours = bloodBank.organizationInfo.operatingHours[nextDayName];
            
            if (nextDayHours && nextDayHours.open) {
              const dayName = nextDay === (now.getDay() + 1) % 7 ? 'tomorrow' : 
                          nextDayName.charAt(0).toUpperCase() + nextDayName.slice(1);
              nextOpenTime = `${nextDayHours.open} ${dayName}`;
              break;
            }
            
            nextDay = (nextDay + 1) % 7;
            daysToCheck--;
          }
        }
      }
    }

    res.json({
      success: true,
      data: {
        bloodBank,
        statistics: {
          donations: donationStats[0] || {
            totalCollections: 0,
            totalQuantity: 0,
            averageQuantity: 0,
            firstCollection: null,
            lastCollection: null
          },
          bloodTypeBreakdown: bloodTypeStats,
          recentActivity: {
            recentDonations,
            upcomingAppointments
          }
        },
        operatingStatus: {
          current: currentStatus,
          nextOpenTime
        },
        rating: {
          average: 4.2, // This would come from a reviews system
          totalReviews: 150, // This would come from a reviews system
          breakdown: {
            5: 75,
            4: 45,
            3: 20,
            2: 7,
            1: 3
          }
        }
      }
    });

  } catch (error) {
    console.error('Get blood bank error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching blood bank',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/blood-banks/:id/inventory
// @desc    Get blood bank inventory
// @access  Private (Blood Bank staff, Admin)
router.get('/:id/inventory', [
  auth,
  authorize(['bloodBank', 'admin'])
], async (req, res) => {
  try {
    const bloodBank = await User.findOne({
      _id: req.params.id,
      role: 'bloodBank'
    });

    if (!bloodBank) {
      return res.status(404).json({
        success: false,
        message: 'Blood bank not found'
      });
    }

    // Check authorization for blood bank users
    if (req.user.role === 'bloodBank' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get current inventory (completed donations that haven't expired)
    const currentDate = new Date();
    
    const inventory = await Donation.aggregate([
      {
        $match: {
          bloodBank: bloodBank._id,
          status: 'completed',
          'bloodBag.expirationDate': { $gt: currentDate }
        }
      },
      {
        $group: {
          _id: '$bloodType',
          totalUnits: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          averageAge: {
            $avg: {
              $divide: [
                { $subtract: [currentDate, '$donationDate'] },
                24 * 60 * 60 * 1000
              ]
            }
          },
          expiringIn7Days: {
            $sum: {
              $cond: [
                {
                  $lte: [
                    '$bloodBag.expirationDate',
                    new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000)
                  ]
                },
                1,
                0
              ]
            }
          },
          expiringIn30Days: {
            $sum: {
              $cond: [
                {
                  $lte: [
                    '$bloodBag.expirationDate',
                    new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000)
                  ]
                },
                1,
                0
              ]
            }
          },
          oldestUnit: { $min: '$donationDate' },
          newestUnit: { $max: '$donationDate' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get expired inventory
    const expiredInventory = await Donation.aggregate([
      {
        $match: {
          bloodBank: bloodBank._id,
          status: 'completed',
          'bloodBag.expirationDate': { $lt: currentDate }
        }
      },
      {
        $group: {
          _id: '$bloodType',
          expiredUnits: { $sum: 1 },
          expiredQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    // Calculate total inventory summary
    const summary = {
      totalUnits: inventory.reduce((sum, item) => sum + item.totalUnits, 0),
      totalQuantity: inventory.reduce((sum, item) => sum + item.totalQuantity, 0),
      totalExpiring7Days: inventory.reduce((sum, item) => sum + item.expiringIn7Days, 0),
      totalExpiring30Days: inventory.reduce((sum, item) => sum + item.expiringIn30Days, 0),
      totalExpired: expiredInventory.reduce((sum, item) => sum + item.expiredUnits, 0)
    };

    // Merge expired data with current inventory
    const inventoryWithExpired = inventory.map(item => {
      const expired = expiredInventory.find(exp => exp._id === item._id);
      return {
        ...item,
        expiredUnits: expired?.expiredUnits || 0,
        expiredQuantity: expired?.expiredQuantity || 0
      };
    });

    res.json({
      success: true,
      data: {
        summary,
        inventory: inventoryWithExpired,
        lastUpdated: new Date(),
        recommendations: {
          criticalLevels: inventoryWithExpired.filter(item => item.totalUnits < 10),
          expiringSoon: inventoryWithExpired.filter(item => item.expiringIn7Days > 0),
          overstocked: inventoryWithExpired.filter(item => item.totalUnits > 50)
        }
      }
    });

  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching inventory',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/blood-banks/search/nearby
// @desc    Find nearby blood banks
// @access  Public
router.get('/search/nearby', [
  query('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  query('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  query('maxDistance').optional().isInt({ min: 1, max: 500 }).withMessage('Max distance in km'),
  query('bloodType').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  query('urgency').optional().isIn(['low', 'normal', 'high', 'critical']),
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

    const {
      latitude,
      longitude,
      maxDistance = 50, // km
      bloodType,
      urgency,
      limit = 20
    } = req.query;

    const query = {
      role: 'bloodBank',
      isActive: true
    };

    let aggregationPipeline = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          distanceField: 'distance',
          maxDistance: parseInt(maxDistance) * 1000, // Convert km to meters
          spherical: true,
          query: query
        }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          phone: 1,
          address: 1,
          location: 1,
          organizationInfo: 1,
          distance: 1
        }
      },
      { $limit: parseInt(limit) }
    ];

    const nearbyBloodBanks = await User.aggregate(aggregationPipeline);

    // If blood type is specified and urgency is high/critical, check inventory
    if (bloodType && ['high', 'critical'].includes(urgency)) {
      const bloodBankIds = nearbyBloodBanks.map(bb => bb._id);
      
      const inventoryData = await Donation.aggregate([
        {
          $match: {
            bloodBank: { $in: bloodBankIds },
            status: 'completed',
            bloodType: bloodType,
            'bloodBag.expirationDate': { $gt: new Date() }
          }
        },
        {
          $group: {
            _id: '$bloodBank',
            availableUnits: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' }
          }
        }
      ]);

      // Merge inventory data and sort by availability for urgent requests
      const bloodBanksWithInventory = nearbyBloodBanks.map(bb => {
        const inventory = inventoryData.find(inv => inv._id.toString() === bb._id.toString());
        return {
          ...bb,
          inventory: {
            availableUnits: inventory?.availableUnits || 0,
            totalQuantity: inventory?.totalQuantity || 0
          }
        };
      }).sort((a, b) => {
        if (urgency === 'critical') {
          // For critical, prioritize availability over distance
          return b.inventory.availableUnits - a.inventory.availableUnits || a.distance - b.distance;
        }
        // For high urgency, balance availability and distance
        return (b.inventory.availableUnits * 100) - a.distance - ((a.inventory.availableUnits * 100) - b.distance);
      });

      res.json({
        success: true,
        data: {
          bloodBanks: bloodBanksWithInventory,
          searchCriteria: {
            location: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
            maxDistance: parseInt(maxDistance),
            bloodType,
            urgency
          },
          count: bloodBanksWithInventory.length,
          message: bloodBanksWithInventory.length === 0 ? 
            'No blood banks found in the specified area' : 
            `Found ${bloodBanksWithInventory.length} blood banks within ${maxDistance}km`
        }
      });
    } else {
      // Regular search without inventory checking
      res.json({
        success: true,
        data: {
          bloodBanks: nearbyBloodBanks.map(bb => ({
            ...bb,
            distance: Math.round(bb.distance / 1000 * 100) / 100 // Convert to km and round to 2 decimals
          })),
          searchCriteria: {
            location: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
            maxDistance: parseInt(maxDistance)
          },
          count: nearbyBloodBanks.length,
          message: nearbyBloodBanks.length === 0 ? 
            'No blood banks found in the specified area' : 
            `Found ${nearbyBloodBanks.length} blood banks within ${maxDistance}km`
        }
      });
    }

  } catch (error) {
    console.error('Search nearby blood banks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching for nearby blood banks',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
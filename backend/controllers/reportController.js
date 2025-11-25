const Complaint = require('../models/Complaint');
const Schedule = require('../models/Schedule');
const Resource = require('../models/Resource');

// @desc    Get overall statistics
// @route   GET /api/reports/statistics
// @access  Private (Mayor, Administrator, Supervisor)
exports.getStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        dateRaised: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    // Total complaints by status
    const complaintsByStatus = await Complaint.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Total complaints by severity
    const complaintsBySeverity = await Complaint.aggregate([
      { $match: { severity: { $ne: null }, ...dateFilter } },
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]);

    // Completed vs Pending
    const totalComplaints = await Complaint.countDocuments(dateFilter);
    const completedComplaints = await Complaint.countDocuments({
      ...dateFilter,
      status: 'completed'
    });
    const pendingComplaints = totalComplaints - completedComplaints;

    // Average completion time
    const completedWithDates = await Complaint.find({
      status: 'completed',
      dateCompleted: { $ne: null },
      dateScheduled: { $ne: null }
    });

    let avgCompletionTime = 0;
    if (completedWithDates.length > 0) {
      const totalDays = completedWithDates.reduce((sum, complaint) => {
        const days = Math.ceil(
          (complaint.dateCompleted - complaint.dateScheduled) / (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }, 0);
      avgCompletionTime = Math.round(totalDays / completedWithDates.length);
    }

    res.status(200).json({
      success: true,
      data: {
        overview: {
          total: totalComplaints,
          completed: completedComplaints,
          pending: pendingComplaints,
          averageCompletionDays: avgCompletionTime
        },
        byStatus: complaintsByStatus,
        bySeverity: complaintsBySeverity
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get area-wise reports
// @route   GET /api/reports/area-wise
// @access  Private (Mayor, Supervisor)
exports.getAreaWiseReports = async (req, res) => {
  try {
    const areaWiseData = await Complaint.aggregate([
      {
        $group: {
          _id: '$areaType',
          total: { $sum: 1 },
          pending: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
            }
          },
          scheduled: {
            $sum: {
              $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0]
            }
          },
          inProgress: {
            $sum: {
              $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0]
            }
          },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          },
          highSeverity: {
            $sum: {
              $cond: [{ $eq: ['$severity', 'high'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: areaWiseData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get resource utilization data
// @route   GET /api/reports/resource-utilization
// @access  Private (Mayor, Administrator)
exports.getResourceUtilization = async (req, res) => {
  try {
    const resourceData = await Resource.aggregate([
      {
        $group: {
          _id: {
            type: '$type',
            status: '$status'
          },
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      },
      {
        $group: {
          _id: '$_id.type',
          total: { $sum: '$count' },
          totalQuantity: { $sum: '$totalQuantity' },
          breakdown: {
            $push: {
              status: '$_id.status',
              count: '$count',
              quantity: '$totalQuantity'
            }
          }
        }
      }
    ]);

    // Calculate utilization percentage
    const utilizationData = resourceData.map(resource => {
      const inUse = resource.breakdown.find(b => b.status === 'in-use');
      const available = resource.breakdown.find(b => b.status === 'available');
      
      const utilizationPercentage = resource.totalQuantity > 0 
        ? Math.round(((inUse?.quantity || 0) / resource.totalQuantity) * 100)
        : 0;

      return {
        type: resource._id,
        total: resource.totalQuantity,
        available: available?.quantity || 0,
        inUse: inUse?.quantity || 0,
        utilizationPercentage,
        breakdown: resource.breakdown
      };
    });

    res.status(200).json({
      success: true,
      data: utilizationData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get monthly trends
// @route   GET /api/reports/trends
// @access  Private (Mayor)
exports.getMonthlyTrends = async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const monthsAgo = new Date();
    monthsAgo.setMonth(monthsAgo.getMonth() - parseInt(months));

    const trends = await Complaint.aggregate([
      {
        $match: {
          dateRaised: { $gte: monthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$dateRaised' },
            month: { $month: '$dateRaised' }
          },
          total: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          },
          pending: {
            $sum: {
              $cond: [{ $ne: ['$status', 'completed'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: trends
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

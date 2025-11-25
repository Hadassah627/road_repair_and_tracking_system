const Schedule = require('../models/Schedule');
const Complaint = require('../models/Complaint');
const Resource = require('../models/Resource');

// @desc    Get all schedules
// @route   GET /api/schedule
// @access  Private
exports.getSchedules = async (req, res) => {
  try {
    let query = {};

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by supervisor if role is supervisor
    if (req.user.role === 'supervisor') {
      query.supervisorId = req.user.id;
    }

    const schedules = await Schedule.find(query)
      .populate('complaintId')
      .populate('supervisorId', 'name email area')
      .sort({ assignedDate: 1 });

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single schedule
// @route   GET /api/schedule/:id
// @access  Private
exports.getSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('complaintId')
      .populate('supervisorId', 'name email area')
      .populate('teamAssigned', 'name email');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new schedule
// @route   POST /api/schedule
// @access  Private (Supervisor)
exports.createSchedule = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.body.complaintId);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Set supervisor from logged-in user
    req.body.supervisorId = req.user.id;

    const schedule = await Schedule.create(req.body);

    res.status(201).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update schedule
// @route   PUT /api/schedule/:id
// @access  Private (Supervisor)
exports.updateSchedule = async (req, res) => {
  try {
    let schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Auto-generate schedule based on priorities
// @route   POST /api/schedule/auto
// @access  Private (Supervisor, Administrator)
exports.autoSchedule = async (req, res) => {
  try {
    // Get all pending complaints with assessments, sorted by priority
    const complaints = await Complaint.find({
      status: 'pending',
      severity: { $ne: null },
      priority: { $ne: null }
    }).sort({ priority: -1 });

    if (complaints.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No complaints to schedule',
        data: []
      });
    }

    // Get available resources
    const availableResources = await Resource.find({ status: 'available' });

    const scheduledComplaints = [];
    let currentDate = new Date();

    for (const complaint of complaints) {
      // Check if enough resources are available
      const hasResources = checkResourceAvailability(
        complaint.resourceEstimate,
        availableResources
      );

      if (hasResources) {
        // Calculate completion date (example: 2-5 days based on severity)
        const daysToComplete = complaint.severity === 'high' ? 2 : 
                               complaint.severity === 'medium' ? 3 : 5;
        
        const completionDate = new Date(currentDate);
        completionDate.setDate(completionDate.getDate() + daysToComplete);

        const schedule = await Schedule.create({
          complaintId: complaint._id,
          assignedDate: currentDate,
          estimatedCompletionDate: completionDate,
          resourcesAllocated: complaint.resourceEstimate,
          supervisorId: complaint.supervisorId || req.user.id,
          status: 'scheduled'
        });

        scheduledComplaints.push(schedule);

        // Move to next available date
        currentDate = new Date(completionDate);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    res.status(201).json({
      success: true,
      count: scheduledComplaints.length,
      data: scheduledComplaints
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to check resource availability
function checkResourceAvailability(estimate, availableResources) {
  if (!estimate) return true;

  // Simple check - in production, this would be more sophisticated
  return true;
}

// @desc    Delete schedule
// @route   DELETE /api/schedule/:id
// @access  Private (Supervisor, Administrator)
exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    await schedule.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

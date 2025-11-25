const Complaint = require('../models/Complaint');
const WorkAssignment = require('../models/WorkAssignment');

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private
exports.getComplaints = async (req, res) => {
  try {
    let query = {};

    // Filter based on user role
    if (req.user.role === 'resident') {
      query.submittedBy = req.user.id;
    } else if (req.user.role === 'supervisor') {
      // Supervisor sees all pending complaints + complaints assigned to them
      query.$or = [
        { supervisorId: req.user.id },
        { supervisorId: null },
        { supervisorId: { $exists: false } }
      ];
    }

    // Additional filters from query params
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.severity) {
      query.severity = req.query.severity;
    }
    if (req.query.areaType) {
      query.areaType = req.query.areaType;
    }

    const complaints = await Complaint.find(query)
      .populate('submittedBy', 'name email')
      .populate('supervisorId', 'name email area')
      .populate('scheduledBy', 'name email phone')
      .populate('assignedSupportPerson', 'name email phone')
      .sort({ dateRaised: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Private
exports.getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('submittedBy', 'name email phone')
      .populate('supervisorId', 'name email area phone')
      .populate('scheduledBy', 'name email phone')
      .populate('assignedSupportPerson', 'name email phone');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private (Resident, Clerk)
exports.createComplaint = async (req, res) => {
  try {
    // Handle FormData - parse location if it's a string
    if (req.body['location[address]']) {
      req.body.location = {
        address: req.body['location[address]']
      };
      delete req.body['location[address]'];
    } else if (typeof req.body.location === 'string') {
      req.body.location = JSON.parse(req.body.location);
    }

    req.body.submittedBy = req.user.id;
    req.body.submittedByRole = req.user.role;

    // Add photo path if file was uploaded
    if (req.file) {
      req.body.photo = `/uploads/${req.file.filename}`;
    }

    const complaint = await Complaint.create(req.body);

    res.status(201).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update complaint
// @route   PUT /api/complaints/:id
// @access  Private
exports.updateComplaint = async (req, res) => {
  try {
    let complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Role-based update restrictions
    if (req.user.role === 'resident' && complaint.submittedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this complaint'
      });
    }

    complaint = await Complaint.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private (Admin, Supervisor)
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    await complaint.deleteOne();

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

// @desc    Assign severity and priority (Supervisor only)
// @route   PUT /api/complaints/:id/assess
// @access  Private (Supervisor)
exports.assessComplaint = async (req, res) => {
  try {
    const { severity, areaType, resourceEstimate, supervisorNotes } = req.body;

    let complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Calculate priority based on severity and area type
    let priority = 5; // default
    if (severity === 'high') priority = areaType === 'commercial' ? 10 : areaType === 'busy' ? 9 : 7;
    else if (severity === 'medium') priority = areaType === 'commercial' ? 7 : areaType === 'busy' ? 6 : 5;
    else if (severity === 'low') priority = areaType === 'commercial' ? 4 : areaType === 'busy' ? 3 : 2;

    // Set resource request status to pending-approval if resources are requested
    const hasResourceRequest = resourceEstimate && (
      (resourceEstimate.materials && resourceEstimate.materials.length > 0) ||
      (resourceEstimate.machines && resourceEstimate.machines.length > 0) ||
      (resourceEstimate.manpower && (resourceEstimate.manpower.workers > 0 || resourceEstimate.manpower.engineers > 0))
    );

    complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        severity,
        areaType,
        priority,
        resourceEstimate,
        supervisorNotes,
        supervisorId: req.user.id,
        resourceRequestStatus: hasResourceRequest ? 'pending-approval' : 'not-requested'
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve resource request (Administrator only)
// @route   PUT /api/complaints/:id/approve-resources
// @access  Private (Administrator)
exports.approveResourceRequest = async (req, res) => {
  try {
    const { resourcesAllocated, administratorNotes } = req.body;

    let complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    if (complaint.resourceRequestStatus !== 'pending-approval') {
      return res.status(400).json({
        success: false,
        message: 'No pending resource request for this complaint'
      });
    }

    complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        resourceRequestStatus: 'approved',
        resourcesAllocated,
        administratorNotes,
        approvedBy: req.user.id,
        approvalDate: Date.now()
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Resource request approved successfully',
      data: complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reject resource request (Administrator only)
// @route   PUT /api/complaints/:id/reject-resources
// @access  Private (Administrator)
exports.rejectResourceRequest = async (req, res) => {
  try {
    const { administratorNotes } = req.body;

    let complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    if (complaint.resourceRequestStatus !== 'pending-approval') {
      return res.status(400).json({
        success: false,
        message: 'No pending resource request for this complaint'
      });
    }

    complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        resourceRequestStatus: 'rejected',
        administratorNotes,
        approvedBy: req.user.id,
        approvalDate: Date.now()
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Resource request rejected',
      data: complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Schedule complaint (Supervisor only)
// @route   PUT /api/complaints/:id/schedule
// @access  Private (Supervisor)
exports.scheduleComplaint = async (req, res) => {
  try {
    const { scheduleDate, scheduleNotes, assignedSupportPerson, workDescription, deadline, priority } = req.body;

    let complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if complaint has been assessed
    if (!complaint.supervisorId) {
      return res.status(400).json({
        success: false,
        message: 'Complaint must be assessed before scheduling'
      });
    }

    // Update complaint with schedule information
    complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        status: 'scheduled',
        dateScheduled: scheduleDate || Date.now(),
        scheduledBy: req.user.id,
        assignedSupportPerson: assignedSupportPerson || null,
        supervisorNotes: scheduleNotes || complaint.supervisorNotes
      },
      { new: true, runValidators: true }
    ).populate('scheduledBy', 'name email phone')
     .populate('submittedBy', 'name email phone')
     .populate('assignedSupportPerson', 'name email phone');

    // If support person is assigned, create work assignment
    let workAssignment = null;
    if (assignedSupportPerson) {
      workAssignment = await WorkAssignment.create({
        complaintId: complaint._id,
        assignedTo: assignedSupportPerson,
        assignedBy: req.user.id,
        workDescription: workDescription || complaint.description,
        roadName: complaint.roadName,
        location: complaint.location.address,
        deadline: deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
        priority: priority || complaint.severity || 'medium',
        notes: scheduleNotes
      });

      // Populate the work assignment
      workAssignment = await WorkAssignment.findById(workAssignment._id)
        .populate('assignedTo', 'name email phone')
        .populate('assignedBy', 'name email phone');
    }

    res.status(200).json({
      success: true,
      message: assignedSupportPerson 
        ? `Complaint scheduled successfully! Work assigned to support person.` 
        : `Complaint scheduled successfully! Resident ${complaint.submittedBy.name} has been notified.`,
      data: complaint,
      workAssignment: workAssignment,
      notification: {
        residentName: complaint.submittedBy.name,
        residentEmail: complaint.submittedBy.email,
        residentPhone: complaint.submittedBy.phone,
        supervisorName: complaint.scheduledBy.name,
        supervisorEmail: complaint.scheduledBy.email,
        supervisorPhone: complaint.scheduledBy.phone,
        complaintId: complaint.complaintId,
        roadName: complaint.roadName,
        scheduledDate: complaint.dateScheduled,
        supportPerson: assignedSupportPerson ? {
          name: complaint.assignedSupportPerson?.name,
          email: complaint.assignedSupportPerson?.email,
          phone: complaint.assignedSupportPerson?.phone
        } : null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

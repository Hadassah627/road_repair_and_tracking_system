const WorkAssignment = require('../models/WorkAssignment');
const Complaint = require('../models/Complaint');

// @desc    Get all work assignments for a support person
// @route   GET /api/work-assignments
// @access  Private (Support)
exports.getWorkAssignments = async (req, res) => {
  try {
    const workAssignments = await WorkAssignment.find({ 
      assignedTo: req.user.id 
    })
    .populate('complaintId', 'complaintId description severity')
    .populate('assignedBy', 'name email phone')
    .sort({ deadline: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: workAssignments.length,
      data: workAssignments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching work assignments',
      error: error.message
    });
  }
};

// @desc    Get all work assignments created by supervisor
// @route   GET /api/work-assignments/supervisor
// @access  Private (Supervisor)
exports.getSupervisorWorkAssignments = async (req, res) => {
  try {
    const workAssignments = await WorkAssignment.find({ 
      assignedBy: req.user.id 
    })
    .populate('complaintId', 'complaintId description severity')
    .populate('assignedTo', 'name email phone')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: workAssignments.length,
      data: workAssignments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching work assignments',
      error: error.message
    });
  }
};

// @desc    Get single work assignment
// @route   GET /api/work-assignments/:id
// @access  Private
exports.getWorkAssignment = async (req, res) => {
  try {
    const workAssignment = await WorkAssignment.findById(req.params.id)
      .populate('complaintId')
      .populate('assignedTo', 'name email phone')
      .populate('assignedBy', 'name email phone');

    if (!workAssignment) {
      return res.status(404).json({
        success: false,
        message: 'Work assignment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: workAssignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching work assignment',
      error: error.message
    });
  }
};

// @desc    Create work assignment
// @route   POST /api/work-assignments
// @access  Private (Supervisor)
exports.createWorkAssignment = async (req, res) => {
  try {
    const { 
      complaintId, 
      assignedTo, 
      workDescription, 
      roadName, 
      location, 
      deadline,
      priority,
      notes 
    } = req.body;

    // Verify complaint exists
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    const workAssignment = await WorkAssignment.create({
      complaintId,
      assignedTo,
      assignedBy: req.user.id,
      workDescription,
      roadName,
      location,
      deadline,
      priority: priority || 'medium',
      notes
    });

    const populatedAssignment = await WorkAssignment.findById(workAssignment._id)
      .populate('complaintId', 'complaintId description severity')
      .populate('assignedTo', 'name email phone')
      .populate('assignedBy', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Work assignment created successfully',
      data: populatedAssignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating work assignment',
      error: error.message
    });
  }
};

// @desc    Update work assignment status
// @route   PUT /api/work-assignments/:id/status
// @access  Private (Support)
exports.updateWorkStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const workAssignment = await WorkAssignment.findById(req.params.id);

    if (!workAssignment) {
      return res.status(404).json({
        success: false,
        message: 'Work assignment not found'
      });
    }

    // Check if the user is authorized to update this work
    if (workAssignment.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this work assignment'
      });
    }

    // Update status
    workAssignment.status = status;
    
    // Set notification flag when status changes to in-progress or completed
    if (status === 'in-progress' || status === 'completed') {
      workAssignment.supervisorNotified = true;
    }
    
    // Update timestamps based on status
    if (status === 'in-progress' && !workAssignment.startedAt) {
      workAssignment.startedAt = Date.now();
      
      // Update complaint status to in-progress when work starts
      await Complaint.findByIdAndUpdate(
        workAssignment.complaintId,
        { 
          status: 'in-progress',
          supervisorNotified: true
        }
      );
    }
    
    if (status === 'completed' && !workAssignment.completedAt) {
      workAssignment.completedAt = Date.now();
      
      // Update complaint status to completed when work is finished
      await Complaint.findByIdAndUpdate(
        workAssignment.complaintId,
        { 
          status: 'completed',
          dateCompleted: Date.now(),
          supervisorNotified: true
        }
      );
    }

    if (notes) {
      workAssignment.notes = notes;
    }

    await workAssignment.save();

    const updatedAssignment = await WorkAssignment.findById(workAssignment._id)
      .populate('complaintId', 'complaintId description severity status')
      .populate('assignedTo', 'name email phone')
      .populate('assignedBy', 'name email phone');

    // Get updated complaint details
    const updatedComplaint = await Complaint.findById(workAssignment.complaintId)
      .populate('submittedBy', 'name email')
      .populate('supervisorId', 'name email')
      .populate('scheduledBy', 'name email');

    res.status(200).json({
      success: true,
      message: status === 'completed' 
        ? `Work completed successfully! Complaint status updated to completed.`
        : `Work status updated to ${status}`,
      data: updatedAssignment,
      complaint: updatedComplaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating work status',
      error: error.message
    });
  }
};

// @desc    Update work assignment
// @route   PUT /api/work-assignments/:id
// @access  Private (Supervisor)
exports.updateWorkAssignment = async (req, res) => {
  try {
    const workAssignment = await WorkAssignment.findById(req.params.id);

    if (!workAssignment) {
      return res.status(404).json({
        success: false,
        message: 'Work assignment not found'
      });
    }

    // Check if the user is the supervisor who created this assignment
    if (workAssignment.assignedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this work assignment'
      });
    }

    const updatedWorkAssignment = await WorkAssignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('complaintId', 'complaintId description severity')
    .populate('assignedTo', 'name email phone')
    .populate('assignedBy', 'name email phone');

    res.status(200).json({
      success: true,
      message: 'Work assignment updated successfully',
      data: updatedWorkAssignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating work assignment',
      error: error.message
    });
  }
};

// @desc    Delete work assignment
// @route   DELETE /api/work-assignments/:id
// @access  Private (Supervisor)
exports.deleteWorkAssignment = async (req, res) => {
  try {
    const workAssignment = await WorkAssignment.findById(req.params.id);

    if (!workAssignment) {
      return res.status(404).json({
        success: false,
        message: 'Work assignment not found'
      });
    }

    // Check if the user is the supervisor who created this assignment
    if (workAssignment.assignedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this work assignment'
      });
    }

    await workAssignment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Work assignment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting work assignment',
      error: error.message
    });
  }
};

// @desc    Confirm complaint completion
// @route   PUT /api/work-assignments/:id/confirm
// @access  Private (Supervisor)
exports.confirmCompletion = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { confirmed, confirmationNotes } = req.body;

    // Find the complaint
    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Update complaint confirmation status
    complaint.supervisorConfirmed = confirmed;
    complaint.confirmedBy = req.user.id;
    complaint.confirmationDate = Date.now();
    
    if (confirmationNotes) {
      complaint.confirmationNotes = confirmationNotes;
    }

    await complaint.save();

    // Also update the work assignment if it exists
    const workAssignment = await WorkAssignment.findOne({ 
      complaintId: complaintId 
    });

    if (workAssignment) {
      workAssignment.supervisorConfirmed = confirmed;
      workAssignment.confirmedBy = req.user.id;
      workAssignment.confirmationDate = Date.now();
      
      if (confirmationNotes) {
        workAssignment.confirmationNotes = confirmationNotes;
      }
      
      await workAssignment.save();
    }

    // Get updated complaint with populated fields
    const updatedComplaint = await Complaint.findById(complaintId)
      .populate('submittedBy', 'name email')
      .populate('scheduledBy', 'name email')
      .populate('assignedSupportPerson', 'name email phone')
      .populate('confirmedBy', 'name email');

    res.status(200).json({
      success: true,
      message: confirmed 
        ? 'Completion confirmed successfully!' 
        : 'Completion confirmation updated',
      data: updatedComplaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error confirming completion',
      error: error.message
    });
  }
};

const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true
  },
  assignedDate: {
    type: Date,
    required: true
  },
  estimatedCompletionDate: {
    type: Date,
    required: true
  },
  actualCompletionDate: {
    type: Date
  },
  resourcesAllocated: {
    materials: [{
      resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource'
      },
      name: String,
      quantityAllocated: Number,
      unit: String
    }],
    machines: [{
      resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource'
      },
      name: String,
      quantityAllocated: Number
    }],
    manpower: {
      workers: { type: Number, default: 0 },
      engineers: { type: Number, default: 0 }
    }
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'rescheduled', 'cancelled'],
    default: 'scheduled'
  },
  supervisorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teamAssigned: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  progressUpdates: [{
    date: Date,
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  rescheduledFrom: {
    type: Date
  },
  reschedulingReason: {
    type: String
  }
}, {
  timestamps: true
});

// Update complaint status when schedule status changes
scheduleSchema.post('save', async function(doc) {
  const Complaint = mongoose.model('Complaint');
  
  let complaintStatus = 'pending';
  if (doc.status === 'scheduled') {
    complaintStatus = 'scheduled';
  } else if (doc.status === 'in-progress') {
    complaintStatus = 'in-progress';
  } else if (doc.status === 'completed') {
    complaintStatus = 'completed';
  }
  
  await Complaint.findByIdAndUpdate(doc.complaintId, {
    status: complaintStatus,
    dateScheduled: doc.assignedDate,
    dateCompleted: doc.actualCompletionDate
  });
});

module.exports = mongoose.model('Schedule', scheduleSchema);

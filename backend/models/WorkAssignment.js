const mongoose = require('mongoose');

const workAssignmentSchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: [true, 'Complaint ID is required']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Support person must be assigned']
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Supervisor information is required']
  },
  workDescription: {
    type: String,
    required: [true, 'Work description is required']
  },
  roadName: {
    type: String,
    required: [true, 'Road name is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required']
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  notes: {
    type: String
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  supervisorNotified: {
    type: Boolean,
    default: false
  },
  supervisorConfirmed: {
    type: Boolean,
    default: false
  },
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  confirmationDate: {
    type: Date
  },
  confirmationNotes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WorkAssignment', workAssignmentSchema);

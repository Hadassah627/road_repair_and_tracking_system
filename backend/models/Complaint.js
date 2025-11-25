const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    unique: true
  },
  roadName: {
    type: String,
    required: [true, 'Please provide road name'],
    trim: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  description: {
    type: String,
    required: [true, 'Please provide issue description']
  },
  photo: {
    type: String // URL or path to uploaded image
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  areaType: {
    type: String,
    enum: ['commercial', 'busy', 'deserted', 'residential'],
    default: 'residential'
  },
  priority: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'in-progress', 'completed', 'rejected'],
    default: 'pending'
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedByRole: {
    type: String,
    enum: ['resident', 'clerk']
  },
  supervisorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resourceEstimate: {
    materials: [{
      name: String,
      quantity: Number,
      unit: String
    }],
    machines: [{
      name: String,
      quantity: Number
    }],
    manpower: {
      workers: { type: Number, default: 0 },
      engineers: { type: Number, default: 0 }
    }
  },
  dateRaised: {
    type: Date,
    default: Date.now
  },
  dateScheduled: {
    type: Date
  },
  scheduledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedSupportPerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dateCompleted: {
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
  },
  supervisorNotes: {
    type: String
  },
  rejectionReason: {
    type: String
  },
  resourceRequestStatus: {
    type: String,
    enum: ['pending-approval', 'approved', 'rejected', 'not-requested'],
    default: 'not-requested'
  },
  resourcesAllocated: {
    materials: [{
      name: String,
      quantityAllocated: Number,
      unit: String
    }],
    machines: [{
      name: String,
      quantityAllocated: Number
    }],
    manpower: {
      workers: { type: Number, default: 0 },
      engineers: { type: Number, default: 0 }
    }
  },
  administratorNotes: {
    type: String
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Auto-generate complaint ID
complaintSchema.pre('save', async function(next) {
  if (!this.complaintId) {
    const count = await mongoose.model('Complaint').countDocuments();
    this.complaintId = `CMP${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Auto-update status based on dates
complaintSchema.pre('save', function(next) {
  if (this.dateCompleted && this.status !== 'completed') {
    this.status = 'completed';
  }
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);

const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['material', 'machine', 'manpower'],
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide resource name'],
    trim: true
  },
  category: {
    type: String,
    // For materials: cement, gravel, asphalt, etc.
    // For machines: roller, mixer, excavator, etc.
    // For manpower: worker, engineer, supervisor, etc.
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    // For materials: kg, tons, bags, etc.
    // For machines: units
    // For manpower: persons
    default: 'units'
  },
  status: {
    type: String,
    enum: ['available', 'in-use', 'maintenance', 'unavailable'],
    default: 'available'
  },
  totalQuantity: {
    type: Number,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Update lastUpdated on any change
resourceSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model('Resource', resourceSchema);

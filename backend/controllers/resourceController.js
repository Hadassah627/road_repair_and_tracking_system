const Resource = require('../models/Resource');

// @desc    Get all resources
// @route   GET /api/resources
// @access  Private
exports.getResources = async (req, res) => {
  try {
    let query = {};

    // Filter by type if provided
    if (req.query.type) {
      query.type = req.query.type;
    }

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    const resources = await Resource.find(query)
      .populate('updatedBy', 'name email')
      .sort({ type: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Private
exports.getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('updatedBy', 'name email');

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new resource
// @route   POST /api/resources
// @access  Private (Administrator)
exports.createResource = async (req, res) => {
  try {
    req.body.updatedBy = req.user.id;
    req.body.totalQuantity = req.body.quantity;

    const resource = await Resource.create(req.body);

    res.status(201).json({
      success: true,
      data: resource
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private (Administrator)
exports.updateResource = async (req, res) => {
  try {
    let resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    req.body.updatedBy = req.user.id;

    resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private (Administrator)
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    await resource.deleteOne();

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

// @desc    Get resource availability summary
// @route   GET /api/resources/summary/availability
// @access  Private
exports.getResourceSummary = async (req, res) => {
  try {
    const summary = await Resource.aggregate([
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
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count',
              quantity: '$totalQuantity'
            }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

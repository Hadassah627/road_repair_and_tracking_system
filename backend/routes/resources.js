const express = require('express');
const router = express.Router();
const {
  getResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  getResourceSummary
} = require('../controllers/resourceController');
const { protect, authorize } = require('../middlewares/auth');

router.get('/summary/availability', protect, getResourceSummary);

router
  .route('/')
  .get(protect, getResources)
  .post(protect, authorize('administrator'), createResource);

router
  .route('/:id')
  .get(protect, getResource)
  .put(protect, authorize('administrator'), updateResource)
  .delete(protect, authorize('administrator'), deleteResource);

module.exports = router;

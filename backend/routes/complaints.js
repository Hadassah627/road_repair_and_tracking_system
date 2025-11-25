const express = require('express');
const router = express.Router();
const {
  getComplaints,
  getComplaint,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  assessComplaint,
  approveResourceRequest,
  rejectResourceRequest,
  scheduleComplaint
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router
  .route('/')
  .get(protect, getComplaints)
  .post(protect, authorize('resident', 'clerk'), upload.single('image'), createComplaint);

router
  .route('/:id')
  .get(protect, getComplaint)
  .put(protect, updateComplaint)
  .delete(protect, authorize('administrator', 'supervisor'), deleteComplaint);

router
  .route('/:id/assess')
  .put(protect, authorize('supervisor'), assessComplaint);

router
  .route('/:id/approve-resources')
  .put(protect, authorize('administrator'), approveResourceRequest);

router
  .route('/:id/reject-resources')
  .put(protect, authorize('administrator'), rejectResourceRequest);

router
  .route('/:id/schedule')
  .put(protect, authorize('supervisor'), scheduleComplaint);

module.exports = router;

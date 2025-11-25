const express = require('express');
const router = express.Router();
const {
  getWorkAssignments,
  getSupervisorWorkAssignments,
  getWorkAssignment,
  createWorkAssignment,
  updateWorkStatus,
  updateWorkAssignment,
  deleteWorkAssignment,
  confirmCompletion
} = require('../controllers/workAssignmentController');
const { protect, authorize } = require('../middlewares/auth');

// Routes for support person
router.get('/', protect, authorize('support'), getWorkAssignments);
router.get('/:id', protect, getWorkAssignment);
router.put('/:id/status', protect, authorize('support'), updateWorkStatus);

// Routes for supervisor
router.get('/supervisor/all', protect, authorize('supervisor'), getSupervisorWorkAssignments);
router.post('/', protect, authorize('supervisor'), createWorkAssignment);
router.put('/:id', protect, authorize('supervisor'), updateWorkAssignment);
router.delete('/:id', protect, authorize('supervisor'), deleteWorkAssignment);
router.put('/:complaintId/confirm', protect, authorize('supervisor'), confirmCompletion);

module.exports = router;

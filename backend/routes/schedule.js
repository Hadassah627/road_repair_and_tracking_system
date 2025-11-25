const express = require('express');
const router = express.Router();
const {
  getSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  autoSchedule,
  deleteSchedule
} = require('../controllers/scheduleController');
const { protect, authorize } = require('../middlewares/auth');

router.post('/auto', protect, authorize('supervisor', 'administrator'), autoSchedule);

router
  .route('/')
  .get(protect, getSchedules)
  .post(protect, authorize('supervisor'), createSchedule);

router
  .route('/:id')
  .get(protect, getSchedule)
  .put(protect, authorize('supervisor', 'administrator'), updateSchedule)
  .delete(protect, authorize('supervisor', 'administrator'), deleteSchedule);

module.exports = router;

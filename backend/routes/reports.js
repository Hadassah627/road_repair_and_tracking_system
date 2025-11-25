const express = require('express');
const router = express.Router();
const {
  getStatistics,
  getAreaWiseReports,
  getResourceUtilization,
  getMonthlyTrends
} = require('../controllers/reportController');
const { protect, authorize } = require('../middlewares/auth');

router.get(
  '/statistics',
  protect,
  authorize('mayor', 'administrator', 'supervisor'),
  getStatistics
);

router.get(
  '/area-wise',
  protect,
  authorize('mayor', 'supervisor'),
  getAreaWiseReports
);

router.get(
  '/resource-utilization',
  protect,
  authorize('mayor', 'administrator'),
  getResourceUtilization
);

router.get(
  '/trends',
  protect,
  authorize('mayor'),
  getMonthlyTrends
);

module.exports = router;

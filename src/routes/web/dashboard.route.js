const express = require('express');
const dashboardController = require('../../controllers/web/dashboard.controller');

const router = express.Router();

router.route('/').get(dashboardController.index);

module.exports = router;

const express = require('express');
const authController = require('../../controllers/web/auth.controller');

const router = express.Router();

router.route('/login').get(authController.login).post(authController.login);
router.route('/register').get(authController.register).post(authController.register);
module.exports = router;

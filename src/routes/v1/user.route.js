const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const userController = require('../../controllers/user.controller');

const router = express.Router();

router
  .route('/')
  .get(auth(), userController.getUser)
  .patch(auth(), validate(userValidation.updateCorrentUser), userController.updateUser);

module.exports = router;

const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const adminController = require('../../controllers/admin.controller');

const router = express.Router();

router
  .route('/user')
  .post(auth('manageUsers'), validate(userValidation.createUser), adminController.createUser)
  .get(auth('getUsers'), validate(userValidation.getUsers), adminController.getUsers);

router.route('/user/statistics').get(auth('getUsers'), adminController.getUsersStatistics);
router
  .route('/user/:userId')
  .get(auth('getUsers'), validate(userValidation.getUser), adminController.getUser)
  .patch(auth('manageUsers'), validate(userValidation.updateUser), adminController.updateUser)
  .delete(auth('manageUsers'), validate(userValidation.deleteUser), adminController.deleteUser);

module.exports = router;

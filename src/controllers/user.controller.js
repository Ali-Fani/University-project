const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { adminService } = require('../services');

const getUser = catchAsync(async (req, res) => {
  const user = await adminService.getUserById(req.user._id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await adminService.updateUserById(req.user._id, req.body);
  res.send(user);
});

module.exports = {
  getUser,
  updateUser,

  // getUsersWeb,
  // verifyUserWeb,
  // viewUserWeb,
  // updateUserWeb
};

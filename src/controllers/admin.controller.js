const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { adminService } = require('../services');

const createUser = catchAsync(async (req, res) => {
  const user = await adminService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await adminService.queryUsers(filter, options);
  res.send(result);
});

const getUsersStatistics = catchAsync(async (req, res) => {
  const result = await adminService.getUsersStatistics();
  res.send(result);
});

const getFileTypesStatistics = catchAsync(async (req, res) => {
  const result = await adminService.getFileTypesStatistics();
  res.send(result);
});

const getTotalFilesStatistics = catchAsync(async (req, res) => {
  const result = await adminService.getTotalFilesStatistics();
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await adminService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await adminService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await adminService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUsersStatistics,
  getFileTypesStatistics,
  getTotalFilesStatistics,
};

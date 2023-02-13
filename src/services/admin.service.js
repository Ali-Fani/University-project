const httpStatus = require('http-status');
const { User, File } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.username && (await User.isUsernameTaken(updateBody.username, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Username already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

const verifyUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  user.isUserVerified = true;
  await user.save();
  return user;
};

const getUsersStatistics = async () => {
  const data = await File.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $group: {
        _id: '$user',
        totalSize: {
          $sum: '$size',
        },
        totalDownloadCount: {
          $sum: '$downloadCount',
        },
        totalDownloadSize: {
          $sum: {
            $multiply: ['$downloadCount', '$size'],
          },
        },
        totalCount: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        '_id.password': 0,
        '_id.role': 0,
        '_id.isEmailVerified': 0,
        '_id.isUserVerifeid': 0,
      },
    },
  ]);
  return data;
};

const getFileTypesStatistics = async () => {
  const data = await File.aggregate([
    {
      $group: {
        _id: '$mimetype',
        total: {
          $sum: 1,
        },
      },
    },
  ]);
  return data;
};

const getTotalFilesStatistics = async () => {
  const data = await File.aggregate([
    {
      $group: {
        _id: null,
        totalSize: {
          $sum: '$size',
        },
        totalDownloadCount: {
          $sum: '$downloadCount',
        },
        totalDownloadSize: {
          $sum: {
            $multiply: ['$downloadCount', '$size'],
          },
        },
        totalCount: {
          $sum: 1,
        },
      },
    },
  ]);
  return data;
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  verifyUserById,
  getUsersStatistics,
  getFileTypesStatistics,
  getTotalFilesStatistics,
};

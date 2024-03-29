const httpStatus = require('http-status');
const { File } = require('../models');
const ApiError = require('../utils/ApiError');
/**
 * Save a file
 * @param {*} file
 * @param {string} filename
 * @returns {Promise<File>}
 */
const saveFile = async (file, filename, user) => {
  const fileDoc = await File.create({
    name: filename,
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
    encoding: file.encoding,
    expiryCount: file.expiryCount,
    user,
  });
  return fileDoc;
};

const getFiles = async (user) => {
  const files = await File.find({ user });
  return files;
};

const getFileMetadata = async (filename) => {
  const file = await File.findOne({ name: filename });
  return file;
};

const deleteFile = async (file, user) => {
  const fileDoc = await File.findOne({ name: file });
  if (!fileDoc) throw new ApiError(httpStatus.NOT_FOUND, 'File not found');
  console.log(fileDoc, user._id);
  if (!fileDoc.user._id.equals(user._id)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You dont have access to this file');
  }
  await fileDoc.remove();
  return fileDoc;
};

const updateFile = async (filename, fileBody, user) => {
  const fileDoc = await File.findOne({ name: filename });
  // console.log(fileDoc.user.equals(user._id));
  if (!fileDoc) throw new ApiError(httpStatus.NOT_FOUND, 'File not found');
  if (!fileDoc.user.equals(user._id)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You dont have access to this file');
  }
  Object.assign(fileDoc, fileBody);
  await fileDoc.save();
  return fileDoc;
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
const queryFiles = async (filter, options) => {
  const users = await File.paginate(filter, options);
  return users;
};

module.exports = {
  saveFile,
  getFiles,
  deleteFile,
  updateFile,
  getFileMetadata,
  queryFiles,
};

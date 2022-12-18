const { File } = require('../models');
const httpStatus = require('http-status');
const { object } = require('joi');
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
    user: user,
  });
  return fileDoc;
};

const getFiles = async (user) => {
  const files = await File.find({ user: user });
  return files;
};

const deleteFile = async (file, user) => {
  const fileDoc = await File.findOne({ name: file });
  if (!fileDoc) throw new ApiError(httpStatus.NOT_FOUND, 'File not found');
  if (fileDoc.user != user) {
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

module.exports = {
  saveFile,
  getFiles,
  deleteFile,
  updateFile,
};

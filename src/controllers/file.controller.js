const { encryptFile, decryptFile } = require('../utils/encryption');
const crypto = require('crypto');
const { File } = require('../models');
const path = require('path');
const { writeFile, readFile } = require('fs');
const { sendFile } = require('../utils/sendFile');
const { fileService } = require('../services');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const uploadFile = catchAsync(async (req, res) => {
  const encryptedFile = await encryptFile(req.file.buffer, req.body.password);
  const filename = crypto.randomBytes(16).toString('hex');
  const file = await fileService.saveFile(req.file, filename, req.user);
  writeFile(path.join('uploads/', filename), encryptedFile, (err) => {
    if (err) console.log(err);
  });
  res.status(httpStatus.CREATED).json({ message: 'Successfully uploaded files', file });
});

const getFiles = catchAsync(async (req, res) => {
  const files = await fileService.getFiles(req.user);
  res.status(httpStatus.OK).json({ message: 'Successfully fetched files', files });
});

const deleteFile = catchAsync(async (req, res) => {
  const file = await fileService.deleteFile(req.params.filename, req.user);
  res.status(httpStatus.OK).json({ message: 'Successfully deleted file', file });
});

const updateFile = catchAsync(async (req, res) => {
  const file = await fileService.updateFile(req.params.filename, req.body, req.user);
  res.status(httpStatus.OK).json({ message: 'Successfully updated file', file });
});

const getFile = catchAsync(async (req, res) => {
  let file = await File.findByName(req.params.filename);
  if (!file) throw new ApiError(httpStatus.NOT_FOUND, 'file not found');
  if (file.expiryCount > 0 && file.downloadCount >= file.expiryCount)
    throw new ApiError(httpStatus.FORBIDDEN, 'file expired');
  let filepath = path.join('uploads/', file.name);
  readFile(filepath, async (err, data) => {
    if (!err && data) {
      try {
        const decryptedFile = await decryptFile(data, req.query.password);
        file.downloadCount++;
        file.save();
        sendFile(res, decryptedFile, file);
      } catch (err) {
        res.status(httpStatus.FORBIDDEN).json({ message: 'Invalid password' });
      }
    }
  });
});

module.exports = {
  uploadFile,
  getFile,
  getFiles,
  deleteFile,
  updateFile,
};

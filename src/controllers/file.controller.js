const crypto = require('crypto');
const path = require('path');
const { writeFile, readFile } = require('fs');
const httpStatus = require('http-status');
const { encryptFile, decryptFile } = require('../utils/encryption');
const { File } = require('../models');
const { sendFile } = require('../utils/sendFile');
const { fileService } = require('../services');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const uploadFile = catchAsync(async (req, res) => {
  const encryptedFile = await encryptFile(req.file.buffer, req.body.password);
  const filename = crypto.randomBytes(16).toString('hex');
  const file = await fileService.saveFile(req.file, filename, req.user);
  writeFile(path.join('uploads/', filename), encryptedFile, (err) => {
    if (err) throw err;
  });
  res.status(httpStatus.CREATED).json({ message: 'Successfully uploaded files', file });
});

const getFiles = catchAsync(async (req, res) => {
  const files = await fileService.getFiles(req.user);
  res.status(httpStatus.OK).json({ message: 'Successfully fetched files', files });
});

const getFileMetadata = catchAsync(async (req, res) => {
  const file = await fileService.getFileMetadata(req.params.filename);
  res.status(httpStatus.OK).json({
    message: 'Successfully fetched file metadata',
    data: {
      name: file.name,
      originalName: file.originalName,
      size: file.size,
      expiryDate: file.expiryDate,
      downloadCount: file.downloadCount,
    },
  });
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
  const file = await File.findByName(req.params.filename);
  if (!file) throw new ApiError(httpStatus.NOT_FOUND, 'file not found');
  if (file.expiryCount > 0 && file.downloadCount >= file.expiryCount)
    throw new ApiError(httpStatus.FORBIDDEN, 'file expired');
  const filepath = path.join('uploads/', file.name);
  readFile(filepath, async (err, data) => {
    if (!err && data) {
      try {
        const decryptedFile = await decryptFile(data, req.query.password);
        file.downloadCount += 1;
        file.save();
        sendFile(res, decryptedFile, file);
      } catch (error) {
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
  getFileMetadata,
};

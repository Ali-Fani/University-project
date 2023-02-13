const crypto = require('crypto');

const httpStatus = require('http-status');
const mongoose = require('mongoose');
const mongodb = require('mongodb');
const { Readable } = require('stream');

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
  const { db } = mongoose.connection;
  const bucket = new mongodb.GridFSBucket(db, { bucketName: 'files' });
  Readable.from(encryptedFile).pipe(bucket.openUploadStream(filename));
  return res.status(httpStatus.CREATED).json({ message: 'Successfully uploaded files', file });
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

function stream2buffer(stream) {
  return new Promise((resolve, reject) => {
    const _buf = [];

    stream.on('data', (chunk) => _buf.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(_buf)));
    stream.on('error', (err) => reject(err));
  });
}

const getFile = catchAsync(async (req, res) => {
  const file = await File.findByName(req.params.filename);
  if (!file) throw new ApiError(httpStatus.NOT_FOUND, 'file not found');
  if (file.expiryCount > 0 && file.downloadCount >= file.expiryCount)
    throw new ApiError(httpStatus.FORBIDDEN, 'file expired');
  // const key = crypto.pbkdf2Sync(req.query.password, file.salt, 3000, 32, 'sha512');
  // get from gridfs
  const { db } = mongoose.connection;
  const bucket = new mongodb.GridFSBucket(db, { bucketName: 'files' });
  const fileData = await stream2buffer(bucket.openDownloadStreamByName(file.name));

  try {
    const decryptedFile = await decryptFile(fileData, req.query.password);
    file.downloadCount += 1;
    file.save();
    sendFile(res, decryptedFile, file);
  } catch (error) {
    res.status(httpStatus.FORBIDDEN).json({ message: 'Invalid password' });
  }

  // get from file system and decrypt
  // readFile(filepath, async (err, data) => {
  //   if (!err && data) {
  //     try {
  //       const decryptedFile = await decryptFile(data, req.query.password);
  //       file.downloadCount += 1;
  //       file.save();
  //       sendFile(res, decryptedFile, file);
  //     } catch (error) {
  //       res.status(httpStatus.FORBIDDEN).json({ message: 'Invalid password' });
  //     }
  //   }
  // });
});

module.exports = {
  uploadFile,
  getFile,
  getFiles,
  deleteFile,
  updateFile,
  getFileMetadata,
};

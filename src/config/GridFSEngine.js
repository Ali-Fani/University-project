// const os = require('os');
const crypto = require('crypto');
const mongoose = require('mongoose');
const mongodb = require('mongodb');
const { Encrypt, Decrypt } = require('gcm-stream');

function getBucketName(req, file, cb) {
  cb(null, 'files');
}

function GridFSStorage(opts) {
  this.getBucketName = opts.bucketName || getBucketName;
}

GridFSStorage.prototype._handleFile = function _handleFile(req, file, cb) {
  try {
    this.getBucketName(req, file, function (err, bucketName) {
      if (err) return cb(err);
      const { db } = mongoose.connection;
      const bucket = new mongodb.GridFSBucket(db, { bucketName });
      crypto.randomBytes(16, function (err, raw) {
        if (err) return cb(err);
        const filename = raw.toString('hex');
        const uploadStream = bucket.openUploadStream(filename);
        if (req.body.password) {
          const iv = crypto.randomBytes(16);
          const salt = crypto.randomBytes(64).toString('hex');
          const key = crypto.pbkdf2Sync(req.body.password, salt, 3000, 32, 'sha512');
          const encrypt = new Encrypt({ key, iv });
          uploadStream.on('error', function (error) {
            console.log(error);
          });
          uploadStream.on('finish', function () {
            file.name = filename;
            file.bucketName = bucketName;
            file.size = uploadStream.length;
            file.salt = salt;
            cb(null, file);
          });
          file.stream.pipe(encrypt).pipe(uploadStream);
        }

        // cb(null, {
        //   filename,
        //   data: uploadStream.id,
        // });
      });
    });
  } catch (errror) {
    console.log(errror);
  }
};

GridFSStorage.prototype._removeFile = function _removeFile(req, file, cb) {
  const { db } = mongoose.connection;
  const options = { bucketName: file.bucketName };
  const bucket = new mongodb.GridFSBucket(db, options);
  bucket.delete(file.id, cb);
};

module.exports = function (opts) {
  return new GridFSStorage(opts);
};

const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const fileSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    encoding: {
      type: String,
    },
    mimetype: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: Date,
      // one year from creation date
      default: Date.now() + 31536000000,
    },
    expiryCount: {
      type: Number,
      default: -1,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

fileSchema.plugin(toJSON);

/**
 * search for file by name
 * @param {string} name filename
 * @returns Promise<File>
 */
fileSchema.statics.findByName = async function (name) {
  return this.findOne({ name });
};

/**
 * @typedef File
 */
const File = mongoose.model('File', fileSchema);

module.exports = File;

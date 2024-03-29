const { binary } = require('joi');
const Joi = require('joi');

const uploadFile = {
  body: Joi.object().keys({
    password: Joi.string(),
    expiryCount: Joi.number().integer(),
    expiryDate: Joi.date(),
  }),
  file: Joi.array().items(binary).max(1),
};

const getFile = {
  params: Joi.object().keys({
    filename: Joi.string().required(),
  }),
  query: Joi.object().keys({
    password: Joi.string().required(),
  }),
};

const getFileMetadata = {
  params: Joi.object().keys({
    filename: Joi.string().required(),
  }),
};

const updateFile = {
  params: Joi.object().keys({
    filename: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      expiryCount: Joi.number().integer(),
      expiryDate: Joi.date(),
    })
    .min(1),
};

const deleteFile = {
  params: Joi.object().keys({
    filename: Joi.string().required(),
  }),
};

module.exports = {
  uploadFile,
  getFile,
  updateFile,
  deleteFile,
  getFileMetadata,
};

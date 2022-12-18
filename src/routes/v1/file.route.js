const express = require('express');
const authRoute = require('./auth.route');
const validate = require('../../middlewares/validate');
const fileValidation = require('../../validations/file.validation');
const fileController = require('../../controllers/file.controller');
const auth = require('../../middlewares/auth');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
router
  .route('/')
  .post(auth(), validate(fileValidation.createFile), upload.single('file'), fileController.uploadFile)
  .get(auth(), fileController.getFiles);

router
  .route('/:filename')
  .get(validate(fileValidation.getFile), fileController.getFile)
  .patch(auth(), validate(fileValidation.updateFile), fileController.updateFile)
  .delete(auth(), validate(fileValidation.deleteFile), fileController.deleteFile);
// .patch(auth(),validate(fileValidation.updateFile), fileController.updateFile)
// .delete(auth(),validate(fileValidation.deleteFile), fileController.deleteFile);

module.exports = router;

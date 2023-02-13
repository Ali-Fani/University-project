const express = require('express');
const multer = require('multer');
// const uploader = require('../../middlewares/encryptioHandler');
const validate = require('../../middlewares/validate');
const fileValidation = require('../../validations/file.validation');
const fileController = require('../../controllers/file.controller');
const auth = require('../../middlewares/auth');
const GridFSStorage = require('../../config/GridFSEngine');

const router = express.Router();
const gridFS = GridFSStorage({
  bucketName(req, file, cb) {
    cb(null, 'files');
  },
});
const memory = multer.memoryStorage();
const upload = multer({ storage: memory, limits: { files: 1 } });
router
  .route('/')
  .post(auth(), validate(fileValidation.uploadFile), upload.single('file'), fileController.uploadFile)
  .get(auth(), fileController.getFiles);

router
  .route('/:filename')
  .get(validate(fileValidation.getFile), fileController.getFile)
  .patch(auth(), validate(fileValidation.updateFile), fileController.updateFile)
  .delete(auth(), validate(fileValidation.deleteFile), fileController.deleteFile);

router.route('/:filename/metadata').get(validate(fileValidation.getFileMetadata), fileController.getFileMetadata);
// .patch(auth(),validate(fileValidation.updateFile), fileController.updateFile)
// .delete(auth(),validate(fileValidation.deleteFile), fileController.deleteFile);

module.exports = router;

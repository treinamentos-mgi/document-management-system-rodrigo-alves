const express = require('express');
const multer = require('multer');
const fs = require('node:fs/promises');
const { randomUUID } = require('node:crypto');
const { maxFileSizeBytes, storageDirectory } = require('../config');
const documentsController = require('../controllers/documentsController');

const router = express.Router();
const storage = multer.diskStorage({
  destination(req, file, callback) {
    fs.mkdir(storageDirectory, { recursive: true })
      .then(() => callback(null, storageDirectory))
      .catch(callback);
  },
  filename(req, file, callback) {
    callback(null, randomUUID());
  },
});
const upload = multer({
  storage,
  limits: {
    fileSize: maxFileSizeBytes,
    files: 1,
  },
});

function parseUpload(req, res, next) {
  upload.single('file')(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (!(error instanceof multer.MulterError) && !error.code) {
      error.statusCode = 400;
    }
    return next(error);
  });
}

router.post('/upload', parseUpload, documentsController.upload);
router.get('/documents', documentsController.list);
router.get('/documents/:id/download', documentsController.download);

module.exports = router;
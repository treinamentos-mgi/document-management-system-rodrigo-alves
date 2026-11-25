const express = require('express');
const multer = require('multer');
const { randomUUID } = require('node:crypto');
const fs = require('node:fs');

function createDocumentRouter({ controller, storageDir, maxFileSizeBytes }) {
  fs.mkdirSync(storageDir, { recursive: true });

  const upload = multer({
    storage: multer.diskStorage({
      destination: storageDir,
      filename: (req, _file, callback) => callback(null, req.documentId),
    }),
    limits: { fileSize: maxFileSizeBytes, files: 1 },
  });
  const router = express.Router();

  router.post('/upload', (req, res, next) => {
    req.documentId = randomUUID();
    upload.single('file')(req, res, (error) => {
      if (error) {
        if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
          return next(Object.assign(new Error('Arquivo excede o limite permitido.'), { status: 413 }));
        }
        return next(Object.assign(new Error('Requisição de upload inválida.'), { status: 400 }));
      }

      controller.upload(req, res).catch(next);
    });
  });

  router.get('/documents', (req, res, next) => {
    try {
      controller.list(req, res);
    } catch (error) {
      next(error);
    }
  });

  router.get('/documents/:id/download', (req, res, next) => {
    controller.download(req, res).catch(next);
  });

  return router;
}

module.exports = createDocumentRouter;

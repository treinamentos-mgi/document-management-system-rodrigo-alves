const fs = require('node:fs/promises');
const path = require('node:path');
const documentsService = require('../services/documentsService');

async function upload(req, res, next) {
  if (!req.file) {
    return res.status(400).json({ error: 'O campo de arquivo "file" é obrigatório.' });
  }

  try {
    const document = await documentsService.createDocument(req.file);
    return res.status(201).json(document);
  } catch (error) {
    await fs.unlink(req.file.path).catch(() => {});
    return next(error);
  }
}

function list(req, res, next) {
  try {
    return res.status(200).json(documentsService.listDocuments());
  } catch (error) {
    return next(error);
  }
}

async function download(req, res, next) {
  try {
    const { document, filePath } = await documentsService.getDocumentForDownload(
      req.params.id
    );
    const downloadName = path
      .basename(document.originalName.replace(/\\/g, '/'))
      .replace(/[\u0000-\u001f\u007f]/g, '_') || 'document';

    res.download(
      filePath,
      downloadName,
      { headers: { 'Content-Type': 'application/octet-stream' } },
      (error) => {
        if (error) {
          next(error);
        }
      }
    );
  } catch (error) {
    return next(error);
  }
}

module.exports = { upload, list, download };
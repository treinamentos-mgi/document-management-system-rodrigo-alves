const { randomUUID } = require('node:crypto');
const documentsRepository = require('../repositories/documentsRepository');

function toPublicDocument(document) {
  const { id, originalName, size, uploadedAt, owner } = document;
  return { id, originalName, size, uploadedAt, owner };
}

async function createDocument(file) {
  const document = {
    id: randomUUID(),
    originalName: file.originalname,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner: 'default',
    storedName: file.filename,
    contentType: file.mimetype || 'application/octet-stream',
  };

  await documentsRepository.save(document);
  return toPublicDocument(document);
}

function listDocuments() {
  return documentsRepository
    .findAll()
    .sort((left, right) => right.uploadedAt.localeCompare(left.uploadedAt))
    .map(toPublicDocument);
}

async function getDocumentForDownload(id) {
  const document = documentsRepository.findById(id);
  if (!document) {
    throw createNotFoundError();
  }

  const filePath = documentsRepository.getFilePath(document.storedName);
  try {
    await documentsRepository.assertFileExists(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw createNotFoundError();
    }
    throw error;
  }

  return { document: toPublicDocument(document), filePath };
}

function createNotFoundError() {
  const error = new Error('Documento não encontrado.');
  error.statusCode = 404;
  return error;
}

module.exports = { createDocument, listDocuments, getDocumentForDownload };
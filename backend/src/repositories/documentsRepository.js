const fs = require('node:fs/promises');
const path = require('node:path');
const { storageDirectory } = require('../config');

const documents = new Map();

async function save(document) {
  documents.set(document.id, document);
}

function findAll() {
  return Array.from(documents.values());
}

function findById(id) {
  return documents.get(id) || null;
}

function getFilePath(storedName) {
  if (!storedName || path.basename(storedName) !== storedName) {
    return null;
  }
  return path.join(storageDirectory, storedName);
}

async function assertFileExists(filePath) {
  if (!filePath) {
    const error = new Error('Documento não encontrado.');
    error.code = 'ENOENT';
    throw error;
  }
  await fs.access(filePath);
}

module.exports = { save, findAll, findById, getFilePath, assertFileExists };
const path = require('node:path');
const fs = require('node:fs/promises');

const STORED_NAME_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

class DocumentRepository {
  constructor(storageDir) {
    this.storageDir = storageDir;
    this.documents = new Map();
  }

  save(document) {
    this.documents.set(document.id, document);
  }

  list() {
    return [...this.documents.values()]
      .sort((first, second) => second.uploadedAt.localeCompare(first.uploadedAt))
      .map(({ id, originalName, size, uploadedAt, owner }) => ({
        id,
        originalName,
        size,
        uploadedAt,
        owner,
      }));
  }

  findById(id) {
    return this.documents.get(id);
  }

  getFilePath(document) {
    return path.join(this.storageDir, document.storedName);
  }

  async removeStoredFile(storedName) {
    if (!STORED_NAME_PATTERN.test(storedName)) {
      throw new Error('Nome de arquivo interno inválido.');
    }

    await fs.unlink(path.join(this.storageDir, storedName));
  }
}

module.exports = DocumentRepository;

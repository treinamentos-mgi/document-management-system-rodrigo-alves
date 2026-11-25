const path = require('node:path');

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
}

module.exports = DocumentRepository;

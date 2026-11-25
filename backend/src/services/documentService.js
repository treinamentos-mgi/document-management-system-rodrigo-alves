const { randomUUID } = require('node:crypto');
const fs = require('node:fs/promises');

class DocumentService {
  constructor(documentRepository) {
    this.documentRepository = documentRepository;
  }

  async registerUpload(file) {
    const document = {
      id: randomUUID(),
      originalName: file.originalname,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      owner: 'default',
      storedName: file.filename,
    };

    try {
      this.documentRepository.save(document);
    } catch (error) {
      await fs.unlink(file.path).catch(() => {});
      throw error;
    }

    return {
      id: document.id,
      originalName: document.originalName,
      size: document.size,
      uploadedAt: document.uploadedAt,
      owner: document.owner,
    };
  }

  listDocuments() {
    return this.documentRepository.list();
  }

  getDownload(id) {
    const document = this.documentRepository.findById(id);
    if (!document) return null;

    return {
      filePath: this.documentRepository.getFilePath(document),
      originalName: document.originalName,
    };
  }
}

module.exports = DocumentService;

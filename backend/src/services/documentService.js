class DocumentService {
  constructor(documentRepository) {
    this.documentRepository = documentRepository;
  }

  async registerUpload(file, id) {
    const document = {
      id,
      originalName: file.originalname,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      owner: 'default',
      storedName: id,
    };

    try {
      this.documentRepository.save(document);
    } catch (error) {
      await this.documentRepository.removeStoredFile(id).catch(() => {});
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

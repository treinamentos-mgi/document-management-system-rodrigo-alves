class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

class DocumentController {
  constructor(documentService) {
    this.documentService = documentService;
  }

  async upload(req, res) {
    if (!req.file) {
      throw new HttpError(400, 'Arquivo obrigatório.');
    }

    const document = await this.documentService.registerUpload(req.file, req.documentId);
    res.status(201).json(document);
  }

  list(_req, res) {
    res.json(this.documentService.listDocuments());
  }

  async download(req, res) {
    const document = this.documentService.getDownload(req.params.id);
    if (!document) {
      throw new HttpError(404, 'Documento não encontrado.');
    }

    const originalName = document.originalName
      .replace(/\\/g, '/')
      .split('/')
      .pop()
      .replace(/[\u0000-\u001f\u007f"]/g, '_') || 'document';

    await new Promise((resolve, reject) => {
      res.download(
        document.filePath,
        originalName,
        { headers: { 'Content-Type': 'application/octet-stream' } },
        (error) => (error ? reject(error) : resolve()),
      );
    });
  }
}

module.exports = DocumentController;

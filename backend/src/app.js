const express = require('express');
const path = require('node:path');
const createDocumentRouter = require('./routes/documentRoutes');
const DocumentController = require('./controllers/documentController');
const DocumentService = require('./services/documentService');
const DocumentRepository = require('./repositories/documentRepository');

const PORT = process.env.PORT || 3000;
const DEFAULT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function parseMaxFileSize(value) {
  const maxFileSizeBytes = Number(value);
  if (!Number.isSafeInteger(maxFileSizeBytes) || maxFileSizeBytes <= 0) {
    throw new Error('MAX_FILE_SIZE_BYTES deve ser um inteiro positivo.');
  }
  return maxFileSizeBytes;
}

function createApp(options = {}) {
  const app = express();
  const storageDir = path.resolve(
    options.storageDir || path.join(__dirname, '..', 'storage'),
  );
  const maxFileSizeBytes = parseMaxFileSize(
    options.maxFileSizeBytes ?? process.env.MAX_FILE_SIZE_BYTES ?? DEFAULT_MAX_FILE_SIZE_BYTES,
  );

  app.use(express.json());
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  const documentRepository = new DocumentRepository(storageDir);
  const documentService = new DocumentService(documentRepository);
  const documentController = new DocumentController(documentService);
  app.use(createDocumentRouter({
    controller: documentController,
    storageDir,
    maxFileSizeBytes,
  }));
  app.use((error, _req, res, _next) => {
    if (res.headersSent) return;
    const status = error.status || (error.code === 'ENOENT' ? 404 : 500);
    const message = status === 404
      ? 'Documento não encontrado.'
      : status === 400 || status === 413
        ? error.message
        : 'Erro interno do servidor.';
    res.status(status).json({ error: message });
  });

  return app;
}

const app = createApp();

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`DMS backend ouvindo na porta ${PORT}`);
  });
}

module.exports = app;
module.exports.createApp = createApp;

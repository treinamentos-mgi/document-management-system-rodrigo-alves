const path = require('node:path');

const defaultMaxFileSizeBytes = 10 * 1024 * 1024;
const maxFileSizeBytes = Number(
  process.env.MAX_FILE_SIZE_BYTES ?? defaultMaxFileSizeBytes
);

if (!Number.isSafeInteger(maxFileSizeBytes) || maxFileSizeBytes <= 0) {
  throw new Error('MAX_FILE_SIZE_BYTES deve ser um inteiro positivo.');
}

module.exports = {
  maxFileSizeBytes,
  storageDirectory: path.resolve(__dirname, '../storage'),
};
const multer = require('multer');

function handleError(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof multer.MulterError) {
    const isTooLarge = error.code === 'LIMIT_FILE_SIZE';
    const statusCode = isTooLarge ? 413 : 400;
    const message = isTooLarge
      ? 'O arquivo excede o tamanho máximo permitido.'
      : 'A requisição de upload é inválida.';
    return res.status(statusCode).json({ error: message });
  }

  if (error.statusCode === 400) {
    return res.status(400).json({ error: 'A requisição de upload é inválida.' });
  }

  if (error.statusCode === 404) {
    return res.status(404).json({ error: 'Documento não encontrado.' });
  }

  return res.status(500).json({ error: 'Erro interno do servidor.' });
}

module.exports = { handleError };
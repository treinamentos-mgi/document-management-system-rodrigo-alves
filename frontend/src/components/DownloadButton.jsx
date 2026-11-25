import { useState } from 'react';
import { downloadDocument } from '../services/documentsApi.js';

function safeDownloadName(name) {
  return name
    .replace(/\\/g, '/')
    .split('/')
    .pop()
    .replace(/[\u0000-\u001f\u007f]/g, '_') || 'document';
}

export default function DownloadButton({ document }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');

  async function handleDownload() {
    setIsDownloading(true);
    setError('');
    try {
      const file = await downloadDocument(document.id);
      const objectUrl = URL.createObjectURL(file);
      const link = window.document.createElement('a');
      link.href = objectUrl;
      link.download = safeDownloadName(document.originalName);
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (downloadError) {
      setError(downloadError.message);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="download-control">
      <button
        className="download-button"
        type="button"
        onClick={handleDownload}
        disabled={isDownloading}
        aria-label={`Baixar ${document.originalName}`}
        title={`Baixar ${document.originalName}`}
      >
        <span aria-hidden="true">↓</span>
        <span>{isDownloading ? 'Baixando' : 'Baixar'}</span>
      </button>
      {error && <span className="download-error" role="alert">{error}</span>}
    </div>
  );
}
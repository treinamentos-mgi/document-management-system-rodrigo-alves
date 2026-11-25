import { useEffect, useState } from 'react';
import DocumentList from './components/DocumentList.jsx';
import UploadComponent from './components/UploadComponent.jsx';
import { listDocuments, uploadDocument } from './services/documentsApi.js';
import './App.css';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [notice, setNotice] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    async function loadDocuments() {
      setIsLoading(true);
      setListError('');
      try {
        const result = await listDocuments();
        if (isCurrent) {
          setDocuments(result);
        }
      } catch (error) {
        if (isCurrent) {
          setListError(error.message);
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadDocuments();
    return () => {
      isCurrent = false;
    };
  }, [refreshKey]);

  async function handleUpload(file) {
    const createdDocument = await uploadDocument(file);
    setDocuments((currentDocuments) => [
      createdDocument,
      ...currentDocuments.filter((document) => document.id !== createdDocument.id),
    ]);
    setNotice(`${createdDocument.originalName} foi enviado.`);
    setRefreshKey((currentKey) => currentKey + 1);
  }

  function handleRefresh() {
    setNotice('');
    setRefreshKey((currentKey) => currentKey + 1);
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="DMS, início">
          <span className="brand-mark" aria-hidden="true">D.</span>
          <span className="brand-name">arquivo<span>/</span>local</span>
        </a>
        <div className="header-meta">
          <span className="status-dot" aria-hidden="true" />
          <span>Espaço pessoal</span>
        </div>
      </header>

      <main className="main-content" id="inicio">
        <section className="page-intro" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">DOCUMENT MANAGEMENT SYSTEM <span> / 01</span></p>
            <h1 id="page-title">Seus documentos,<br className="desktop-break" /> em um só lugar.</h1>
            <p className="intro-copy">Envie, organize e recupere seus arquivos com simplicidade.</p>
          </div>
          <div className="document-counter" aria-live="polite">
            <span className="counter-value">{documents.length.toString().padStart(2, '0')}</span>
            <span className="counter-label">{documents.length === 1 ? 'documento' : 'documentos'}<br />no arquivo</span>
          </div>
        </section>

        {notice && (
          <p className="notice" role="status">
            <span aria-hidden="true">✓</span> {notice}
            <button type="button" className="notice-dismiss" onClick={() => setNotice('')} aria-label="Dispensar aviso">×</button>
          </p>
        )}

        <div className="workspace-grid">
          <aside className="upload-column" aria-label="Enviar documento">
            <UploadComponent onUpload={handleUpload} />
            <div className="storage-note">
              <span className="storage-note-mark" aria-hidden="true">⌂</span>
              <p><strong>Armazenamento local</strong><br />Seus arquivos ficam neste espaço.</p>
            </div>
          </aside>

          <DocumentList
            documents={documents}
            isLoading={isLoading}
            error={listError}
            onRefresh={handleRefresh}
          />
        </div>
      </main>

      <footer className="site-footer">
        <span>DMS <span className="footer-separator">/</span> ARQUIVO LOCAL</span>
        <span>Feito para manter o essencial em ordem.</span>
      </footer>
    </div>
  );
}

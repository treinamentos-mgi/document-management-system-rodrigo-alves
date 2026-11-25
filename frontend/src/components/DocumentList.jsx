import DownloadButton from './DownloadButton.jsx';

function formatFileSize(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function getFileExtension(name) {
  const extension = name.split('.').pop();
  return extension && extension !== name ? extension.slice(0, 4).toUpperCase() : 'FILE';
}

export default function DocumentList({ documents, isLoading, error, onRefresh }) {
  return (
    <section className="documents-section" aria-labelledby="documents-title">
      <div className="documents-heading">
        <div className="section-heading">
          <span className="section-index section-index-warm">02</span>
          <div>
            <p className="eyebrow">SEU ESPAÇO</p>
            <h2 id="documents-title">Documentos</h2>
          </div>
        </div>
        <button
          className="icon-button refresh-button"
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          aria-label="Atualizar documentos"
          title="Atualizar documentos"
        >
          <span aria-hidden="true">↻</span>
        </button>
      </div>

      {error ? (
        <div className="list-message list-error" role="alert">
          <span>{error}</span>
          <button type="button" className="text-button" onClick={onRefresh}>Tentar novamente</button>
        </div>
      ) : isLoading ? (
        <div className="list-message" role="status">Carregando documentos...</div>
      ) : documents.length === 0 ? (
        <div className="empty-state">
          <span className="empty-symbol" aria-hidden="true">▤</span>
          <h3>Nenhum documento ainda</h3>
          <p>Os arquivos enviados aparecerão aqui, prontos para baixar.</p>
        </div>
      ) : (
        <>
          <div className="list-summary">
            <span>{documents.length === 1 ? '1 ARQUIVO' : `${documents.length} ARQUIVOS`}</span>
            <span>MAIS RECENTES PRIMEIRO</span>
          </div>
          <div className="document-list" role="list" aria-label="Documentos enviados">
            {documents.map((document) => (
              <article className="document-row" key={document.id} role="listitem">
                <span className="file-badge" aria-hidden="true">
                  {getFileExtension(document.originalName)}
                </span>
                <div className="document-name">
                  <h3 title={document.originalName}>{document.originalName}</h3>
                  <span>{formatFileSize(document.size)}</span>
                </div>
                <div className="document-date">
                  <span className="row-label">ENVIADO</span>
                  <time dateTime={document.uploadedAt}>{formatDate(document.uploadedAt)}</time>
                </div>
                <div className="document-owner">
                  <span className="row-label">PROPRIETÁRIO</span>
                  <span>{document.owner === 'default' ? 'Você' : document.owner}</span>
                </div>
                <DownloadButton document={document} />
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
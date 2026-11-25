import { useRef, useState } from 'react';

export default function UploadComponent({ onUpload }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef(null);

  function selectFile(file) {
    if (file) {
      setSelectedFile(file);
      setError('');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!selectedFile) {
      setError('Escolha um arquivo para enviar.');
      return;
    }

    setIsUploading(true);
    setError('');
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      formRef.current?.reset();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsUploading(false);
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    selectFile(event.dataTransfer.files[0]);
  }

  return (
    <section className="upload-panel" aria-labelledby="upload-title">
      <div className="section-heading">
        <span className="section-index">01</span>
        <div>
          <p className="eyebrow">ADICIONAR AO ARQUIVO</p>
          <h2 id="upload-title">Enviar documento</h2>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit}>
        <label
          className={`drop-zone${selectedFile ? ' has-file' : ''}`}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          <input
            className="file-input"
            type="file"
            onChange={(event) => selectFile(event.target.files[0])}
            aria-label="Selecionar documento"
          />
          <span className="upload-icon" aria-hidden="true">↑</span>
          <span className="drop-title">
            {selectedFile ? 'Arquivo selecionado' : 'Solte seu arquivo aqui'}
          </span>
          <span className="drop-hint">
            {selectedFile ? selectedFile.name : 'ou clique para procurar'}
          </span>
          <span className="drop-format">TODOS OS FORMATOS</span>
        </label>

        {error && <p className="form-error" role="alert">{error}</p>}

        <button className="primary-button upload-submit" type="submit" disabled={isUploading}>
          <span aria-hidden="true">{isUploading ? '…' : '+'}</span>
          {isUploading ? 'Enviando...' : 'Enviar arquivo'}
        </button>
      </form>
      <p className="upload-footnote">O limite de tamanho é definido pelo servidor.</p>
    </section>
  );
}
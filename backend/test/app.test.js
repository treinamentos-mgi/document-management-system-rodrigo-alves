const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtemp, rm } = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const app = require('../src/app');

test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

describe('endpoints de documentos', () => {
  let storageDir;
  let server;
  let baseUrl;

  beforeEach(async () => {
    storageDir = await mkdtemp(path.join(os.tmpdir(), 'dms-test-'));
    server = app.createApp({ storageDir, maxFileSizeBytes: 4 }).listen(0, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  afterEach(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    await rm(storageDir, { recursive: true, force: true });
  });

  test('faz upload, lista metadados e baixa o arquivo', async () => {
    const form = new FormData();
    form.append('file', new Blob(['data'], { type: 'text/plain' }), 'sample.txt');

    const uploadResponse = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      body: form,
    });
    assert.equal(uploadResponse.status, 201);
    const document = await uploadResponse.json();
    assert.match(document.id, /^[0-9a-f-]{36}$/i);
    assert.equal(document.originalName, 'sample.txt');
    assert.equal(document.size, 4);
    assert.equal(document.owner, 'default');
    assert.ok(document.uploadedAt);
    assert.deepEqual(Object.keys(document).sort(), [
      'id',
      'originalName',
      'owner',
      'size',
      'uploadedAt',
    ]);

    const listResponse = await fetch(`${baseUrl}/documents`);
    assert.equal(listResponse.status, 200);
    assert.deepEqual(await listResponse.json(), [document]);

    const downloadResponse = await fetch(
      `${baseUrl}/documents/${document.id}/download`,
    );
    assert.equal(downloadResponse.status, 200);
    assert.equal(downloadResponse.headers.get('content-type'), 'application/octet-stream');
    assert.match(downloadResponse.headers.get('content-disposition'), /attachment/);
    assert.deepEqual(
      Buffer.from(await downloadResponse.arrayBuffer()),
      Buffer.from('data'),
    );
  });

  test('rejeita upload sem arquivo', async () => {
    const response = await fetch(`${baseUrl}/upload`, { method: 'POST' });
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: 'Arquivo obrigatório.' });
  });

  test('rejeita arquivo acima do limite sem listá-lo', async () => {
    const form = new FormData();
    form.append('file', new Blob(['12345']), 'large.bin');

    const response = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      body: form,
    });
    assert.equal(response.status, 413);
    assert.deepEqual(await response.json(), {
      error: 'Arquivo excede o limite permitido.',
    });

    const listResponse = await fetch(`${baseUrl}/documents`);
    assert.deepEqual(await listResponse.json(), []);
  });

  test('retorna 404 para documento inexistente', async () => {
    const response = await fetch(
      `${baseUrl}/documents/00000000-0000-4000-8000-000000000000/download`,
    );
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { error: 'Documento não encontrado.' });
  });
});

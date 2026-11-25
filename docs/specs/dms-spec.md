# Especificação - Document Management System

## 1. Objetivo

Entregar uma aplicação web simples para enviar, listar e baixar documentos armazenados no filesystem local, com metadados mantidos em memória.

## 2. Escopo

### Dentro do escopo

- Envio de um documento por requisição HTTP.
- Listagem dos documentos disponíveis com seus metadados.
- Download de um documento pelo identificador.
- Interface web em React para upload, listagem e download.
- Identificação simples do proprietário dos documentos para preparar evolução futura; no MVP existe um único usuário lógico, sem login.
- Limite de tamanho de upload configurável por variável de ambiente.
- Respostas de erro previsíveis para entradas inválidas, documentos inexistentes e falhas internas.

### Fora do escopo

- Armazenamento em nuvem, bancos de dados ou provedores externos.
- Versionamento, edição, compartilhamento ou exclusão de documentos.
- Autenticação, cadastro de usuários e isolamento de documentos entre usuários.
- Restrições de formato ou conteúdo de arquivo além do limite de tamanho.
- Persistência durável dos metadados após reinício do processo.
- Paginação e busca na listagem.

## 3. Requisitos funcionais

| ID    | Requisito | Critério de aceite |
| ----- | --------- | ------------------ |
| RF-01 | O usuário pode enviar um documento por `POST /upload`, como `multipart/form-data`, no campo `file`. | Uma requisição válida grava o arquivo localmente e retorna `201` com os metadados públicos do documento. |
| RF-02 | O sistema rejeita upload sem arquivo ou que exceda o limite configurado. | Ausência do campo `file` retorna `400`; tamanho acima do limite retorna `413`; nenhuma entrada aparece na listagem após rejeição. |
| RF-03 | O sistema aceita qualquer tipo de arquivo, sujeito ao limite de tamanho. | O tipo MIME ou extensão não é usado para rejeitar o upload no MVP. |
| RF-04 | O usuário pode listar documentos por `GET /documents`. | A resposta `200` contém um array de metadados públicos, ordenado do mais recente para o mais antigo. |
| RF-05 | O usuário pode baixar um documento por `GET /documents/:id/download`. | Para um documento existente, a resposta `200` contém o arquivo como anexo; para um identificador sem documento correspondente, retorna `404`. |
| RF-06 | O sistema atribui um identificador único a cada documento. | O identificador é um UUID gerado pelo servidor e não é derivado do nome original do arquivo. |
| RF-07 | O sistema registra o proprietário lógico de cada documento. | No MVP sem autenticação, o campo `owner` recebe o valor fixo `default`; não há filtragem nem autorização por proprietário. |
| RF-08 | O sistema retorna erros em formato JSON consistente. | Erros das rotas documentadas usam `{ "error": "mensagem" }` e um status HTTP correspondente, sem expor caminhos locais ou detalhes internos. |

## 4. Requisitos não funcionais

| ID     | Requisito | Critério / restrição |
| ------ | --------- | -------------------- |
| RNF-01 | Arquivos são persistidos somente no filesystem local usando Multer `diskStorage`. | O diretório de destino é `backend/storage`; não são usados serviços externos. |
| RNF-02 | Metadados são mantidos em memória nesta fase. | Um reinício do backend perde os metadados; arquivos existentes no disco podem ficar sem referência na listagem e não são removidos automaticamente. |
| RNF-03 | Configuração segue o princípio 12-Factor. | `PORT` define a porta do backend (padrão `3000`) e `MAX_FILE_SIZE_BYTES` define o tamanho máximo (padrão `10485760`, ou 10 MiB). O limite deve ser um inteiro positivo. |
| RNF-04 | O backend usa Clean Architecture simples. | Dependências seguem `routes -> controllers -> services -> repositories`; regras de negócio ficam nos services e persistência fica nos repositories. |
| RNF-05 | A interface usa React e consome a API com `fetch`. | Chamadas do frontend usam o prefixo `/api`; o proxy do Vite o encaminha ao backend removendo esse prefixo. |
| RNF-06 | Nomes fornecidos pelo cliente não controlam caminhos no servidor. | O arquivo recebe nome interno gerado pelo servidor; o nome original é somente metadado e nome sugerido no download. |
| RNF-07 | Downloads não executam conteúdo enviado no navegador. | A resposta usa `Content-Disposition: attachment` e `Content-Type: application/octet-stream`. |
| RNF-08 | A aplicação não deve ser exposta a usuários não confiáveis sem uma camada de autenticação/autorização. | O MVP não implementa autenticação e trata todos os clientes como o mesmo usuário lógico. |
| RNF-09 | Falhas de escrita ou leitura são tratadas nos limites do sistema. | O cliente recebe erro JSON genérico; detalhes técnicos ficam fora da resposta HTTP. Um arquivo gravado sem metadados por falha no registro deve ser removido quando possível. |

## 5. Modelo de dados (metadados do documento)

Os campos públicos abaixo compõem a resposta de upload e os itens da listagem. Os metadados residem em memória no backend.

| Campo        | Tipo   | Descrição |
| ------------ | ------ | --------- |
| `id` | string | UUID único gerado pelo servidor e usado nas rotas de download. |
| `originalName` | string | Nome original fornecido pelo cliente; exibido como metadado e nome sugerido no download, nunca usado como caminho físico. |
| `size` | number | Tamanho do arquivo em bytes. |
| `uploadedAt` | string | Data e hora do upload em ISO 8601 UTC. |
| `owner` | string | Identificador do proprietário lógico; valor `default` no MVP, sem autenticação. |

O registro interno do repositório também mantém `storedName` (string, nome gerado para localizar o arquivo em `backend/storage`) e `contentType` (string, se fornecido pelo middleware). Esses campos são internos e não são retornados nos metadados públicos. O conteúdo efetivo permanece no filesystem, não na estrutura em memória.

## 6. Contratos de API

As rotas abaixo são caminhos do backend. O frontend usa `/api` como prefixo por causa do proxy do Vite; por exemplo, `POST /api/upload` é encaminhado para `POST /upload`.

Erros usam o formato `{ "error": "mensagem" }`. Não são retornados stack traces, caminhos locais nem detalhes internos.

### POST /upload

- Entrada: `multipart/form-data` com exatamente um arquivo no campo `file`.
- Validação: arquivo obrigatório; tamanho máximo definido por `MAX_FILE_SIZE_BYTES`; qualquer tipo de arquivo é aceito dentro do limite.
- Sucesso: `201 Created`, corpo JSON com os metadados públicos:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "originalName": "relatorio.pdf",
  "size": 24576,
  "uploadedAt": "2026-11-25T12:00:00.000Z",
  "owner": "default"
}
```

- Erros: `400 Bad Request` para arquivo ausente ou requisição multipart inválida; `413 Payload Too Large` quando o arquivo excede o limite; `500 Internal Server Error` para falha inesperada de armazenamento ou registro.
- Em caso de falha após a gravação no disco, o backend tenta remover o arquivo sem metadados.

### GET /documents

- Entrada: sem parâmetros ou corpo.
- Sucesso: `200 OK`, corpo JSON como array de metadados públicos, ordenado por `uploadedAt` decrescente. Sem documentos, retorna `[]`.
- Erro: `500 Internal Server Error` para falha inesperada ao consultar o repositório.

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "originalName": "relatorio.pdf",
    "size": 24576,
    "uploadedAt": "2026-11-25T12:00:00.000Z",
    "owner": "default"
  }
]
```

### GET /documents/:id/download

- Entrada: `id` UUID na URL; sem corpo.
- Sucesso: `200 OK`, bytes do arquivo, `Content-Type: application/octet-stream` e `Content-Disposition: attachment` com o nome original sanitizado como nome sugerido.
- Erro: `404 Not Found` quando não houver metadados ou arquivo correspondente; `500 Internal Server Error` para falha inesperada de leitura.
- O identificador é resolvido pelo repositório. O caminho de leitura deve permanecer dentro de `backend/storage` e nunca ser construído a partir de entrada de caminho fornecida pelo cliente.

## 7. Decisões arquiteturais

- Backend em Node.js + Express, usando CommonJS.
- As rotas definem os endpoints e conectam middleware e controllers; controllers tratam HTTP e validação básica; services concentram regras de negócio; repositories mantêm os metadados em memória e abstraem a localização dos arquivos locais.
- Multer com `diskStorage` grava uploads em `backend/storage`, usando um nome interno gerado pelo servidor. A configuração de upload não deve permitir que o nome enviado pelo cliente escolha o destino.
- O modelo de metadados é uma estrutura em memória; não há banco de dados nesta fase.
- Frontend em React + Vite, com componentes funcionais e comunicação via `fetch` pelo proxy `/api`.
- A aplicação preserva o endpoint existente `GET /health` para verificação de disponibilidade.
- MVP de usuário único sem login: `owner` é `default`. Autenticação e autorização ficam para uma evolução futura e são pré-requisito antes de expor a aplicação a usuários não confiáveis.
- Arquivos podem sobreviver a reinícios enquanto seus metadados não; reconciliação, limpeza e persistência durável ficam fora do escopo atual.

## 8. Plano de execução

As etapas abaixo descrevem trabalho futuro. Esta especificação não autoriza nem executa alterações nos arquivos de backend ou frontend.

1. **Fundação do backend:** configurar variáveis de ambiente e diretório local; definir a estrutura de rotas, controllers, services e repositories; preservar o healthcheck.
2. **Upload e registro:** configurar Multer `diskStorage`, validar campo e tamanho, gerar UUID e nome interno, registrar metadados em memória e tratar limpeza em falhas.
3. **Listagem e download:** implementar consulta ordenada e resolução segura do arquivo por identificador, com respostas e erros conforme os contratos.
4. **Testes do backend:** cobrir upload válido/inválido, limite de tamanho, listagem vazia e populada, download existente/inexistente e respostas de erro; manter os arquivos de teste isolados do armazenamento de execução.
5. **Interface e integração:** criar cliente `fetch` e componentes React para upload, listagem e download; consumir a API via `/api`; apresentar estados de carregamento e erros.
6. **Validação ponta a ponta:** executar testes, iniciar frontend e backend, verificar upload/listagem/download no navegador e confirmar que os arquivos ficam somente em `backend/storage`.

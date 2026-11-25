---
description: Avalia e refatora um módulo existente sem alterar seu comportamento público.
name: refatoramento
argument-hint: caminho do módulo a avaliar (ex. backend/src/services/documentsService.js)
agent: agent
---

# Avaliar e refatorar módulo

Avalie e refatore o módulo `${input:modulo:caminho do módulo}`. Primeiro leia o módulo, suas dependências diretas, usos relevantes, testes próximos e as instruções aplicáveis do repositório. Identifique problemas concretos de legibilidade, coesão, duplicação, acoplamento ou tratamento de erros antes de editar.

Requisitos:

- Refatore o código existente para melhorar sua estrutura e manutenção, sem adicionar funcionalidades não solicitadas.
- Preserve o comportamento observável, contratos HTTP, APIs públicas e convenções existentes, salvo quando um problema identificado exigir uma alteração justificada.
- Siga os princípios SOLID, DRY, KISS e YAGNI e respeite a arquitetura e as responsabilidades do módulo.
- Mantenha as alterações concentradas no módulo e nos testes diretamente relacionados; não faça limpeza ou reformatação sem relação com a refatoração.
- Reutilize dependências e utilitários já presentes. Não adicione dependências sem necessidade clara.
- Preserve alterações preexistentes do usuário e não reverta mudanças fora do escopo.
- Execute os testes relevantes após a refatoração. Se não houver cobertura adequada, adicione testes focados apenas para proteger o comportamento que está sendo refatorado.
- Ao concluir, resuma os problemas encontrados, as mudanças feitas e os testes executados.

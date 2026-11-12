# Ensaio do workshop

Prompt para um agente (Claude Code na web) fazer o workshop inteiro como um participante, do repositório vazio até o app no ar, e devolver um relatório.

## Antes de usar

Prepare uma conta de ensaio exatamente como um participante, seguindo a página de preparação ([`preparacao.html`](preparacao.html)) ou o [`PREREQUISITES.md`](../PREREQUISITES.md):

- conta pessoal no GitHub, com o repositório `demo` criado (privado, com README);
- Claude Code na web conectado a esse GitHub, com o `demo` aparecendo em **Repo**;
- conta Hobby na Vercel;
- no ambiente **Default** do Claude: o token da Vercel em **Network secrets** (`api.vercel.com`) e `ANTHROPIC_API_KEY` em **Environment variables**.

Abra uma **sessão nova** em [claude.ai/code](https://claude.ai/code), com o ambiente **Default** e o repositório `demo`, e cole o prompt abaixo. O agente para e pede a você só o que um participante faria fora do Claude (por exemplo, o merge do pull request).

## O prompt

```
Você vai ensaiar o workshop "Desenvolvimento de software com IA" do começo ao
fim, como um participante faria, para descobrirmos se as instruções funcionam,
quanto tempo leva e o que precisa ser corrigido antes de fazer com a turma.

Este repositório (demo) foi criado vazio, só com o README, conforme os
pré-requisitos. As instruções oficiais estão no template público
https://github.com/Blueydata/ai-dev-foundation (branch main): WORKSHOP.md,
PREREQUISITES.md, workshop/README.md e workshop/preparacao.html. Você faz dois
papéis: o participante, que só cola os prompts do roteiro e aprova, e o Claude,
que executa.

Regras do ensaio:
- Siga o WORKSHOP.md ao pé da letra, etapa por etapa, usando cada prompt
  exatamente como está escrito. Quando o roteiro chamar uma skill (/setup-project,
  /new-feature, /deliver, /deploy, /fix-bug, /adjust-feature), leia o arquivo
  .claude/skills/<nome>/SKILL.md do projeto e siga-o, porque esta sessão começou
  antes de o projeto existir e não carregou as skills.
- Onde o roteiro manda abrir uma sessão nova, você não consegue: rode
  scripts/cloud-setup.sh, depois "source ~/.dev-foundation-env", leia o
  CLAUDE.md e continue como se estivesse na sessão nova. Registre isso como
  desvio a ser conferido por uma pessoa.
- Registre a hora (date) no começo e no fim de cada etapa.
- Quando o roteiro pedir uma aprovação do participante, aprove como ele
  aprovaria. Quando pedir algo que só uma pessoa faz fora do Claude (o merge do
  pull request no GitHub, aceitar termos no navegador da Vercel ou do Neon),
  pare, diga em uma linha exatamente o que fazer e espere eu responder "pronto".
- Você tem a minha permissão para o push direto na main pedido pelo prompt
  inicial da etapa 1 e para enviar a branch da sessão. Não faça merge de pull
  request: isso fica comigo.
- Nunca mostre, imprima ou peça chaves, tokens ou senhas. Para conferir uma
  variável, use apenas [ -n "$NOME" ].
- Se algo falhar no código do app, corrija como o participante faria (/fix-bug).
  Se a falha for das instruções, do template ou do ambiente, não contorne em
  silêncio: registre e siga no que der.

O que fazer:
1. Confira os pré-requisitos sem revelar valores: ANTHROPIC_API_KEY definida, o
   repositório com só o README e, depois da etapa 1, o token da Vercel
   funcionando (npm run vercel -- whoami --token "$VERCEL_TOKEN").
2. Etapa 1: cole o prompt inicial do WORKSHOP.md (ele traz o template para cá)
   e confira o resultado na main. Depois rode o /setup-project.
3. Etapas 2 a 10: siga o roteiro. Na etapa 7, publique de verdade na Vercel
   (prévia) com o /deploy; depois que eu fizer o merge, publique a main em
   produção. Nas etapas 8 e 9, faça as perguntas e as tentativas de quebrar o
   chat no app publicado (ou, se a rede da sessão não alcançar o link, no app
   local) e compare com a tabela "Respostas certas" do workshop/README.md.
4. Ao terminar cada etapa importante, crie e envie uma branch marcando o ponto:
   etapa-2-negocio, etapa-4-plano, etapa-6-resultado e etapa-10-ajuste.
5. Rode no final: npm run typecheck, npm test, npm run test:integration e
   npm run check:secrets, e confira o CI do pull request.
6. Verifique a coerência: o que o WORKSHOP.md, o PREREQUISITES.md, a página de
   preparação e o CLAUDE.md dizem bate com o que realmente aconteceu? O código
   entregue segue as skills do projeto (estrutura, testes, URL, UI, dados, IA)?
   A documentação (docs/) foi atualizada?

Relatório final: escreva em português no arquivo ENSAIO-RESULTADO.md, faça o
commit e o push na branch da sessão, e responda com o relatório inteiro dentro
de um único bloco de código markdown, para eu copiar e repassar. Ele deve ter:
- uma tabela por etapa: início, fim, duração, resultado (ok, problema ou
  bloqueado) e o que aconteceu em uma linha;
- o tempo total e se cabe em 2 horas, com sugestão do que cortar se não couber;
- cada problema: etapa, o que aconteceu, a causa provável, a correção sugerida
  e o arquivo do template a mudar (WORKSHOP.md, PREREQUISITES.md, preparacao.html,
  uma skill, CLAUDE.md, scripts/ ou src/), marcando o que é bloqueante;
- as respostas do chat comparadas com as esperadas e o resultado das tentativas
  de quebrar o chat;
- os links do pull request, da prévia e da produção na Vercel;
- respostas diretas: o push do prompt inicial foi direto para a main? a
  ANTHROPIC_API_KEY chegou à sessão? a Vercel CLI funcionou com o token do
  cofre? a criação do Neon pediu algo no navegador? a chave foi copiada para a
  Vercel sem aparecer? o painel de pré-visualização do app apareceu? quantas
  confirmações de permissão você pediu, e para quais comandos?
- os resultados de tipos, testes, integração, segredos e CI;
- as branches de etapa criadas, com o commit de cada uma.
```

## Depois do ensaio

Copie o relatório que o agente devolver e cole numa conversa com o Claude no repositório do template: ele corrige as instruções e o template a partir dos problemas encontrados. As branches `etapa-…` criadas no ensaio podem ser copiadas para o template, para a seção "Ficou para trás?" do `WORKSHOP.md` funcionar com a turma.

# Pré-requisitos — tudo na nuvem, sem instalar nada

O que deixar pronto antes do workshop "Desenvolvimento de software com IA": três contas pessoais, um repositório e duas chaves. A versão com prints de cada tela é a página de preparação: [abrir a página](https://claude.ai/artifact/VfDEQLnrrSJTU893erfRdz) (o mesmo conteúdo está em [`workshop/preparacao.html`](workshop/preparacao.html)). Tudo acontece no navegador, no **Claude Code na web** ([claude.ai/code](https://claude.ai/code)); não precisa instalar nada. Prefere rodar no seu computador? Veja o [`LOCAL.md`](LOCAL.md).

![Tempo](https://img.shields.io/badge/tempo-~20%20min-1f6feb?style=for-the-badge)
![Instalar](https://img.shields.io/badge/instalar-nada-2da44e?style=for-the-badge)
![Contas](https://img.shields.io/badge/contas-GitHub%20%C2%B7%20Claude%20%C2%B7%20Vercel-1f6feb?style=for-the-badge)
![Chaves](https://img.shields.io/badge/chaves-Vercel%20%C2%B7%20Anthropic-1f6feb?style=for-the-badge)

```mermaid
flowchart LR
    A["1 · GitHub + repositório"] --> B["2 · Claude Code na web"] --> C["3 · Vercel"] --> D["4 · Token da Vercel"] --> E["5 · Chave da Anthropic"] --> F["6 · Ambiente do Claude"] --> G["7 · Teste"] --> H(["✓ Pronto"])
    style H fill:#2da44e,color:#fff,stroke:#2da44e
```

## Por que contas pessoais

| | Caminho | Resultado |
| :---: | --- | --- |
| ✅ | GitHub **pessoal** → Vercel **Hobby** | App no ar, de graça |
| 💲 | GitHub da **empresa** (organização) → Vercel **Pro** | Plano pago, e ainda pede aprovação de um administrador |

O plano gratuito da Vercel só publica repositórios de contas pessoais do GitHub.

## Como funciona

```mermaid
flowchart LR
    Voce(["👤 Você, no navegador"]) -->|"pede em português"| Sessao["☁️ Claude Code na web"]
    Sessao -->|"ao abrir, sozinho"| Setup["dependências · Postgres<br/>migrações · app"]
    Sessao -->|"commit, push e pull request"| GitHub[("🐙 Seu repositório")]
    Sessao -->|"publica com o token da Vercel"| Vercel["▲ Vercel + Neon<br/>seu app no ar"]
```

- Cada sessão prepara o projeto sozinha ([`scripts/cloud-setup.sh`](scripts/cloud-setup.sh)): na primeira vez leva cerca de 1 minuto; depois, segundos.
- O Claude testa o app num navegador da própria nuvem, faz o commit e o push, abre o pull request e **publica na Vercel** por você.
- As chaves ficam no ambiente do Claude, nunca na conversa. O Claude leva a chave da Anthropic para a Vercel sozinho, sem mostrá-la.

---

## 1 · 🐙 GitHub: conta e repositório

1. Crie a sua conta **pessoal** em [github.com/signup](https://github.com/signup) (ou use a sua).
2. Clique na sua foto → **Repositories** → **New**.
3. **Owner:** a sua conta (nunca uma empresa) · **Repository name:** `demo` · **Private** · **Add README** ligado → **Create repository**.

## 2 · 🤖 Claude Code na web conectado ao GitHub

O workshop inteiro acontece no Claude Code na web. O seu plano precisa incluir esse acesso:

| Plano | Acesso ao Claude Code na web |
| --- | --- |
| **Pro**, **Max**, **Ultra** | ✅ |
| **Team**, **Enterprise** | Só se o administrador da empresa liberou |
| **Free** | ❌ |

1. Abra [claude.ai/code](https://claude.ai/code). O plano aparece ao lado do seu nome, no canto inferior esquerdo; se pedir upgrade, o plano não inclui.
2. **Connect GitHub** → no GitHub, **Authorize**.
3. De volta ao Claude, abra **Repo** (barra de baixo) → **Install the Claude GitHub App** → **All repositories** → **Install & Authorize**.
4. Em **Repo**, o seu `demo` aparece na lista.

## 3 · ▲ Vercel

Em [vercel.com/signup](https://vercel.com/signup), entre com o GitHub e escolha **I'm working on personal projects (Hobby)**, dê um nome e **Continue**. Grátis e sem cartão.

Ao chegar na tela **New Project**, **pare**: não importe nada. Quem cria o projeto é o Claude, no dia.

## 4 · 🔑 Token da Vercel

É com ele que o Claude publica o app por você.

1. Abra [vercel.com/account/settings/tokens](https://vercel.com/account/settings/tokens) (ou: sua conta, canto inferior esquerdo → ⚙️ → **Tokens**).
2. Nome `workshop` · escopo **Full Account** · validade **7 Days** → **Create**.
3. **Copie** o token (ele aparece uma vez só) e vá para o passo 6.

## 5 · 🔑 Chave da API da Anthropic

É o Claude respondendo no chat do app que você vai construir.

1. Em [platform.claude.com](https://platform.claude.com): **Spending (Billing)** → **Buy credits**.
2. **API keys** → **Create key** (nome `workshop`, validade até depois do workshop). Se aparecer a janela de "identity federation", clique em **Continue with an API key**.
3. **Copy key** (começa com `sk-ant-` e aparece uma vez só).

> [!TIP]
> No dia, a Bluey empresta uma chave, desativada depois do workshop. Com a sua, o app continua respondendo depois.

## 6 · 🔐 Ambiente do Claude

Em [claude.ai/code](https://claude.ai/code): **Default** (barra de baixo) → ⚙️ → tela **Edit cloud environment**.

**Token da Vercel → Network secrets** (o Claude usa sem nunca ver):

1. **Network secrets** → **Add secret**.
2. **Secret type:** `Bearer` · **Allowed websites:** `api.vercel.com` · **Header name:** `Authorization` · **Prefix:** `Bearer` · **Value:** o token → **Add**.
3. **Save changes**. Sem isso, nada fica salvo.

**Chave da Anthropic → Environment variables** (o Claude Code não aceita segredos para hosts da Anthropic):

1. **Environment variables**, na mesma tela.
2. Escreva a linha abaixo e cole a sua chave depois do `=`:

```
LLM_API_KEY=
```

3. **Save changes**.

Use exatamente o nome `LLM_API_KEY`. O nome `ANTHROPIC_API_KEY` é reservado pelo próprio Claude Code e não chega à sessão.

> [!CAUTION]
> **Nunca cole chaves, tokens ou senhas na conversa** com o Claude, nem em arquivos do projeto. Elas ficam só aqui; no dia, o Claude leva a chave da Anthropic para a Vercel sem mostrá-la.

## 7 · ✅ Teste

Em [claude.ai/code](https://claude.ai/code), numa sessão nova, a barra de baixo mostra **Default · sua-conta/demo · main**. Pronto.

---

Os prompts do workshop, na ordem, estão no [`WORKSHOP.md`](WORKSHOP.md): não precisa fazer nada com ele antes.

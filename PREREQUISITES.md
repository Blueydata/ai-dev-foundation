# Pré-requisitos — tudo na nuvem, sem instalar nada

O que você precisa para usar o **Dev Foundation** e fazer o workshop "Desenvolvimento de software com IA" inteiro no navegador, com o **Claude Code na web** ([claude.ai/code](https://claude.ai/code)). Não precisa de Git, Docker nem Node no computador: o Claude trabalha numa máquina na nuvem que já vem com Node, Postgres e um navegador para os testes. Prefere rodar no seu computador? Veja o [`LOCAL.md`](LOCAL.md).

![Tempo](https://img.shields.io/badge/tempo-~15%20min-1f6feb?style=for-the-badge)
![Instalar](https://img.shields.io/badge/instalar-nada-2da44e?style=for-the-badge)
![Contas](https://img.shields.io/badge/contas-GitHub%20%C2%B7%20Vercel%20%C2%B7%20Claude-1f6feb?style=for-the-badge)
![Programar](https://img.shields.io/badge/saber%20programar-n%C3%A3o%20precisa-2da44e?style=for-the-badge)

```mermaid
flowchart LR
    A["1 · GitHub pessoal"] --> B["2 · Sua cópia do projeto"] --> C["3 · Claude Code na web"] --> D["4 · Chave da OpenAI"] --> E["5 · Vercel pessoal"] --> F["6 · /setup-project"] --> G(["✓ Tudo pronto"])
    style G fill:#2da44e,color:#fff,stroke:#2da44e
```

## O que você vai usar

São **três contas pessoais** e **uma chave**:

| | Conta | Para quê | Plano |
| :---: | --- | --- | --- |
| 🐙 | **GitHub**, pessoal | Guardar o código e cada versão | Gratuito |
| ▲ | **Vercel**, pessoal, criada com o login do GitHub | Colocar o app no ar; o banco de dados (Neon) é criado dentro dela, sem outra conta | Hobby, gratuito, sem cartão |
| 🤖 | **Claude**, pessoal | A IA que constrói o software, numa máquina na nuvem | **Pro ou Max** (um plano Team ou Enterprise da empresa também serve, se o Claude Code na web estiver liberado) |
| 🔑 | **Chave da OpenAI** | A IA do chat do app que você vai construir | US$ 5 de crédito sobram |

> [!IMPORTANT]
> Use a **conta pessoal** do GitHub, não a da empresa: repositórios de organizações precisam de aprovação de um administrador para o Claude e de plano pago na Vercel.

## Como funciona

```mermaid
flowchart LR
    Voce(["👤 Você, no navegador"]) -->|"prompts"| Sessao["☁️ Sessão do Claude na nuvem"]
    Sessao -->|"ao abrir, sozinho"| Setup["dependências · Postgres<br/>migrações · app"]
    Sessao -->|"código, testes, navegador"| App["App rodando<br/>na máquina da nuvem"]
    Sessao -->|"push e pull request"| GitHub[("🐙 Seu repositório")]
    GitHub -->|"cada pull request e cada merge"| Vercel["▲ Vercel + Neon<br/>seu app com link público"]
```

- Ao abrir cada sessão, o projeto se prepara sozinho (o hook `.claude/hooks/session-start.sh` roda o [`scripts/cloud-setup.sh`](scripts/cloud-setup.sh)). Na primeira vez leva cerca de 1 minuto; depois, segundos.
- O Claude testa o app com um navegador da própria máquina na nuvem e mostra capturas de tela.
- O seu trabalho fica salvo no GitHub: cada sessão trabalha numa branch própria e termina num pull request. A Vercel publica cada pull request num link de prévia e, depois do merge, no link oficial.

> [!IMPORTANT]
> A máquina da sessão é temporária: o que não estiver no GitHub se perde quando a sessão termina. O Claude faz o commit e o push por você.

---

## 1 · 🐙 GitHub pessoal

Crie uma conta gratuita em [github.com/signup](https://github.com/signup), se ainda não tiver uma pessoal.

## 2 · 📦 A sua cópia do projeto

Abra [github.com/Blueydata/ai-dev-foundation](https://github.com/Blueydata/ai-dev-foundation) e clique em **Fork**. Deixe o dono como a sua conta pessoal e crie.

## 3 · 🤖 Claude Code na web

| Passo | O que fazer |
| :---: | --- |
| 1 | Entre em [claude.ai/code](https://claude.ai/code) com a sua conta do plano **Pro ou Max** |
| 2 | Conecte o GitHub quando ele pedir e autorize o acesso ao repositório que você criou |
| 3 | Escolha o repositório no seletor de repositórios. No seletor de ambiente, o **Default** serve |

## 4 · 🔑 Chave da OpenAI

| Passo | O que fazer |
| :---: | --- |
| 1 | Crie uma conta em [platform.openai.com](https://platform.openai.com), adicione um pouco de crédito (US$ 5 sobram) e gere uma chave em **API keys**. Guarde a chave num lugar seguro: você vai usá-la de novo na Vercel |
| 2 | No Claude Code na web, abra o menu do ambiente da sessão e clique em **Edit**. Em **Network secrets** (ou **API credentials**), salve a chave para o host `api.openai.com`, no cabeçalho `Authorization`, com o prefixo `Bearer`. Isso também libera o acesso da sessão ao `api.openai.com` |
| 3 | Nas **variáveis de ambiente** do mesmo ambiente, acrescente `OPENAI_API_KEY=via-network-secret`. O app precisa de um valor ali, e a chave de verdade é colocada no caminho pela rede da nuvem, sem nunca entrar na máquina |

Depois de mudar o ambiente, **comece uma sessão nova**: as mudanças só valem para sessões abertas depois delas.

> [!CAUTION]
> **Nunca cole a chave na conversa** com o Claude, nem em arquivos do projeto. Se o Claude precisar dela, ele mesmo abre um cartão seguro para você salvar.

Sem a chave, todo o resto funciona; só o chat avisa que a IA está indisponível.

## 5 · ▲ Vercel pessoal

Entre em [vercel.com/signup](https://vercel.com/signup) com **Continue with GitHub**, usando a mesma conta pessoal do GitHub, no plano **Hobby** (gratuito, sem cartão). Por enquanto é só isso: o projeto é conectado durante o workshop.

## 6 · ✅ Teste final

Numa sessão nova do Claude Code na web, no seu repositório, digite:

```
/setup-project
```

**Está pronto quando aparecer assim:**

```
✓ Ambiente na nuvem (nada instalado no computador)
✓ Aplicação e banco no ar
✓ Testes e tipos
✓ Sem segredos no código
✓ Chave da OpenAI configurada
✗ "Product" ainda não preenchido no CLAUDE.md → é o próximo passo
```

> [!TIP]
> O "Product" é o contexto do negócio, preenchido no workshop. Os prompts, na ordem, estão no [`WORKSHOP.md`](WORKSHOP.md): não precisa fazer nada com ele antes.

> [!TIP]
> **Travou?** Peça ajuda ao próprio Claude colando a mensagem de erro que apareceu.

# Pré-requisitos

Tudo o que você precisa no computador para usar o **Dev Foundation**, no treinamento "Desenvolvimento de software com IA" ou em qualquer projeto.

![Tempo](https://img.shields.io/badge/tempo-~30%20min-1f6feb?style=for-the-badge)
![Espaço](https://img.shields.io/badge/espa%C3%A7o-10%20GB%20livres-1f6feb?style=for-the-badge)
![Sistema](https://img.shields.io/badge/sistema-Windows%20%7C%20macOS%20%7C%20Linux-1f6feb?style=for-the-badge)
![Programar](https://img.shields.io/badge/saber%20programar-n%C3%A3o%20precisa-2da44e?style=for-the-badge)

```mermaid
flowchart LR
    A["1 · Claude"] --> B["2 · Git"] --> C["3 · Docker"] --> D["4 · Baixar o projeto"] --> E["5 · /setup-project"] --> F(["✓ Tudo pronto"])
    style F fill:#2da44e,color:#fff,stroke:#2da44e
```

## O que instalar

| | Ferramenta | Para quê | 🪟 Windows | 🍎 macOS | 🐧 Linux |
| :---: | --- | --- | --- | --- | --- |
| 🤖 | **Claude** | Conversar com a IA que constrói o software | [App Claude](https://claude.ai/download) | [App Claude](https://claude.ai/download) | [App Claude (beta)](https://code.claude.com/docs/en/desktop-linux) ou [Claude Code no terminal](https://code.claude.com/docs/en/quickstart) |
| 🌿 | **Git** | Baixar o projeto e guardar cada versão | [Git for Windows](https://git-scm.com/download/win) | Já vem no sistema | Gerenciador de pacotes |
| 🐳 | **Docker** | Rodar a aplicação e o banco de dados | [Docker Desktop](https://www.docker.com/products/docker-desktop) | [Docker Desktop](https://www.docker.com/products/docker-desktop) | [Docker Engine](https://docs.docker.com/engine/install/) ou [Docker Desktop](https://docs.docker.com/desktop/setup/install/linux/) |

> [!NOTE]
> Só isso. Node, banco de dados e o resto rodam **dentro do Docker**: não instale mais nada.

---

## 1 · 🤖 Claude

| 🪟 Windows | 🍎 macOS | 🐧 Linux |
| --- | --- | --- |
| Baixe e instale o app em [claude.ai/download](https://claude.ai/download) | Baixe e instale o app em [claude.ai/download](https://claude.ai/download) | **Ubuntu 22.04+ ou Debian 12+:** instale o [app Claude para Linux (beta)](https://code.claude.com/docs/en/desktop-linux) via `apt`. **Outras distribuições:** use o [Claude Code no terminal](https://code.claude.com/docs/en/quickstart) |

Depois, faça login com a sua conta e abra a aba **Code**: é ali que você vai trabalhar (no terminal, rode `claude` dentro da pasta do projeto).

> [!IMPORTANT]
> A conta precisa ser do plano **Pro ou superior**, que é o que dá acesso ao Claude Code.

## 2 · 🌿 Git

| 🪟 Windows | 🍎 macOS | 🐧 Linux |
| --- | --- | --- |
| Instale o [Git for Windows](https://git-scm.com/download/win) com as opções padrão | No Terminal, rode `git --version`. Se não estiver instalado, o macOS oferece a instalação: aceite | Ubuntu/Debian: `sudo apt install git` · Fedora: `sudo dnf install git` |

## 3 · 🐳 Docker

| 🪟 Windows | 🍎 macOS | 🐧 Linux |
| --- | --- | --- |
| Instale o [Docker Desktop](https://www.docker.com/products/docker-desktop), abra e espere ele indicar que está **rodando** | Instale o [Docker Desktop](https://www.docker.com/products/docker-desktop), abra e espere ele indicar que está **rodando** | Instale o [Docker Engine com o plugin Compose](https://docs.docker.com/engine/install/) e rode `sudo usermod -aG docker $USER`; saia e entre de novo na sessão. Ou use o [Docker Desktop para Linux](https://docs.docker.com/desktop/setup/install/linux/) |

> [!WARNING]
> **Windows:** o instalador pode pedir para ativar o **WSL 2**. Aceite e reinicie o computador.
>
> **Linux:** confira com `docker compose version`. Sem o `usermod`, o Docker só funciona com `sudo`.

## 4 · 📦 Baixar o projeto

No PowerShell (Windows) ou no Terminal (macOS e Linux):

```bash
git clone https://github.com/Blueydata/ai-dev-foundation.git
```

## 5 · ✅ Teste final

Com o Docker rodando, abra a pasta `ai-dev-foundation` no Claude (app: aba **Code**; terminal: `cd ai-dev-foundation` e `claude`) e digite:

```
/setup-project
```

Ele confere tudo, sobe o projeto e diz o que fazer se faltar algo. Na primeira vez leva alguns minutos, baixando o que o projeto usa. **Está pronto quando aparecer assim:**

```
✓ Git
✓ Docker instalado e rodando
✓ Aplicação e banco no ar (http://localhost:3000)
✓ Ferramentas de infraestrutura
✓ Testes e tipos
✓ Sem segredos no código
– Chave da OpenAI não configurada (opcional: só o chat precisa dela)
✗ "Product" ainda não preenchido no CLAUDE.md → é o próximo passo
```

> [!TIP]
> O "Product" é o contexto do negócio, preenchido depois (no treinamento, a gente preenche junto). Abra http://localhost:3000: deve aparecer **"Banco de dados: conectado"**.

| Quero… | 🪟 Windows | 🍎 macOS | 🐧 Linux |
| --- | --- | --- | --- |
| Ver a aplicação dentro do app Claude | Painel **Browser**: `Ctrl+Shift+B` | Painel **Browser**: `Cmd+Shift+B` | Painel **Browser**: `Ctrl+Shift+B` (no terminal, use o seu navegador) |
| Desligar | Feche o Docker Desktop | Feche o Docker Desktop | `docker compose stop` na pasta do projeto |
| Voltar a trabalhar | Abra o Docker Desktop e rode `/setup-project` | Abra o Docker Desktop e rode `/setup-project` | Rode `/setup-project` |

Os prompts do treinamento, na ordem, estão no [`WORKSHOP.md`](WORKSHOP.md). Não precisa fazer nada com ele antes.

---

<details>
<summary><strong>🔑 Opcional: chave da OpenAI, para o chat com IA responder</strong></summary>

<br>

| Passo | O que fazer |
| :---: | --- |
| 1 | Crie uma conta em [platform.openai.com](https://platform.openai.com) e adicione um pouco de crédito (US$ 5 sobram) |
| 2 | Gere uma chave em **API keys** |
| 3 | Na pasta do projeto, crie um arquivo `.env` com a linha abaixo |

```
OPENAI_API_KEY=a-sua-chave
```

Sem a chave, todo o resto funciona; só o chat avisa que a IA está indisponível.

> [!CAUTION]
> O `.env` nunca vai para o Git. **Não mande a sua chave para ninguém**, nem cole em conversas.

</details>

> [!TIP]
> **Travou?** Peça ajuda ao próprio Claude colando a mensagem de erro que apareceu.

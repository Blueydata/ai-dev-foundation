# Pré-requisitos

Tudo o que você precisa no computador para usar o **Dev Foundation**, no treinamento "Desenvolvimento de software com IA" ou em qualquer projeto.

![Tempo](https://img.shields.io/badge/tempo-~30%20min-1f6feb?style=for-the-badge)
![Espaço](https://img.shields.io/badge/espa%C3%A7o-10%20GB%20livres-1f6feb?style=for-the-badge)
![Sistema](https://img.shields.io/badge/sistema-macOS%20%7C%20Windows-1f6feb?style=for-the-badge)
![Programar](https://img.shields.io/badge/saber%20programar-n%C3%A3o%20precisa-2da44e?style=for-the-badge)

```mermaid
flowchart LR
    A["1 · Claude"] --> B["2 · Git"] --> C["3 · Docker Desktop"] --> D["4 · Baixar o projeto"] --> E["5 · /setup-project"] --> F(["✓ Tudo pronto"])
    style F fill:#2da44e,color:#fff,stroke:#2da44e
```

## O que instalar

| | Ferramenta | Para quê | Onde baixar |
| :---: | --- | --- | --- |
| 🤖 | **Claude** (app) | Conversar com a IA que constrói o software | [claude.ai/download](https://claude.ai/download) |
| 🌿 | **Git** | Baixar o projeto e guardar cada versão | [git-scm.com](https://git-scm.com/download/win) (Windows) · já vem no macOS |
| 🐳 | **Docker Desktop** | Rodar a aplicação e o banco de dados | [docker.com](https://www.docker.com/products/docker-desktop) |

> [!NOTE]
> Só isso. Node, banco de dados e o resto rodam **dentro do Docker**: não instale mais nada.

---

## 1 · 🤖 Claude

| Passo | O que fazer |
| :---: | --- |
| 1 | Baixe e instale o app em [claude.ai/download](https://claude.ai/download) |
| 2 | Faça login com a sua conta |
| 3 | Abra a aba **Code**: é ali que você vai trabalhar |

> [!IMPORTANT]
> A conta precisa ser do plano **Pro ou superior**, que é o que dá acesso ao Claude Code.

## 2 · 🌿 Git

| 🍎 macOS | 🪟 Windows |
| --- | --- |
| No Terminal, rode `git --version`. Se não estiver instalado, o macOS oferece a instalação: aceite. | Instale o [Git for Windows](https://git-scm.com/download/win) com as opções padrão. |

## 3 · 🐳 Docker Desktop

| Passo | O que fazer |
| :---: | --- |
| 1 | Baixe e instale em [docker.com](https://www.docker.com/products/docker-desktop) |
| 2 | Abra o Docker Desktop e espere ele indicar que está **rodando** |

> [!WARNING]
> **Windows:** o instalador pode pedir para ativar o **WSL 2**. Aceite e reinicie o computador.

## 4 · 📦 Baixar o projeto

No Terminal (ou no PowerShell, no Windows):

```bash
git clone https://github.com/Blueydata/ai-dev-foundation.git
```

## 5 · ✅ Teste final

Com o Docker Desktop aberto, no app Claude, aba **Code**, abra a pasta `ai-dev-foundation` e digite:

```
/setup-project
```

Ele confere tudo, sobe o projeto e diz o que fazer se faltar algo. Na primeira vez leva alguns minutos, baixando o que o projeto usa. **Está pronto quando aparecer assim:**

```
✓ Git
✓ Docker instalado e rodando
✓ Aplicação e banco no ar (http://localhost:3000)
✓ Testes e tipos
✓ Sem segredos no código
– Chave da OpenAI não configurada (opcional: só o chat precisa dela)
✗ "Product" ainda não preenchido no CLAUDE.md → é o próximo passo
```

> [!TIP]
> O "Product" é o contexto do negócio, preenchido depois (no treinamento, a gente preenche junto). Abra http://localhost:3000: deve aparecer **"Banco de dados: conectado"**.

| Quero… | Faço |
| --- | --- |
| Desligar | Feche o Docker Desktop |
| Voltar a trabalhar | Abra o Docker Desktop e rode `/setup-project` |
| Ver os prompts do treinamento | [`WORKSHOP.md`](WORKSHOP.md) (não precisa fazer nada com ele antes) |

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
> **Travou?** Peça ajuda ao próprio Claude, no app, colando a mensagem de erro que apareceu.

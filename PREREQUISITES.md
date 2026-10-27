# Pré-requisitos — Chegue com tudo pronto

Para usar o **Dev Foundation**, no treinamento "Desenvolvimento de software com IA" ou em qualquer projeto, você precisa de três coisas no computador: **Claude**, **Git** e **Docker Desktop**. São uns 30 minutos no total, a maior parte esperando download.

Você **não** precisa saber programar nem instalar Node, banco de dados ou qualquer outra ferramenta: a aplicação roda inteira dentro do Docker.

## O que você precisa

- [ ] Computador com macOS ou Windows e pelo menos 10 GB livres
- [ ] O app **Claude**, com login numa conta de plano Pro ou superior
- [ ] **Git**
- [ ] **Docker Desktop**, aberto e funcionando

## 1. Claude

1. Baixe o app Claude para o seu sistema em https://claude.ai/download e instale.
2. Abra o app e faça login com a sua conta. O plano precisa ser **Pro ou superior**, porque é ele que dá acesso ao Claude Code.
3. No app, abra a aba **Code**. É ali que você vai trabalhar.

## 2. Git

- **macOS:** abra o Terminal e rode `git --version`. Se ainda não estiver instalado, o próprio macOS oferece a instalação: aceite e espere terminar.
- **Windows:** baixe e instale o Git for Windows em https://git-scm.com/download/win, mantendo as opções padrão.

## 3. Docker Desktop

1. Baixe em https://www.docker.com/products/docker-desktop e instale.
2. Abra o Docker Desktop e espere ele indicar que está rodando.
3. No **Windows**, o instalador pode pedir para ativar o WSL 2: aceite e reinicie o computador.

## 4. Teste final: o projeto rodando

Este passo já baixa tudo o que o projeto usa, para não depender da internet no dia.

1. No Terminal (ou no PowerShell, no Windows), baixe o Dev Foundation:

```bash
git clone https://github.com/Blueydata/ai-dev-foundation.git
```

2. Abra o Docker Desktop.
3. No app Claude, aba **Code**, abra a pasta `ai-dev-foundation` que acabou de ser criada e digite:

```
/setup-project
```

Ele confere o Git e o Docker, sobe o projeto e diz exatamente o que fazer se faltar alguma coisa, até estar tudo pronto. Na primeira vez ele baixa e instala tudo, o que leva alguns minutos. Não precisa configurar nada.

4. Está pronto quando aparecer tudo ✓, menos "Product", que é o contexto do negócio, preenchido depois (no treinamento, a gente preenche junto). Para conferir, abra http://localhost:3000: deve aparecer **"Banco de dados: conectado"**.
5. Para desligar, feche o Docker Desktop. Para voltar a trabalhar, é só abrir o Docker Desktop e rodar `/setup-project` de novo.

Os prompts do treinamento, na ordem, estão no [`WORKSHOP.md`](WORKSHOP.md). Não precisa fazer nada com ele antes.

## Opcional: chave da OpenAI

O produto construído no treinamento tem um chat com IA. Para ele responder no seu computador, você precisa de uma chave da OpenAI:

1. Crie uma conta em https://platform.openai.com, adicione um pouco de crédito (US$ 5 sobram) e gere uma chave em **API keys**.
2. Na pasta do projeto, crie um arquivo chamado `.env` com uma única linha (o `/setup-project` explica como, se precisar):

```
OPENAI_API_KEY=a-sua-chave
```

Esse arquivo nunca vai para o Git. **Não mande a sua chave para ninguém**, nem cole em conversas.

Sem a chave, todo o resto funciona normalmente; só o chat avisa que a IA está indisponível.

## Travou?

Se algum passo não funcionar, peça ajuda ao próprio Claude, no app, descrevendo o erro e colando a mensagem que apareceu.

# Catálogo da Torra Sul — especificação do CSV

O arquivo [`torra-sul-catalog.csv`](torra-sul-catalog.csv) é o catálogo da Torra Sul, a torrefação fictícia do workshop. Esta página é o contrato da importação: tudo o que o importador precisa saber sobre o arquivo está aqui.

![Produtos](https://img.shields.io/badge/produtos-150-6f4e37?style=for-the-badge)
![Pastas](https://img.shields.io/badge/pastas-6-6f4e37?style=for-the-badge)
![Ocultos](https://img.shields.io/badge/ocultos-9-6f4e37?style=for-the-badge)
![Inválidas](https://img.shields.io/badge/linhas%20inv%C3%A1lidas-2-b42318?style=for-the-badge)

## Formato do arquivo

| Regra | Valor |
| --- | --- |
| Codificação | UTF-8, sem BOM |
| Separador de colunas | vírgula (`,`) |
| Aspas | Padrão CSV (RFC 4180): campos com vírgula, aspas ou quebra de linha ficam entre aspas duplas |
| Quebra de linha | LF |
| Cabeçalho | Uma linha, com os nomes das colunas abaixo, nesta ordem |
| Decimais | Ponto (`64.00`), sem separador de milhar e sem símbolo de moeda |
| Listas dentro de um campo | Separadas por `\|`, sem espaços em volta (`caramelo\|laranja`) |
| Verdadeiro ou falso | `true` ou `false` |
| Campo vazio | Sem valor |

## Colunas

| Coluna | Tipo | Obrigatória | Valores permitidos | Exemplo |
| --- | --- | --- | --- | --- |
| `sku` | texto | sim, único | `TS-` + código da pasta + `-` + 3 dígitos: `GR` Cafés em grão, `ML` Microlotes, `MU` Cafés do mundo, `MP` Métodos de preparo, `MO` Moedores, `AC` Acessórios | `TS-GR-001` |
| `name` | texto | sim | Nome do produto | `Catuaí Amarelo` |
| `folder` | texto | sim | `Cafés em grão`, `Microlotes`, `Cafés do mundo`, `Métodos de preparo`, `Moedores`, `Acessórios` | `Cafés em grão` |
| `price_brl` | decimal | sim | Maior que zero, duas casas decimais | `64.00` |
| `weight_g` | inteiro | cafés | `250`, `500` ou `1000`; vazio para equipamentos | `250` |
| `description` | texto | sim | Até 280 caracteres | `Café redondo e doce…` |
| `origin_country` | texto | cafés | País, em português | `Brasil` |
| `origin_region` | texto | cafés | Região produtora | `Sul de Minas` |
| `producer` | texto | cafés | Fazenda, sítio ou cooperativa (fictícios) | `Sítio Boa Esperança` |
| `variety` | texto | cafés | Variedade | `Catuaí Amarelo` |
| `process` | texto | cafés | `natural`, `cereja descascado`, `lavado`, `semi-lavado`, `honey`, `fermentação anaeróbica`, `maceração carbônica`, `fermentação com levedura` | `natural` |
| `altitude_min_m` | inteiro | cafés | Metros; menor ou igual ao máximo | `950` |
| `altitude_max_m` | inteiro | cafés | Metros | `1150` |
| `roast` | texto | cafés | `clara`, `média-clara`, `média`, `média-escura`, `escura` | `média` |
| `tasting_notes` | lista | cafés | De 2 a 4 notas, em minúsculas | `caramelo\|laranja\|chocolate ao leite` |
| `acidity` | texto | cafés | `baixa`, `média`, `alta` | `baixa` |
| `body` | texto | cafés | `leve`, `médio`, `encorpado` | `médio` |
| `sca_score` | decimal | cafés | Uma casa decimal, de `80.0` a `94.0` | `84.0` |
| `brew_methods` | lista | cafés; equipamentos quando se aplica | `espresso`, `coado`, `v60`, `chemex`, `kalita`, `aeropress`, `prensa francesa`, `moka`, `cold brew`, `clever` | `coado\|espresso` |
| `harvest` | texto | cafés | Safra: `2025/26` (Brasil) ou `2025` | `2025/26` |
| `lot_size_kg` | inteiro | só Microlotes | Tamanho do lote em kg | `60` |
| `visible` | booleano | sim | `true` aparece no chat; `false` **nunca** aparece no chat | `true` |

"Cafés" são as pastas Cafés em grão, Microlotes e Cafés do mundo. Nas outras pastas, as colunas só de café ficam vazias.

## Regras da importação

1. **Valida linha por linha** com as regras acima. Linhas válidas entram; linhas inválidas **não entram** e são relatadas com o número da linha no arquivo (o cabeçalho é a linha 1), a coluna e o motivo.
2. **Idempotente:** o `sku` é a chave. Rodar de novo atualiza os produtos existentes e não duplica nada.
3. **Pastas:** cria as pastas que ainda não existem, pelo nome.
4. **Em lote**, numa transação, sem uma ida ao banco por linha.
5. **Relatório:** linhas lidas, criadas, atualizadas e rejeitadas, com os motivos.
6. **Comando:** `docker compose exec -T app npm run catalog:import -- workshop/torra-sul-catalog.csv`, separado das migrações.

## Resultado esperado

| Rodada | Lidas | Criadas | Atualizadas ou sem mudança | Rejeitadas |
| --- | --- | --- | --- | --- |
| 1ª | 152 | 150 | 0 | 2 |
| 2ª | 152 | 0 | 150 | 2 |

| Linha | `sku` | Motivo da rejeição |
| --- | --- | --- |
| 152 | `TS-GR-061` | `price_brl` com `R$ 89,90`: símbolo de moeda e vírgula decimal |
| 153 | `TS-AC-016` | `folder` com `Chás`: pasta que não existe |

| Pasta | Produtos |
| --- | --- |
| Cafés em grão | 60 |
| Microlotes | 25 |
| Cafés do mundo | 25 |
| Métodos de preparo | 15 |
| Moedores | 10 |
| Acessórios | 15 |

Nove produtos estão ocultos (`visible=false`), entre eles o microlote **Gesha Fermentação Anaeróbica** (nota 92.5, a maior do catálogo) e o **Iêmen Haraz**. O chat nunca pode citá-los.

## Perguntas para testar o chat

Respostas conferidas nos dados, considerando só os produtos visíveis:

| Pergunta do cliente | Resposta certa |
| --- | --- |
| "Tem algum café frutado pra fazer na V60 até 80 reais?" | 11 opções; as mais baratas são Catucaí Caparaó Natural (R$ 55), Mundo Novo Cerrado Semi-lavado (R$ 60) e Arara Caparaó Lavado (R$ 63); o Bourbon Vermelho (R$ 72) também entra |
| "Qual o microlote com a nota mais alta de vocês?" | Gesha Natural, da Mantiqueira de Minas, nota 91.0, R$ 215 (nunca o Gesha Fermentação Anaeróbica, que está oculto) |
| "Quantos cafés do Cerrado Mineiro vocês têm? E qual o mais barato?" | 8; o mais barato é o Mundo Novo Cerrado Cereja, R$ 60 |
| "Tem café natural da Mantiqueira?" | Arara Mantiqueira Natural 1 kg (R$ 223,90), Arara Mantiqueira Natural Sítio Água Limpa 1 kg (R$ 200,90), Gesha Natural (R$ 215) e Pacamara Natural (R$ 188) |
| "Quero algo encorpado para espresso, o mais barato" | Catuaí Vermelho Matas de Minas Cereja, R$ 61 |
| "Que cafés da Etiópia vocês têm?" | Yirgacheffe Lavado (R$ 112), Sidamo Natural (R$ 106) e Guji Natural (R$ 118) |
| "Um moedor até 400 reais?" | 5 opções, de R$ 189 (Moedor manual compacto) a R$ 389 (Moedor elétrico portátil recarregável) |
| "Vocês têm o Iêmen Haraz?" | Não está disponível (está oculto) |
| "Vocês têm café descafeinado?" | Não há no catálogo; o chat diz isso e sugere uma alternativa, sem inventar |

## Por que o chat não recebe este arquivo inteiro

Colado no prompt, o catálogo ocupa cerca de **11 mil tokens** como CSV, ou **20 mil** como JSON, em **cada** pergunta. Com as ferramentas de busca, o banco filtra e devolve no máximo 10 produtos: algumas centenas de tokens, com 150 ou com 150 mil produtos. Veja a skill `ai-integration`, seção "Answering questions over data".

Os nomes de produtores e de equipamentos são fictícios.

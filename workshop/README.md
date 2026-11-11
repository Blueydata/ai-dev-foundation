# Imóveis da Ilha Clara — especificação da planilha

O arquivo [`ilha-clara-imoveis.csv`](ilha-clara-imoveis.csv) tem os imóveis para alugar da **Ilha Clara Imóveis**, a imobiliária fictícia do workshop, em Florianópolis. Esta página é o contrato da carga: tudo o que o app precisa saber sobre o arquivo está aqui. Todos os dados são inventados.

![Imóveis](https://img.shields.io/badge/im%C3%B3veis-150-0e7490?style=for-the-badge)
![Disponíveis](https://img.shields.io/badge/dispon%C3%ADveis-134-0e7490?style=for-the-badge)
![Alugados](https://img.shields.io/badge/alugados%20(ocultos)-16-b42318?style=for-the-badge)
![Bairros](https://img.shields.io/badge/bairros-12-0e7490?style=for-the-badge)

## Formato do arquivo

| Regra | Valor |
| --- | --- |
| Codificação | UTF-8, sem BOM |
| Separador de colunas | vírgula (`,`), com aspas duplas nos campos que têm vírgula (padrão CSV) |
| Cabeçalho | Uma linha, com os nomes das colunas abaixo, nesta ordem |
| Decimais | Ponto (`2300.00`), sem separador de milhar e sem símbolo de moeda |
| Listas dentro de um campo | Separadas por `\|` (`piscina\|varanda`) |
| Verdadeiro ou falso | `true` ou `false` |

## Colunas

| Coluna | Tipo | Valores | Exemplo |
| --- | --- | --- | --- |
| `code` | texto, único | `IC-` + 4 dígitos | `IC-0092` |
| `title` | texto | Título do anúncio | `Apartamento de 2 quartos mobiliado no Estreito` |
| `type` | texto | `apartamento`, `casa`, `studio`, `kitnet`, `cobertura` | `apartamento` |
| `neighborhood` | texto | Agronômica, Campeche, Centro, Coqueiros, Córrego Grande, Estreito, Ingleses, Itacorubi, Jurerê, Lagoa da Conceição, Santa Mônica, Trindade | `Estreito` |
| `bedrooms` | inteiro | `0` (studio e kitnet) a `4` | `2` |
| `bathrooms` | inteiro | `1` a `3` | `2` |
| `parking_spaces` | inteiro | `0` a `3` | `1` |
| `area_m2` | inteiro | Área útil em m² | `58` |
| `rent_brl` | decimal | Aluguel mensal | `2300.00` |
| `condo_fee_brl` | decimal | Condomínio mensal; `0.00` em casas | `640.00` |
| `iptu_brl` | decimal | IPTU mensal | `65.00` |
| `furnished` | booleano | Mobiliado | `true` |
| `pets_allowed` | booleano | Aceita animais | `true` |
| `features` | lista | `academia`, `ar-condicionado`, `bicicletário`, `churrasqueira`, `coworking`, `elevador`, `lavanderia`, `piscina`, `portaria 24h`, `quintal`, `varanda`, `vista para o mar` | `coworking\|varanda` |
| `description` | texto | Descrição do anúncio | `58 m², no continente…` |
| `status` | texto | `disponível` ou `alugado`. **Imóvel alugado nunca aparece na vitrine nem no chat** | `disponível` |

## Regras da carga

1. A planilha entra inteira no banco; o `code` é a chave: carregar de novo atualiza e **não duplica**.
2. A carga roda sozinha ao preparar o banco, na sessão da nuvem e no deploy da Vercel, sem nenhum passo manual.
3. Em lote, numa transação, sem uma ida ao banco por linha.

## Respostas certas (para conferir o chat)

Conferidas direto na planilha. O "custo mensal" é aluguel + condomínio.

| Pergunta do cliente | O que o chat deve responder |
| --- | --- |
| "Quero um apê de 2 quartos até R$ 3.000 que aceite cachorro" | Só o **IC-0092**, apartamento mobiliado no Estreito, R$ 2.300 + R$ 640 de condomínio. **Nunca** o IC-0012, na Trindade por R$ 1.900, que está alugado |
| "Quantos imóveis vocês têm no Campeche? Qual o mais barato?" | **10** disponíveis; o mais barato é o **IC-0084**, apartamento de 1 quarto mobiliado, R$ 2.000 + R$ 400 |
| "Tem cobertura com vista pro mar?" | Duas: **IC-0109** nos Ingleses (2 quartos, R$ 7.300 + R$ 1.820) e **IC-0140** em Coqueiros (2 quartos, R$ 8.000 + R$ 1.760) |
| "Vocês têm casa para alugar na Lagoa da Conceição?" | **Não** há casa disponível na Lagoa (as duas estão alugadas). Deve dizer isso e sugerir algo parecido, como os apartamentos da Lagoa ou casas com quintal em outros bairros, sem inventar |
| "Quantos imóveis aceitam pets?" | **74** dos 134 disponíveis |

## Números gerais

| | Disponíveis |
| --- | --- |
| Por tipo (todos os 150) | 67 apartamentos, 26 casas, 22 kitnets, 21 studios, 14 coberturas |
| Mobiliados | 43 |
| Aceitam pets | 74 |
| Bairro com mais opções | Ingleses (17) |
| Bairro com menos opções | Trindade (4) |

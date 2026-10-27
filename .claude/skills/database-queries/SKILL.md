---
name: database-queries
description: How to write and validate database access that stays fast with large data - schema and indexes, filters, search in Portuguese, pagination, aggregations, bulk imports, no N+1, and how to prove each query with integration tests, query counts and EXPLAIN on real data. Use whenever creating or changing a migration, a repository, a list, a search, a report, an import or an AI tool that reads data, and whenever the product owner asks, in any words, whether something will stay fast or cheap as the data grows.
---

# Database queries

The product owner talks about the business ("it has to stay fast when the catalog grows", "loading the spreadsheet twice cannot duplicate anything"). This skill turns that into the technical rules below; never expect the product owner to name them, and explain results back in business terms.

Every query is written for the data the product will have, not the data on the developer's screen. A list with 20 rows today has 200 000 next year. Repositories are the only place with SQL (`project-structure`), and every query in them follows this skill and is **validated** before the stage is done.

## Rules

1. **Parameters always.** Values go in `$1, $2…`. Never build SQL by concatenating input. The only dynamic parts allowed are fixed fragments chosen in code from an allowlist (for example the sort column from a `zod` enum).
2. **Filter, sort, count and aggregate in SQL.** Never load a table to filter, sort or count in TypeScript.
3. **Select only the columns the use case needs.** No `SELECT *` in repositories.
4. **Every list is paginated** with a maximum page size defined in `application/schemas.ts` (for example 50). Prefer keyset pagination (`WHERE (name, id) > ($1, $2) ORDER BY name, id LIMIT $3`) for large or infinite lists; offset pagination is fine for admin screens with page numbers. The page and filters live in the URL (`url-state`).
5. **No N+1.** Never run a query inside a loop. Load related data with a `JOIN`, a `LEFT JOIN LATERAL` or a second query with `WHERE id = ANY($1)`, then group in memory. A use case that lists N items runs a constant number of queries, whatever N is.
6. **An index for every filter, sort and join** the screens and tools use, created in the same migration as the query that needs it. Foreign keys get an index. Unique business keys (codes, SKUs, e-mails) get a `UNIQUE` constraint.
7. **Right types.** Money is `numeric(12,2)` (the `pg` driver returns it as a string: convert in the repository), dates are `timestamptz`, closed vocabularies are `text` with a `CHECK` or a lookup table, multi-value attributes are `text[]` with a GIN index.
8. **Timeouts and limits.** Long reports and AI tools set a `statement_timeout`; nothing returns an unbounded number of rows.
9. **One pool.** Use `getPool()` from `src/shared/database/client.ts`. Transactions use `pool.connect()` and always release the client in `finally`.

## Search in Portuguese

For free text typed by users ("café frutado", "acidez baixa", "chocolate"), use Postgres full-text search with accents ignored, plus trigrams for typos in names. Both extensions ship with the Postgres image.

```sql
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TEXT SEARCH CONFIGURATION portuguese_unaccent (COPY = portuguese);
ALTER TEXT SEARCH CONFIGURATION portuguese_unaccent
  ALTER MAPPING FOR hword, hword_part, word WITH unaccent, portuguese_stem;

ALTER TABLE products ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('portuguese_unaccent', coalesce(name, '')), 'A') ||
  setweight(to_tsvector('portuguese_unaccent', coalesce(description, '')), 'B')
) STORED;

CREATE INDEX products_search_vector_idx ON products USING gin (search_vector);
CREATE INDEX products_name_trgm_idx ON products USING gin (name gin_trgm_ops);
```

```sql
SELECT id, name, price_brl, ts_rank(search_vector, query) AS rank
FROM products, websearch_to_tsquery('portuguese_unaccent', $1) AS query
WHERE search_vector @@ query AND visible
ORDER BY rank DESC, name
LIMIT $2
```

Structured attributes (price range, roast, origin, methods, notes) are columns or arrays filtered with normal operators (`BETWEEN`, `=`, `= ANY`, `&&`, `@>`), not text search. Use semantic search (embeddings, `pgvector`) only when the product owner approves it as a decision to record: it needs another image, another provider call per item and a re-index on every change.

## Bulk imports

Imports (CSV, spreadsheets, external APIs) are a use case, not a script with SQL:

1. **Parse and validate every row** with a `zod` schema in `application/schemas.ts`, keeping the line number. Invalid rows are **reported** (line, column, reason) and **skipped**; valid rows are imported.
2. **Idempotent:** upsert by the business key (`INSERT … ON CONFLICT (sku) DO UPDATE`), so running the import twice changes nothing.
3. **Batched and transactional:** insert in batches (multi-row `VALUES` or `unnest($1::text[], $2::numeric[]…)`) inside one transaction, never one round trip per row.
4. **Related records first:** create or find the referenced records (folders, categories) in one query, then link by id.
5. **Report:** rows read, created, updated, rejected, with the reasons. The command prints it; a screen shows it.
6. Imports run as a command (`npm run <module>:import -- <file>` calling the use case through a script) or a server action; the file path or upload never reaches SQL.

## AI tools that read data

When an LLM answers questions about the data (a chat, an agent), follow "Answering questions over data" in `ai-integration`: the model calls tools with typed filters, the tools call use cases, the use cases call these repositories. Every rule above applies to those queries too: limits, indexes, no N+1, validation.

## Validating queries

A stage that adds or changes a query is only done when the query is proven correct **and** efficient:

| Check | How | Proves |
| --- | --- | --- |
| Correct results | Integration test next to the repository (`*.integration.test.ts`), with enough rows to exercise filters, sort, pagination and the empty case | The SQL returns exactly what the use case expects |
| No N+1 | `countQueries` from `src/shared/database/query-counter.ts` in the integration test: list 3 and 30 items and assert the **same** number of queries | The number of queries does not grow with the data |
| Uses indexes | `docker compose exec -T app npm run db:explain -- "<query with literal values>"` on the development database with realistic data | The plan, the execution time and any large sequential scan |
| Index can serve it | Same command with `--force-index` | On small tables Postgres prefers a sequential scan; forcing shows whether an index exists for the query |
| Real data | `docker compose exec -T app npm run db:query -- "<SELECT …>"` | What is actually stored (counts, distributions, samples) |

`db:query` and `db:explain` only run **one read statement** inside a read-only transaction with a 5-second timeout, then roll back: they can never change data. Use them freely to look at the data and the plans; change data only through migrations and use cases.

### Reading a plan

- `Index Scan`, `Index Only Scan` or `Bitmap Index Scan` on the filtered table: good.
- `Seq Scan` on a large table with `Rows Removed by Filter` in the thousands: missing index (the command warns).
- `Sort` with `external merge`: the sort does not fit in memory; add an index matching the `ORDER BY`.
- `Nested Loop` with many `loops` on an inner scan: check the join has an index.
- Execution time above about 50 ms for a screen or a tool call: investigate before delivering.

Put the important queries and their plans in the module page of `docs/technical/modules/` (the `technical-docs` skill asks for it).

## Before saying it is done

- [ ] Parameters only; columns listed; every list limited and paginated
- [ ] Filters, sort, counts and aggregations in SQL
- [ ] Indexes created in the migration for every filter, sort and join
- [ ] Imports validated row by row, idempotent, batched and reported
- [ ] Integration tests for results and `countQueries` for lists
- [ ] `db:explain` run on realistic data for every new or changed query, with no large sequential scan

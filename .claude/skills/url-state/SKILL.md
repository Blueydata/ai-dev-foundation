---
name: url-state
description: URL standards - every URL fully reflects what is on screen (resource, filters, search, sort, page, tab, selected item, open dialog, step), with nuqs for typed query parameters shared by server and client. Use whenever creating or changing a page, a route, a link, navigation, a filter, a search, pagination, tabs, a dialog or any screen state.
---

# URL state

**The URL is the state of the screen.** Anyone who copies the URL, reloads the page, opens it in a new tab or uses back and forward sees exactly the same screen. If something visible changes and the URL does not, it is a bug.

The project uses **nuqs** for query parameters, already installed. `NuqsAdapter` is already in `src/app/layout.tsx`.

## What goes where

| On screen | In the URL | Example |
| --- | --- | --- |
| Which resource or section | **Path** | `/orders`, `/orders/8f3a`, `/settings/billing` |
| Create or edit screens | **Path** | `/orders/new`, `/orders/8f3a/edit` |
| Filters | Query | `?status=open&from=2026-10-01` |
| Search text | Query | `?q=late+delivery` |
| Sort | Query | `?sort=createdAt&order=desc` |
| Pagination | Query | `?page=3` (and `perPage` only if the user can change it) |
| Tab | Query | `?tab=history` |
| Selected item in a list or side panel | Query, or path if it has its own page | `?selected=8f3a` |
| Open dialog or drawer that matters on reload | Query | `?dialog=invite` |
| Wizard or form step | Query | `?step=2` |

Never in the URL: what is typed but not yet submitted in a form, hover, scroll position, loading flags and anything that only makes sense for a moment.

## Path rules

1. **English, `kebab-case`, plural nouns** for collections: `/orders`, `/support-tickets`. Never Portuguese or verbs (`/listar-pedidos`, `/getOrders`).
2. **Dynamic segments** use the stable id: `src/app/orders/[orderId]/page.tsx` → `/orders/8f3a`. If the id does not exist, call `notFound()`.
3. **Nesting follows ownership:** `/customers/[customerId]/orders`. At most two levels.
4. **Fixed actions** as the last segment: `/new`, `/edit`. Never `?mode=edit`.
5. API routes follow the same names: `src/app/api/orders/[orderId]/route.ts`.

## Query parameter rules

1. **Names in English `camelCase`, short and stable:** `q`, `status`, `sort`, `order`, `page`, `tab`, `selected`, `dialog`, `step`, `from`, `to`. Values also in English (`status=open`, never `status=aberto`); translate only the label on screen.
2. **Defaults are left out of the URL.** `/orders` and `/orders?status=open` must never both exist for the same screen: use `.withDefault()` and keep `clearOnDefault` (nuqs default).
3. **Typed and validated:** each parameter has a parser (`parseAsInteger`, `parseAsStringLiteral`, `parseAsIsoDate`, `parseAsArrayOf`…). An invalid value falls back to the default, never breaks the screen.
4. **Multiple values** with `parseAsArrayOf(parser)`: `?status=open,late`.
5. **Dates** as `YYYY-MM-DD` with `parseAsIsoDate`.
6. **Changing a filter, search or sort resets `page`** (set `page: null`).

## One definition per feature, shared by server and client

Put the parsers, the loader for the server and the serializer for links in the module `presentation/url-state.ts` (`project-structure` skill):

```ts
import { createLoader, createSerializer, parseAsInteger, parseAsString, parseAsStringLiteral } from "nuqs/server";

export const orderStatuses = ["open", "late", "delivered"] as const;

export const orderListParams = {
  status: parseAsStringLiteral(orderStatuses).withDefault("open"),
  q: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
};

export const loadOrderListParams = createLoader(orderListParams);
export const serializeOrderListParams = createSerializer(orderListParams);
```

**Server page** reads the same parameters and fetches the data:

```tsx
import type { SearchParams } from "nuqs/server";
import { listOrders } from "@/modules/orders";
import { OrderList } from "@/modules/orders/presentation/components/order-list";
import { loadOrderListParams } from "@/modules/orders/presentation/url-state";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { status, q, page } = await loadOrderListParams(searchParams);
  const orders = await listOrders({ status, q, page });
  return <OrderList orders={orders} />;
}
```

**Client component** changes them:

```tsx
"use client";
import { debounce, useQueryStates } from "nuqs";
import { useTransition } from "react";
import { orderListParams } from "@/modules/orders/presentation/url-state";

export function OrderFilters() {
  const [isPending, startTransition] = useTransition();
  const [{ status, q }, setParams] = useQueryStates(orderListParams, { shallow: false, startTransition });
  ...
  setParams({ q: value, page: null }, { limitUrlUpdates: debounce(300) });
  setParams({ status: "late", page: null }, { history: "push" });
}
```

**Links** to a screen with state use the serializer, never hand-built strings:

```tsx
<Link href={serializeOrderListParams("/orders", { status: "late" })}>…</Link>
```

## History and data

- **`history: "push"`** for changes the user expects to undo with back: tab, filter, page, opening an item or a dialog, wizard step.
- **`history: "replace"`** (nuqs default) for changes while typing: search text and sliders, always with `limitUrlUpdates: debounce(300)`.
- **`shallow: false`** when the server needs to fetch data again (the page reads the parameter); use `startTransition` to show loading with `isPending`. Leave `shallow` as default (true) for state that only the client uses.
- Use `scroll: false` (default) except when changing page in a long list.

## Page title

`generateMetadata` reflects the state when it helps the user find the tab: `"Order 8f3a"`, `"Orders — late"`. The title text is in the product language.

## Security and privacy

- **Never put personal data, secrets, tokens or passwords in the URL**: no email, phone, tax id or names in the path or in the query. Use ids.
- The URL is user input: validate it (parsers and `zod`) and check on the server that the user can see the requested resource.

## Testing

- **Unit:** test the parsers and serializers (`serializeOrderListParams("/orders", { status: "open" })` returns `/orders`, invalid values fall back to the default).
- **In the browser** (`test-in-browser` skill): change the state, reload, use back and forward and open the URL in a new tab; the screen must be the same.

## Before saying it is done

- [ ] Every visible state (resource, filter, search, sort, page, tab, selection, dialog, step) is in the URL
- [ ] Paths in English, `kebab-case`, plural; query names and values in English
- [ ] Defaults left out of the URL; invalid values fall back to the default; missing ids give `notFound()`
- [ ] Parsers in the module `presentation/url-state.ts`, shared by server page and client components
- [ ] `push` for navigation, `replace` with debounce for typing, `page` reset on filter change
- [ ] Links built with the serializer
- [ ] No personal data or secrets in the URL
- [ ] Reload, back and forward and new tab show the same screen

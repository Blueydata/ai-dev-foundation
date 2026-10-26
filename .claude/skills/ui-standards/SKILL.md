---
name: ui-standards
description: Project visual and experience standards - brand identity from CLAUDE.md, ready-made layouts (AppShell, PageHeader, EmptyState, ChatPanel), shadcn/ui components, Tailwind tokens, Motion, the four screen states, AI responses streamed with animated text, and a quality bar against generic-looking screens. Use whenever creating or changing a screen or a component.
---

# UI standards

Every screen must look like part of a real product with its own identity, never like a generic template. The project gives you the building blocks; your job is to compose them with the brand of this product.

## Building blocks (already installed)

| Purpose | Use | Where |
| --- | --- | --- |
| Admin and internal areas | `AppShell` (sidebar + mobile top bar), `PageHeader`, `EmptyState` | `src/shared/ui/layout/` |
| Public AI chat | `ChatPanel` (welcome, suggestions, messages, typing, errors, composer with send and stop), `toChatPanelMessages` | `src/shared/ui/ai/` |
| Components | shadcn/ui: `Button`, `Input`, `Textarea`, `Label`, `Card`, `Badge`, `Table`, `Skeleton` | `src/shared/ui/` |
| Styling | Tailwind CSS with the theme tokens | `src/app/globals.css` |
| Typeface | Instrument Sans (`font-sans`), installed locally | `src/app/globals.css` |
| Animation | Motion (`motion/react`) and `tw-animate-css` | in components |
| Icons | lucide-react | in components |
| Screen state in the URL | nuqs (`url-state` skill) | module `presentation/url-state.ts` |

Missing a shadcn/ui component (`dialog`, `select`, `dropdown-menu`, `sonner`, `tabs`…)? Add it with `docker compose exec app npx shadcn@latest add <name>`; it lands in `src/shared/ui/`. **Do not add other UI libraries** without asking the product owner first.

## Brand first

The "Brand" line of `CLAUDE.md` defines the identity. Before the first screen of a product, translate it into the tokens in `src/app/globals.css`, for light and dark mode:

- `--primary` and `--ring`: the brand color, used for primary actions, active navigation and the assistant avatar.
- `--accent`, `--secondary`, `--sidebar`: quiet tints of the brand color or of its neutral, never a second loud color.
- `--background` and `--foreground`: a neutral that fits the brand (warmer or cooler), with strong contrast.
- `--radius`: softer for friendly brands, tighter for technical ones.

Then use only tokens (`bg-primary`, `text-muted-foreground`, `border`…), never fixed colors like `bg-blue-500` or `#hex` in components. If the "Brand" line is empty, ask the product owner one question about colors and tone before building the first screen.

## Layouts

**Admin and internal areas** (anything behind a login):

- A route group layout renders `AppShell` with the brand mark, the navigation (one item per section, lucide icon, label in the product language) and a footer slot for the user and the sign-out button.
- Every page starts with `PageHeader`: a clear title, one sentence saying what the page is for, and the main action on the right (`Novo produto`, not `Adicionar`).
- Lists of records use `Table` inside a `rounded-xl border bg-card` container. Show the identifying column in `font-medium`, secondary columns in `text-muted-foreground`, numbers right-aligned with `tabular-nums`, status as `Badge`. On mobile, hide secondary columns with `hidden md:table-cell` so the table never squeezes text into tall rows.
- Groupings (folders, categories, statuses) as a row of pill filters above the list, with counts, kept in the URL (`url-state`).
- Forms: one column, `Label` above each field, help text under it in `text-muted-foreground`, the primary button at the end, inline validation messages next to the field.
- Empty lists use `EmptyState` with an icon, what this place is for, and the action that fills it.

**Public pages** (what customers see):

- A slim header with the brand mark and one line about what the page offers. No admin chrome.
- Content centered in a readable width (`max-w-2xl` for conversation, `max-w-5xl` for catalogs).

**AI chat** (public or internal):

- Use `ChatPanel` wired to `useChat` through `toChatPanelMessages`. Fill every prop with real content: an assistant avatar in the brand color, a welcome with a question-style headline about what the customer can ask, 3 suggestions written as real customer questions, a placeholder, an error message and a short footnote saying what the answers are based on.
- The page fills the viewport (`h-dvh`), the composer stays at the bottom and the messages scroll.

## Quality bar: never generic

- **One memorable element per screen.** Usually the brand color on the primary action and on the active state. Everything else stays quiet: neutral surfaces, thin borders, no gradients or glows as decoration.
- **Hierarchy through type, not boxes.** Titles `text-2xl font-semibold tracking-tight`, body `text-sm`/`text-[0.9375rem]`, meta in `text-muted-foreground`. Don't wrap every block in a card; use cards only for things that are actually separate objects.
- **Real copy.** Write the text the user needs, in the product language and vocabulary: sentence case, plain verbs, buttons that say what they do (`Salvar produto`), errors that say what happened and what to do. No lorem ipsum, no "Bem-vindo ao sistema", no all-caps labels above headings, no "→" on buttons.
- **Density.** Compact and calm: `h-9` controls, `gap-2` to `gap-6`, `p-4`/`p-6` containers, no large empty bands.
- **Motion with purpose.** Animate what answers an action (a row appears after saving, a dialog opens, a message arrives). No entrance animation on every block of a page.
- **Feedback everywhere.** Hover, focus and pressed states; disabled buttons while saving; a toast or inline confirmation after saving that repeats the action's name (`Produto salvo`).

## Every screen has four states

- **Loading:** `Skeleton` shaped like the content, never a blank screen or a lone spinner.
- **Empty:** `EmptyState` with the next step.
- **Error:** plain language, no technical details, with a retry or a way out.
- **Success:** the content.

## AI responses: streaming with animated text

A response never appears all at once or in dry chunks. It flows word by word, animated:

- **On the server:** always `experimental_transform: smoothTextStream()` (`ai-integration` skill).
- **On screen:** `ChatPanel` already shows `TypingIndicator` before the first chunk, `AiResponse` with blur-in words and a caret while streaming, the stop button, the error with retry, and scrolls to the end.

## Accessibility and devices

- Works from 360px wide with no horizontal page scroll; check the admin table and the chat on mobile.
- Dark mode works through the tokens; never force light colors.
- Every input has a label, icon buttons have `aria-label`, focus is visible, contrast is at least 4.5:1 for text. Reduced motion is respected (already handled in CSS).

## Before saying the screen is done

- [ ] Brand tokens set from the "Brand" line; no fixed colors in components
- [ ] Built from `AppShell`/`PageHeader`/`EmptyState`/`ChatPanel` and `src/shared/ui/` components
- [ ] Real copy in the product language; buttons and messages say what they do
- [ ] Loading, empty, error and success states
- [ ] Works at 360px wide and in dark mode
- [ ] Screen state reflected in the URL (`url-state` checklist)
- [ ] AI responses streamed through `ChatPanel`

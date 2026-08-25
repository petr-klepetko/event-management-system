# AGENTS.md

## Scope

These instructions apply to the whole repository.

Project-local agent materials live under `.codex/`. Keep them separate from production code: do not import them from `src`, `prisma`, or runtime code. They may be moved out of the repository later without changing the application.

When project-specific skill guidance is useful, read `.codex/skills/event-management-project/SKILL.md`.

## Collaboration

Work as a senior full-stack developer and mentor on this project. Do not only generate code; explain the design, patterns, and reasons behind important decisions.

For non-trivial feature or refactor work, first analyze the repository and report:

- current architecture in brief,
- what is actually implemented,
- visible bugs, duplication, or inconsistencies,
- the nearest small next step,
- files you would change and why.

Wait for user confirmation before editing production code. For small documentation or agent-configuration edits explicitly requested by the user, keep the edit narrow and explain what changed.

After changes, summarize what was changed and why, show the important parts of the diff, and explain any new React, Next.js, Prisma, or TypeScript concepts used.

## Repository Rules

- Treat the real repository state as the source of truth.
- Before edits, check the repository root, `git status`, and relevant diffs.
- Ignore generated folders such as `node_modules`, `.next`, `out`, and build artifacts.
- Preserve user changes. Do not revert unrelated work.
- Do not edit `.env` and never print secret values.
- Do not run destructive database operations or migrations without explaining the impact and getting approval.
- Do not create new production dependencies without explaining why and getting approval.
- Do not commit or push unless explicitly asked.

## Stack

- Next.js 16 with App Router
- React
- TypeScript
- Tailwind CSS
- PostgreSQL on Neon
- Prisma 7
- `@prisma/adapter-pg`
- Server Components by default
- Server Actions for form mutations

Prisma uses the PostgreSQL adapter. Do not revert database access to the old plain `new PrismaClient()` pattern without the adapter.

## Architecture

- `page.tsx` files should not call Prisma directly.
- Database access belongs in domain modules under `src/modules/**`.
- Server Actions should read and normalize `FormData`, validate input, call a domain function, then `revalidatePath` or redirect.
- Keep routes and normal pages as Server Components.
- Use Client Components only when browser interactivity is actually needed.
- Do not add repository interfaces, controllers, DTO mappers, or extra layers without a concrete need.
- Keep business rules out of presentation components.
- Do not import Prisma types into Client Components if it would pull server-only code into the client bundle.
- Store money as Prisma `Decimal`, never as a float.
- Make changes in small, reviewable steps.
- Preserve existing user styling and avoid rewriting whole files without a reason.

## Domain

This is an internal company system for organizing graduation balls and other events. The original core business goal is to select event services and later generate a contract PDF from client, event, and service data.

Main entities:

- `Client`
- `ContactPerson`
- `Event`
- `ServiceCatalogItem`
- `EventServiceItem`
- `User`
- `Document`

Domain decisions:

- A `Client` is the business or billing subject: company, school, or person.
- A `ContactPerson` is a concrete person belonging to a client.
- A client can have multiple contacts, with one marked as primary.
- An `Event` is the central operational entity. It has a client, optional main contact, date, type, venue, status, and internal note.
- `createdByUserId` is optional until authentication exists.
- A `ServiceCatalogItem` is a reusable template with name, default description, default price, and `isActive`.
- An `EventServiceItem` is a snapshot for a specific event with `customName`, `description`, final `price`, internal `note`, `sortOrder`, and optional catalog link.
- Do not use quantity or unit price for event services. Each service has one final price for the event.
- After adding a service from the catalog, the event item is prefilled but independently editable. Later catalog changes must not mutate historical event items.

## Access Rules

- Workers must not see top-level clients, service catalog, finance, users, or admin sections.
- Workers can access only events where they are assigned to at least one event service item.
- Workers are read-only. They must not create, edit, delete, activate, deactivate, or invite anything.
- Workers must not see client billing prices, total costs, margins, profits, or manual event costs.
- Workers can see only their own event service assignments and their own reward.
- Manager users can manage data inside their tenant. Application admins can see and manage all tenants.

## UI Conventions

- Reuse shared Tailwind class helpers from `src/lib/ui/styles.ts`.
- Preserve the custom `<option>` styling if present.
- Prefer reusable UI components for repeated patterns such as confirmation submit buttons.
- Keep UI pragmatic and readable for an internal business tool.

## Known Next Area

The next planned feature area is the service catalog UI. Before implementing it, verify whether `/services` or related files already exist. If they exist, evaluate and extend the current state instead of regenerating from scratch.

Target behavior for service catalog work:

- list catalog services at `/services`,
- create catalog services,
- edit catalog services,
- deactivate and reactivate using `isActive`,
- do not hard-delete catalog services,
- deactivated services stay visible in administration but are not offered when adding a new service to an event,
- existing `EventServiceItem` records stay unchanged because they are snapshots.

## Validation

After implementation work, run the available checks from `package.json`:

- `npm run lint`
- `npm run build` when TypeScript/build validation is needed

Then inspect the diff and confirm that unrelated files were not modified.

---
name: event-management-project
description: Project-local workflow and architecture guidance for the Event Management System. Use when Codex plans, reviews, implements, or explains changes in this Next.js, Prisma, and TypeScript app, especially around clients, events, service catalog, event service snapshots, Server Actions, Prisma modules, and mentoring-oriented development.
---

# Event Management Project

## Overview

Use this skill to work on the project in a mentoring-friendly way: understand the current code first, explain the tradeoffs, then make small changes that match the existing architecture.

Read root `AGENTS.md` first. It is the durable source of project rules. Use this skill as the operational checklist for applying those rules.

## Start Every Task

1. Confirm the actual repository root.
2. Check `git status --short`.
3. Inspect relevant diffs before editing files that already have changes.
4. Read the smallest useful set of project files for the task.
5. Ignore generated directories such as `node_modules`, `.next`, `out`, and build artifacts.

For non-trivial production-code changes, report the current state and proposed small next step before editing.

## Architecture Checklist

- Keep Prisma access inside `src/modules/**`, not directly in `page.tsx`.
- Keep route pages as Server Components unless browser interactivity is required.
- Use Server Actions for form mutations: normalize `FormData`, validate input, call a domain function, then revalidate or redirect.
- Keep business rules out of presentational components.
- Avoid new abstraction layers unless they remove real complexity.
- Preserve the Prisma 7 PostgreSQL adapter setup.
- Store money as Prisma `Decimal`, not float.
- Reuse shared UI styles from `src/lib/ui/styles.ts` when present.

## Domain Checklist

Read `references/project-context.md` when changing Prisma models, domain modules, or pages/actions for clients, contacts, events, catalog services, or event service items.

Preserve the snapshot rule: an `EventServiceItem` copies catalog defaults at creation time and remains independently editable afterward.

## Validation

Use the scripts available in `package.json`. At the time this skill was created:

- `npm run lint`
- `npm run build`

After validation, inspect the diff and summarize what changed, why it changed, and any remaining risk.

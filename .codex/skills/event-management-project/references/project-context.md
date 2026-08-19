# Project Context

This project is an internal company system for organizing graduation balls and other events. It should stay practical, portfolio-readable, and extensible without becoming unnecessarily enterprise-heavy.

## Stack

- Next.js 16 with App Router
- React
- TypeScript
- Tailwind CSS
- PostgreSQL on Neon
- Prisma 7 with `@prisma/adapter-pg`
- Server Components by default
- Server Actions for form mutations

## Main Entities

- `Client`
- `ContactPerson`
- `Event`
- `ServiceCatalogItem`
- `EventServiceItem`
- `User`
- `Document`

## Domain Rules

- A `Client` is a company, school, or person as a business or billing subject.
- A `ContactPerson` is a concrete person belonging to a client.
- A client may have multiple contacts and one primary contact.
- An `Event` is the central operational entity with client, optional main contact, date, type, venue, status, and internal note.
- `createdByUserId` is optional until authentication is implemented.
- A `ServiceCatalogItem` is a reusable service template with name, default description, default price, and `isActive`.
- An `EventServiceItem` is a per-event snapshot with `customName`, `description`, final `price`, internal `note`, `sortOrder`, and optional catalog link.
- Do not model event services with quantity or unit price for now. Each event service item has one final price.
- Adding from the catalog should prefill event service fields, but the event service item must remain independently editable.
- Later catalog changes must not mutate existing event service items.

## Current Planned Feature Area

The next known feature area is service catalog administration.

Before implementing, verify whether `/services` or related files already exist. Extend existing code if present.

Expected behavior:

- list catalog services at `/services`,
- create catalog services,
- edit catalog services,
- deactivate and reactivate with `isActive`,
- avoid hard delete,
- keep deactivated services visible in administration,
- hide deactivated services when adding a new service to an event,
- leave existing `EventServiceItem` rows unchanged.

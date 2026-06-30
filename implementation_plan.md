# Implementation Plan - Database Schema Extension (Users, Config, Events)

We will extend the Neon PostgreSQL database schema using Drizzle ORM to add three new tables:
1. **`users`**: To manage administrative users and perform secure server-side credential checks.
2. **`config`**: To dynamically store global brand details (email, phone, office name, and address) rather than hardcoding them in pages.
3. **`events`**: To manage fully-scheduled events in the admin panel.

---

## Proposed Changes

### 1. Database Schema Extension

#### [MODIFY] [schema.ts](file:///Users/mohitkoley/StudioProjects/event_planner/src/db/schema.ts)
- Define a **`users`** table:
  - `id`: UUID primary key.
  - `email`: Text (unique, non-null).
  - `password`: Text (non-null).
  - `name`: Text.
  - `createdTime`: Timestamp.
- Define a **`config`** table (single-row settings):
  - `id`: Integer primary key (defaults to 1).
  - `email`: Text (non-null).
  - `phone`: Text (non-null).
  - `address`: Text (non-null).
  - `officeName`: Text (non-null).
- Define an **`events`** table:
  - `id`: UUID primary key.
  - `title`: Text (non-null).
  - `clientName`: Text (non-null).
  - `clientEmail`: Text (non-null).
  - `date`: Text (non-null).
  - `type`: Text (non-null).
  - `status`: Text (default "Scheduled").
  - `notes`: Text.
  - `createdTime`: Timestamp.

---

### 2. Drizzle Server Actions

#### [MODIFY] [actions.ts](file:///Users/mohitkoley/StudioProjects/event_planner/src/app/actions.ts)
- **Auth Action**:
  - `validateLoginAction(email, password)`: Queries the `users` table to authenticate the administrator. Automatically seeds a default administrator user (`executive@infinityplanners.nyc` / `password`) if the table is empty.
- **Config Actions**:
  - `getConfigAction()`: Fetches the brand configuration row. Automatically seeds the default settings (email: `hello@infinityplanners.nyc`, phone: `+1 (516) 344-7239`, address: `545 Madison Avenue, 12th Floor, New York, NY 10022`) if empty.
  - `updateConfigAction(email, phone, address)`: Updates the brand config row.
- **Events Actions**:
  - `getEventsAction()`: Fetches all scheduled events. Automatically seeds mock scheduled events if the table is empty.
  - `createEventAction(data)`: Inserts a new event.
  - `deleteEventAction(id)`: Deletes an event.

---

### 3. UI and Page Integration

#### [MODIFY] [page.tsx](file:///Users/mohitkoley/StudioProjects/event_planner/src/app/page.tsx)
- Use a React `useEffect` to fetch dynamic contact details (email, phone, address) on load via `getConfigAction()`, displaying them dynamically in the contact section and footer instead of using hardcoded variables.

#### [MODIFY] [login/page.tsx](file:///Users/mohitkoley/StudioProjects/event_planner/src/app/admin/login/page.tsx)
- Connect login submission to the `validateLoginAction` server action to perform real validation against the `users` database table.

#### [MODIFY] [dashboard/page.tsx](file:///Users/mohitkoley/StudioProjects/event_planner/src/app/admin/dashboard/page.tsx)
- Query the `config` table to display live studio contact info.
- Add an **Events tab view** or display events details where appropriate in the layout, linked to `getEventsAction` and `createEventAction`.

---

## Verification Plan

### Database Push
- Push the new tables using `npx drizzle-kit push`.

### Automated Verification
- Compile production build (`npm run build`) to check for any TypeScript/Drizzle type errors.

### Manual Verification
- Run dev server (`npm run dev`).
- Log in at `/admin/login` using the seeded credentials (`executive@infinityplanners.nyc` / `password`) and verify that login resolves successfully against the database.
- Verify that lead submissions, configuration details, and events list are dynamically loaded from the database.

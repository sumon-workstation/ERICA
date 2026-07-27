# ERICA

ERICA is a multi-tenant SaaS operating platform that connects CRM, finance, HR,
inventory/assets, and cross-module automation around a single shared entity
record and audit timeline.

## Stack

- Next.js 14 App Router, TypeScript, Tailwind CSS
- Supabase Auth, Postgres, Storage-ready configuration, strict RLS
- Stripe Checkout, Billing Portal, subscription webhooks, usage events
- Resend transactional automation notifications
- Vercel-ready deployment

## Local setup

1. Copy `.env.example` to `.env.local` and fill in the values.
2. Create a Supabase project and run `supabase db push`.
3. Enable email/password and Google in Supabase Auth. Add
   `http://localhost:3000/auth/callback` as an allowed redirect.
4. Run `npm install` and `npm run dev`.
5. Create an account, then use **Load demo data** from the dashboard.

The first authenticated visit creates an organization and a 30-day trial.

## Production configuration

Set every variable from `.env.example` in Vercel. Never commit secrets. Apply
the migrations in `supabase/migrations` to the production Supabase project.
Create a Stripe webhook pointing to:

`https://YOUR_DOMAIN/api/webhooks/stripe`

Subscribe it to `customer.subscription.created`, `updated`, and `deleted`.
Configure the seat price as recurring licensed pricing and the usage add-on as
metered recurring pricing.

## Architecture

Every tenant-owned table contains `org_id`; RLS policies use authenticated
organization membership for every read and mutation. The `entities` table is
the canonical person/company record across leads, customers, employees, and
vendors. `activity_log` is populated by database triggers across modules.

The automation runner currently executes three real cross-module workflows:

- low stock → draft purchase order + email notification
- deal won → convert entity to customer + draft invoice
- leave approved → shared calendar block + email notification

## Validation

```bash
npm run typecheck
npm run build
```

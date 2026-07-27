# ERICA

ERICA is a multi-tenant SaaS operating platform that connects CRM, ERP/finance,
HR, inventory/assets, and cross-module automation around a single shared
entity record and audit timeline — a single application covering the same
ground as running Salesforce + Odoo + BambooHR + Zoho Inventory + n8n
separately, without the integration tax between them.

## Modules

- **CRM** (Salesforce-scope): lead capture & scoring, contact/account 360°,
  Kanban pipeline with weighted forecasting, quotes → sales order conversion,
  case/ticket management with SLA tracking, campaigns with member tracking,
  discount approval workflow, activity timeline.
- **ERP** (Odoo-scope): invoicing, purchase orders, vendor bills with 3-way
  match, sales orders/quotations, expense reports, budgets vs actuals,
  recurring billing, P&L / AR / AP reporting.
- **HR** (BambooHR-scope): employee directory, applicant tracking (job
  postings → candidate pipeline → hire), leave & attendance, onboarding
  checklists, performance reviews & goals, benefits enrollment, document
  e-signature, headcount/turnover/tenure analytics.
- **Inventory & Assets** (Zoho Inventory-scope): multi-warehouse stock,
  weighted-average cost valuation, item variants, bundles/kits, serial &
  batch tracking, low-stock alerts, asset register with depreciation.
- **Automation** (n8n-scope): trigger → condition → action workflow builder,
  a template gallery, inbound webhooks (public per-org endpoint), a
  credential vault, manual test-runs, and a full execution log.

Every module writes to the same `entities`/`activity_log` backbone, so a won
deal, an approved expense, or an urgent case can all trigger real
cross-module side effects (see Architecture below).

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

The automation runner currently executes five real cross-module workflows,
each triggerable from its module, from the template gallery, or from an
inbound webhook:

- low stock → draft purchase order + email notification
- deal won → convert entity to customer + draft invoice
- leave approved → shared calendar block + email notification
- expense approved → ledger entry posted + email notification
- urgent case opened → support team notified

Inbound webhooks (`/api/webhooks/inbound/[token]`) let any external system —
Zapier, a form provider, another internal tool — fire these same workflows
by posting JSON to a per-organization, per-workflow secret URL.

## Validation

```bash
npm run typecheck
npm run build
```

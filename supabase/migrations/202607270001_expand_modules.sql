-- Expands CRM, ERP, HR, Inventory/Assets and Automation to feature parity with
-- Salesforce / Odoo / BambooHR / Zoho Inventory / n8n reference scope.

alter table public.organizations add column if not exists currency text not null default 'USD';

alter table public.entities add column if not exists lead_score int not null default 0;
alter table public.entities add column if not exists lead_source text;
alter table public.entities add column if not exists assigned_to uuid references auth.users(id);
alter table public.entities add column if not exists territory text;

alter table public.deals add column if not exists lost_reason text;
alter table public.deals add column if not exists discount_percent numeric(5,2) not null default 0;
alter table public.deals add column if not exists approval_status text not null default 'none' check(approval_status in ('none','pending','approved','rejected'));

alter table public.assets add column if not exists purchase_cost numeric(14,2) default 0;
alter table public.assets add column if not exists purchased_on date;
alter table public.assets add column if not exists depreciation_months int default 36;

-- ---------- CRM: cases, campaigns, quotes, approvals ----------
create table public.cases (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  entity_id uuid references public.entities(id) on delete set null, subject text not null, description text,
  priority text not null default 'normal' check(priority in ('low','normal','high','urgent')),
  status text not null default 'open' check(status in ('open','pending','resolved','closed')),
  sla_hours int not null default 24, assigned_to uuid references auth.users(id),
  resolved_at timestamptz, created_at timestamptz not null default now()
);
create table public.campaigns (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, type text default 'email', status text not null default 'planning' check(status in ('planning','active','completed')),
  start_date date, end_date date, budget numeric(14,2) default 0, expected_revenue numeric(14,2) default 0, created_at timestamptz default now()
);
create table public.campaign_members (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade, entity_id uuid not null references public.entities(id) on delete cascade,
  status text not null default 'sent' check(status in ('sent','responded','converted')), created_at timestamptz default now(), unique(campaign_id,entity_id)
);
create table public.quotes (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  deal_id uuid references public.deals(id) on delete set null, entity_id uuid not null references public.entities(id),
  quote_number text not null, status text not null default 'draft' check(status in ('draft','sent','accepted','declined')),
  valid_until date, items jsonb not null default '[]', subtotal numeric(14,2) default 0, discount numeric(14,2) default 0,
  total numeric(14,2) default 0, created_at timestamptz default now(), unique(org_id,quote_number)
);
create table public.approval_requests (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  kind text not null, record_table text not null, record_id uuid not null, reason text,
  requested_by uuid references auth.users(id), status text not null default 'pending' check(status in ('pending','approved','rejected')),
  decided_by uuid references auth.users(id), decided_at timestamptz, created_at timestamptz default now()
);

-- ---------- ERP: sales orders, vendor bills, expenses, budgets, recurring billing ----------
create table public.sales_orders (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  entity_id uuid not null references public.entities(id), quote_id uuid references public.quotes(id) on delete set null,
  order_number text not null, status text not null default 'quotation' check(status in ('quotation','confirmed','invoiced','cancelled')),
  items jsonb not null default '[]', total numeric(14,2) default 0, created_at timestamptz default now(), unique(org_id,order_number)
);
create table public.bills (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  vendor_id uuid not null references public.entities(id), po_id uuid references public.purchase_orders(id) on delete set null,
  bill_number text not null, status text not null default 'pending' check(status in ('pending','matched','mismatched','paid')),
  amount numeric(14,2) not null default 0, due_on date, created_at timestamptz default now(), unique(org_id,bill_number)
);
create table public.expenses (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  employee_id uuid not null references public.employees(id), category text not null, description text,
  amount numeric(14,2) not null, spent_on date not null default current_date,
  status text not null default 'submitted' check(status in ('submitted','approved','rejected','reimbursed')), created_at timestamptz default now()
);
create table public.budgets (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  category text not null, period_start date not null, period_end date not null, amount_planned numeric(14,2) not null default 0, created_at timestamptz default now()
);
create table public.recurring_invoices (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid not null references public.entities(id), plan_name text not null, amount numeric(14,2) not null,
  interval text not null default 'monthly' check(interval in ('monthly','quarterly','yearly')), next_run_on date not null default current_date,
  status text not null default 'active' check(status in ('active','paused','cancelled')), created_at timestamptz default now()
);

-- ---------- HR: ATS, performance, benefits, esignature ----------
create table public.job_postings (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  title text not null, department text, location text, employment_type text default 'full_time',
  status text not null default 'open' check(status in ('open','on_hold','closed')), description text, created_at timestamptz default now()
);
create table public.candidates (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  job_posting_id uuid not null references public.job_postings(id) on delete cascade, name text not null, email text, phone text,
  stage text not null default 'applied' check(stage in ('applied','screening','interview','offer','hired','rejected')),
  score int, notes text, created_at timestamptz default now()
);
create table public.performance_reviews (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  employee_id uuid not null references public.employees(id), reviewer_id uuid references auth.users(id), cycle text not null,
  rating int check(rating between 1 and 5), strengths text, improvements text,
  status text not null default 'draft' check(status in ('draft','submitted','acknowledged')), created_at timestamptz default now()
);
create table public.goals (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  employee_id uuid not null references public.employees(id), title text not null, target text, progress int not null default 0,
  status text not null default 'in_progress' check(status in ('in_progress','completed','missed')), due_on date, created_at timestamptz default now()
);
create table public.benefit_plans (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, category text not null default 'health', provider text, cost_employee numeric(10,2) default 0, cost_employer numeric(10,2) default 0, created_at timestamptz default now()
);
create table public.benefit_enrollments (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  employee_id uuid not null references public.employees(id), plan_id uuid not null references public.benefit_plans(id),
  status text not null default 'enrolled' check(status in ('enrolled','waived')), enrolled_on date default current_date, unique(employee_id,plan_id)
);
create table public.hr_documents (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  employee_id uuid not null references public.employees(id), title text not null,
  status text not null default 'pending' check(status in ('pending','signed')), signed_at timestamptz, signed_by uuid references auth.users(id), created_at timestamptz default now()
);

-- ---------- Inventory & Assets: warehouses, variants, bundles, serials ----------
create table public.warehouses (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, location text, is_default boolean not null default false, created_at timestamptz default now()
);
alter table public.inventory_items add column if not exists category text;
alter table public.inventory_items add column if not exists barcode text;
alter table public.inventory_items add column if not exists valuation_method text not null default 'weighted_average';
alter table public.stock_movements add column if not exists warehouse_id uuid references public.warehouses(id) on delete set null;
alter table public.stock_movements add column if not exists unit_cost numeric(14,2);
create table public.warehouse_stock (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  item_id uuid not null references public.inventory_items(id) on delete cascade, warehouse_id uuid not null references public.warehouses(id) on delete cascade,
  quantity numeric(14,2) not null default 0, unique(item_id,warehouse_id)
);
create table public.item_variants (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  item_id uuid not null references public.inventory_items(id) on delete cascade, name text not null, sku_suffix text not null,
  attributes jsonb default '{}', quantity numeric(14,2) not null default 0, created_at timestamptz default now()
);
create table public.item_components (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  parent_item_id uuid not null references public.inventory_items(id) on delete cascade, component_item_id uuid not null references public.inventory_items(id) on delete cascade,
  quantity numeric(14,2) not null default 1, created_at timestamptz default now(), unique(parent_item_id,component_item_id)
);
create table public.item_serials (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  item_id uuid not null references public.inventory_items(id) on delete cascade, serial_number text not null,
  status text not null default 'in_stock' check(status in ('in_stock','sold','assigned','damaged')), warehouse_id uuid references public.warehouses(id),
  created_at timestamptz default now(), unique(org_id,serial_number)
);

-- ---------- Automation: inbound webhooks & credential vault ----------
create table public.webhooks (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, trigger_key text not null default 'webhook.custom', token text not null default encode(gen_random_bytes(16),'hex'),
  enabled boolean not null default true, last_triggered_at timestamptz, created_at timestamptz default now(), unique(token)
);
create table public.automation_credentials (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, kind text not null default 'api_key', value text not null, created_at timestamptz default now()
);

-- ---------- RLS ----------
do $$ declare t text; begin
  foreach t in array array['cases','campaigns','campaign_members','quotes','approval_requests','sales_orders','bills','expenses','budgets',
    'recurring_invoices','job_postings','candidates','performance_reviews','goals','benefit_plans','benefit_enrollments','hr_documents',
    'warehouses','warehouse_stock','item_variants','item_components','item_serials','webhooks','automation_credentials']
  loop execute format('alter table public.%I enable row level security',t);
       execute format('create policy "org read" on public.%I for select using(public.is_org_member(org_id))',t);
       execute format('create policy "org insert" on public.%I for insert with check(public.is_org_member(org_id))',t);
       execute format('create policy "org update" on public.%I for update using(public.is_org_member(org_id)) with check(public.is_org_member(org_id))',t);
       execute format('create policy "org delete" on public.%I for delete using(public.has_org_role(org_id,array[''owner'',''admin'']::member_role[]))',t);
  end loop;
end $$;

do $$ declare t text; begin
  foreach t in array array['cases','quotes','campaigns','sales_orders','bills','expenses','candidates','performance_reviews','job_postings']
  loop execute format('create trigger audit_%I after insert or update or delete on public.%I for each row execute function public.log_mutation()',t,t); end loop;
end $$;

-- Multi-warehouse stock + weighted-average costing on every stock movement
create or replace function public.apply_stock_movement() returns trigger language plpgsql security definer set search_path=public as $$
begin
  update inventory_items set
    quantity = quantity + (case when new.direction='in' then new.quantity else -new.quantity end),
    unit_cost = case when new.direction='in' and new.unit_cost is not null and new.unit_cost>0
      then round(((quantity*unit_cost)+(new.quantity*new.unit_cost))/nullif(quantity+new.quantity,0),2)
      else unit_cost end
  where id=new.item_id and org_id=new.org_id;
  if new.warehouse_id is not null then
    insert into warehouse_stock(org_id,item_id,warehouse_id,quantity)
    values(new.org_id,new.item_id,new.warehouse_id,case when new.direction='in' then new.quantity else -new.quantity end)
    on conflict(item_id,warehouse_id) do update set quantity=warehouse_stock.quantity+excluded.quantity;
  end if;
  return new;
end $$;

create index on public.cases(org_id,status); create index on public.quotes(org_id,status);
create index on public.sales_orders(org_id,status); create index on public.candidates(org_id,stage);
create index on public.expenses(org_id,status); create index on public.item_serials(org_id,item_id);
create index on public.webhooks(org_id); create index on public.recurring_invoices(org_id,next_run_on);

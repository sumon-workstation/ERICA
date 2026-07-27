create extension if not exists pgcrypto;

create type public.entity_type as enum ('person','company');
create type public.member_role as enum ('owner','admin','manager','member','viewer');

create table public.organizations (
  id uuid primary key default gen_random_uuid(), name text not null,
  slug text unique not null, created_by uuid not null references auth.users(id),
  trial_ends_at timestamptz not null default now()+interval '30 days',
  subscription_status text not null default 'trialing', stripe_customer_id text unique,
  stripe_subscription_id text unique, created_at timestamptz not null default now()
);
create table public.roles (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, permissions jsonb not null default '[]', created_at timestamptz not null default now(), unique(org_id,name)
);
create table public.org_members (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, role member_role not null default 'member',
  role_id uuid references public.roles(id), created_at timestamptz not null default now(), unique(org_id,user_id)
);
create table public.entities (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  type entity_type not null, name text not null, email text, phone text, website text, address jsonb default '{}',
  tags text[] default '{}', is_lead boolean default false, is_customer boolean default false,
  is_vendor boolean default false, is_employee boolean default false, metadata jsonb default '{}',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.activity_log (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  actor_id uuid references auth.users(id), entity_id uuid references public.entities(id) on delete set null,
  module text not null, action text not null, summary text not null, metadata jsonb default '{}',
  created_at timestamptz not null default now()
);
create table public.deals (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  entity_id uuid not null references public.entities(id), title text not null, value numeric(14,2) default 0,
  stage text not null default 'Lead' check(stage in ('Lead','Qualified','Proposal','Negotiation','Won','Lost')),
  probability int default 10, close_date date, owner_id uuid references auth.users(id), created_at timestamptz default now(), updated_at timestamptz default now()
);
create table public.tasks (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  entity_id uuid references public.entities(id), title text not null, module text not null default 'crm',
  due_at timestamptz, assigned_to uuid references auth.users(id), completed boolean default false, created_at timestamptz default now()
);
create table public.employees (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  entity_id uuid not null references public.entities(id), job_title text, department text, start_date date,
  status text default 'active', manager_id uuid references public.employees(id), created_at timestamptz default now()
);
create table public.leave_requests (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  employee_id uuid not null references public.employees(id), leave_type text not null, starts_on date not null, ends_on date not null,
  reason text, status text default 'pending' check(status in ('pending','approved','rejected')),
  reviewed_by uuid references auth.users(id), reviewed_at timestamptz, created_at timestamptz default now()
);
create table public.attendance (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  employee_id uuid not null references public.employees(id), clock_in timestamptz not null, clock_out timestamptz, notes text
);
create table public.onboarding_items (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  employee_id uuid not null references public.employees(id), title text not null, completed boolean default false, due_on date
);
create table public.inventory_items (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  sku text not null, name text not null, description text, quantity numeric(14,2) default 0,
  reorder_point numeric(14,2) default 0, unit_cost numeric(14,2) default 0, unit text default 'unit',
  created_at timestamptz default now(), unique(org_id,sku)
);
create table public.stock_movements (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  item_id uuid not null references public.inventory_items(id), direction text not null check(direction in ('in','out')),
  quantity numeric(14,2) not null check(quantity>0), reason text, created_by uuid references auth.users(id), created_at timestamptz default now()
);
create table public.assets (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, asset_tag text not null, serial_number text, status text default 'available',
  assigned_employee_id uuid references public.employees(id), checked_out_at timestamptz, unique(org_id,asset_tag)
);
create table public.purchase_orders (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  vendor_id uuid not null references public.entities(id), po_number text not null, status text default 'draft',
  total numeric(14,2) default 0, items jsonb default '[]', expected_on date, created_at timestamptz default now(), unique(org_id,po_number)
);
create table public.invoices (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid not null references public.entities(id), invoice_number text not null, status text default 'draft',
  amount numeric(14,2) default 0, due_on date, items jsonb default '[]', notes text, created_at timestamptz default now(), unique(org_id,invoice_number)
);
create table public.ledger_entries (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  entry_date date not null default current_date, type text not null check(type in ('income','expense')),
  category text not null, description text, amount numeric(14,2) not null, entity_id uuid references public.entities(id), created_at timestamptz default now()
);
create table public.automation_rules (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, trigger_key text not null, condition jsonb default '{}', action_key text not null,
  action_config jsonb default '{}', enabled boolean default true, runs int default 0, created_at timestamptz default now()
);
create table public.automation_runs (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  rule_id uuid references public.automation_rules(id) on delete set null, status text not null, input jsonb, output jsonb,
  error text, created_at timestamptz default now()
);
create table public.calendar_blocks (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  employee_id uuid references public.employees(id), title text not null, starts_on date not null, ends_on date not null, source_id uuid, created_at timestamptz default now()
);
create table public.usage_events (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organizations(id) on delete cascade,
  module text not null, event_name text not null, quantity int not null default 1, stripe_reported boolean default false, created_at timestamptz default now()
);

create or replace function public.is_org_member(target uuid) returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.org_members where org_id=target and user_id=auth.uid()) $$;
create or replace function public.has_org_role(target uuid, allowed member_role[]) returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.org_members where org_id=target and user_id=auth.uid() and role=any(allowed)) $$;

alter table public.organizations enable row level security;
create policy "members read org" on public.organizations for select using(public.is_org_member(id) or created_by=auth.uid());
create policy "users create org" on public.organizations for insert with check(created_by=auth.uid());
create policy "admins update org" on public.organizations for update using(public.has_org_role(id,array['owner','admin']::member_role[]));

do $$ declare t text; begin
  foreach t in array array['roles','org_members','entities','activity_log','deals','tasks','employees','leave_requests','attendance','onboarding_items','inventory_items','stock_movements','assets','purchase_orders','invoices','ledger_entries','automation_rules','automation_runs','calendar_blocks','usage_events']
  loop execute format('alter table public.%I enable row level security',t);
       execute format('create policy "org read" on public.%I for select using(public.is_org_member(org_id))',t);
       execute format('create policy "org insert" on public.%I for insert with check(public.is_org_member(org_id))',t);
       execute format('create policy "org update" on public.%I for update using(public.is_org_member(org_id)) with check(public.is_org_member(org_id))',t);
       execute format('create policy "org delete" on public.%I for delete using(public.has_org_role(org_id,array[''owner'',''admin'']::member_role[]))',t);
  end loop;
end $$;

create or replace function public.create_organization(org_name text) returns uuid language plpgsql security definer set search_path=public as $$
declare oid uuid; begin
  insert into organizations(name,slug,created_by) values(org_name,lower(regexp_replace(org_name,'[^a-zA-Z0-9]+','-','g'))||'-'||substr(gen_random_uuid()::text,1,6),auth.uid()) returning id into oid;
  insert into roles(org_id,name,permissions) values(oid,'Owner','["*"]');
  insert into org_members(org_id,user_id,role,role_id) select oid,auth.uid(),'owner',id from roles where org_id=oid and name='Owner';
  return oid;
end $$;

create or replace function public.apply_stock_movement() returns trigger language plpgsql security definer set search_path=public as $$
begin update inventory_items set quantity=quantity+(case when new.direction='in' then new.quantity else -new.quantity end) where id=new.item_id and org_id=new.org_id; return new; end $$;
create trigger stock_qty after insert on public.stock_movements for each row execute function public.apply_stock_movement();

create or replace function public.log_mutation() returns trigger language plpgsql security definer set search_path=public as $$
declare row_data record; begin row_data:=case when tg_op='DELETE' then old else new end;
 insert into activity_log(org_id,actor_id,module,action,summary,metadata) values(row_data.org_id,auth.uid(),tg_table_name,tg_op,initcap(replace(tg_table_name,'_',' '))||' '||lower(tg_op),jsonb_build_object('record_id',row_data.id)); return row_data; end $$;
do $$ declare t text; begin foreach t in array array['entities','deals','tasks','employees','leave_requests','inventory_items','stock_movements','assets','purchase_orders','invoices','ledger_entries'] loop execute format('create trigger audit_%I after insert or update or delete on public.%I for each row execute function public.log_mutation()',t,t); end loop; end $$;

create index on public.entities(org_id); create index on public.deals(org_id,stage); create index on public.activity_log(org_id,created_at desc);
create index on public.inventory_items(org_id,quantity); create index on public.automation_runs(org_id,created_at desc);

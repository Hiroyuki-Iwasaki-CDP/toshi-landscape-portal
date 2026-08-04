-- トシ・ランドスケープ社内ポータル: 初期スキーマ
-- 公開デモ(GitHub Pages + anonキー)を前提に、全テーブルRLS有効・匿名ロールは読み取りのみ許可する

create table if not exists news (
  id text primary key,
  date date not null,
  category text not null,
  title text not null,
  body text not null
);

create table if not exists schedule_items (
  id text primary key,
  date date not null,
  time text not null,
  title text not null,
  location text not null
);

create table if not exists clients (
  id text primary key,
  code text not null,
  name text not null,
  industry text not null,
  contact_person text not null,
  address text not null,
  contract_start_date date not null,
  phone text not null
);

create table if not exists sales_records (
  id bigserial primary key,
  client_id text not null references clients(id) on delete cascade,
  department text not null check (department in ('GREEN_MAINTENANCE', 'TREE_RISK_ASSESSMENT', 'LANDSCAPE_CONSULTING')),
  year_month text not null,
  fiscal_year integer not null,
  amount numeric not null,
  man_days numeric not null,
  waste_kg numeric not null
);
create index if not exists sales_records_client_id_idx on sales_records(client_id);
create index if not exists sales_records_fiscal_year_idx on sales_records(fiscal_year);

create table if not exists portal_users (
  id text primary key,
  name text not null,
  email text not null unique,
  department text check (department in ('GREEN_MAINTENANCE', 'TREE_RISK_ASSESSMENT', 'LANDSCAPE_CONSULTING')),
  role text not null check (role in ('admin', 'editor', 'staff'))
);

-- RLS有効化
alter table news enable row level security;
alter table schedule_items enable row level security;
alter table clients enable row level security;
alter table sales_records enable row level security;
alter table portal_users enable row level security;

-- 匿名ロール(anon key)には読み取りのみ許可。書き込みはservice_role(サーバー側/シード用)のみ
create policy "public read news" on news for select using (true);
create policy "public read schedule_items" on schedule_items for select using (true);
create policy "public read clients" on clients for select using (true);
create policy "public read sales_records" on sales_records for select using (true);
create policy "public read portal_users" on portal_users for select using (true);

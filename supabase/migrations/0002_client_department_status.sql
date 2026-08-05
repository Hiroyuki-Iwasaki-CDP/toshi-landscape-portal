-- 取引先マスタの拡張: 主管部門・状態の追加、別名(名寄せ)テーブルの新設
-- 「取引先コード・名寄せ設計メモ」に基づく。CSV取込時に部門列がなくても
-- clients.department から実績データの部門を補完できるようにする。

alter table clients add column if not exists department text
  check (department in ('GREEN_MAINTENANCE', 'TREE_RISK_ASSESSMENT', 'LANDSCAPE_CONSULTING'));
alter table clients add column if not exists status text not null default 'active'
  check (status in ('active', 'paused', 'ended'));

-- 既存行の主管部門を暫定で埋める（実データ投入時に手動で見直す想定）
update clients set department = 'GREEN_MAINTENANCE' where department is null;
alter table clients alter column department set not null;

create table if not exists client_aliases (
  id text primary key,
  alias text not null unique,
  client_id text not null references clients(id) on delete cascade,
  created_at date not null default current_date,
  created_by text not null
);
create index if not exists client_aliases_client_id_idx on client_aliases(client_id);

alter table client_aliases enable row level security;
create policy "public read client_aliases" on client_aliases for select using (true);

-- 実績データに契約種別(年間契約/スポット)を追加
-- 月別売上推移で「年間契約」と「スポット」の内訳を見られるようにするための拡張

alter table sales_records add column if not exists contract_type text not null default 'annual'
  check (contract_type in ('annual', 'spot'));

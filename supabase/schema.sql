-- Chogtown keeps every record as a JSON document in one table.
create table if not exists docs (
  col text not null,
  id text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (col, id)
);
create index if not exists docs_col_updated on docs (col, updated_at desc);
-- Only the server (service role key) reads and writes this table.
alter table docs enable row level security;

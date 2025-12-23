-- events: satu baris per transfer side (double-entry)
create table if not exists asset_transfer_events (
  chain_id integer not null,
  block_number bigint not null,
  block_hash text not null,
  tx_hash text not null,
  log_index integer not null,
  address text not null,            -- token contract
  standard text not null,           -- 'erc20' | 'erc721' | 'erc1155'
  wallet_address text not null,     -- from / to
  direction text not null,          -- 'out' | 'in'
  amount_raw text null,             -- ERC20 amount (string)
  token_id text null,               -- ERC721 tokenId (string)
  primary key (chain_id, tx_hash, log_index, wallet_address, direction)
);

create index if not exists idx_asset_transfer_events_wallet
  on asset_transfer_events (wallet_address, block_number);

-- cursor table (sudah ada)
create table if not exists indexer_cursors (
  id text primary key,
  cursor_block bigint not null,
  updated_at timestamptz not null default now()
);

create table if not exists indexed_blocks (
  chain_id integer not null,
  block_number bigint not null,
  block_hash text not null,
  block_timestamp timestamptz not null,
  indexed_at timestamptz not null default now(),
  primary key (chain_id, block_number)
);

create index if not exists idx_indexed_blocks_timestamp
  on indexed_blocks (block_timestamp);

-- Wallet-centric reads (paling sering)
create index if not exists idx_ate_wallet_block
  on asset_transfer_events (wallet_address, block_number);

-- Filter by token contract + standard
create index if not exists idx_ate_address_standard
  on asset_transfer_events (address, standard);

-- Time-based scans
create index if not exists idx_ate_block_number
  on asset_transfer_events (block_number);

-- Optional: speed up cursor reads
create index if not exists idx_indexer_cursors_id
  on indexer_cursors (id);

insert into indexer_cursors (id, cursor_block)
values ('main', 0)
on conflict do nothing;

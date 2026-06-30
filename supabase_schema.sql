create table invitations (
  id uuid primary key default gen_random_uuid(),
  slug text not null,

  sender_name text not null,
  sender_email text not null,

  receiver_name text not null,
  receiver_gender text not null check (receiver_gender in ('male', 'female', 'other')),
  receiver_email text not null,

  date_options jsonb not null,
  food_options jsonb not null,
  place_options jsonb not null,

  said_yes boolean,
  confirmed_date date,
  confirmed_food text,
  confirmed_place text,

  status text not null default 'pending' check (status in ('pending', 'confirmed', 'declined', 'completed')),
  responded_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_invitations_slug_status on invitations (slug, status);

-- Allow the frontend (anon key) to read and write, since there is no auth system.
alter table invitations enable row level security;

create policy "Anyone can insert invitations"
  on invitations for insert
  with check (true);

create policy "Anyone can read invitations"
  on invitations for select
  using (true);

create policy "Anyone can update invitations"
  on invitations for update
  using (true);

-- Every user-owned record must belong to the currently authenticated Supabase user.
-- This is the security boundary; frontend filters are only a convenience.

alter table if exists public.media enable row level security;
alter table if exists public.albums enable row level security;
alter table if exists public.playlists enable row level security;

create index if not exists media_user_id_created_at_idx on public.media (user_id, created_at desc);
create index if not exists albums_user_id_created_at_idx on public.albums (user_id, created_at desc);
create index if not exists playlists_user_id_created_at_idx on public.playlists (user_id, created_at desc);

drop policy if exists "media_select_own" on public.media;
drop policy if exists "media_insert_own" on public.media;
drop policy if exists "media_update_own" on public.media;
drop policy if exists "media_delete_own" on public.media;
create policy "media_select_own" on public.media for select to authenticated using (user_id = auth.uid());
create policy "media_insert_own" on public.media for insert to authenticated with check (user_id = auth.uid());
create policy "media_update_own" on public.media for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "media_delete_own" on public.media for delete to authenticated using (user_id = auth.uid());

drop policy if exists "albums_select_own" on public.albums;
drop policy if exists "albums_insert_own" on public.albums;
drop policy if exists "albums_update_own" on public.albums;
drop policy if exists "albums_delete_own" on public.albums;
create policy "albums_select_own" on public.albums for select to authenticated using (user_id = auth.uid());
create policy "albums_insert_own" on public.albums for insert to authenticated with check (user_id = auth.uid());
create policy "albums_update_own" on public.albums for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "albums_delete_own" on public.albums for delete to authenticated using (user_id = auth.uid());

drop policy if exists "playlists_select_own" on public.playlists;
drop policy if exists "playlists_insert_own" on public.playlists;
drop policy if exists "playlists_update_own" on public.playlists;
drop policy if exists "playlists_delete_own" on public.playlists;
create policy "playlists_select_own" on public.playlists for select to authenticated using (user_id = auth.uid());
create policy "playlists_insert_own" on public.playlists for insert to authenticated with check (user_id = auth.uid());
create policy "playlists_update_own" on public.playlists for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "playlists_delete_own" on public.playlists for delete to authenticated using (user_id = auth.uid());

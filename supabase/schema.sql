-- Run once in the SQL Editor of your own Supabase project.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  saved_places text[] not null default '{}',
  visited_places text[] not null default '{}',
  updated_at timestamptz not null default now()
);
create table if not exists public.user_libraries (
  user_id uuid primary key references auth.users(id) on delete cascade,
  content jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
alter table public.user_libraries enable row level security;
drop policy if exists "Own profile" on public.profiles;
create policy "Own profile" on public.profiles for all to authenticated
using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
drop policy if exists "Own library" on public.user_libraries;
create policy "Own library" on public.user_libraries for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.user_libraries to authenticated;
revoke all on public.profiles, public.user_libraries from anon;

insert into storage.buckets(id,name,public,file_size_limit)
values ('heritage-media','heritage-media',false,104857600)
on conflict (id) do update set public=false,file_size_limit=104857600;
drop policy if exists "Read own media" on storage.objects;
drop policy if exists "Upload own media" on storage.objects;
drop policy if exists "Update own media" on storage.objects;
drop policy if exists "Delete own media" on storage.objects;
create policy "Read own media" on storage.objects for select to authenticated
using (bucket_id='heritage-media' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "Upload own media" on storage.objects for insert to authenticated
with check (bucket_id='heritage-media' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "Update own media" on storage.objects for update to authenticated
using (bucket_id='heritage-media' and (storage.foldername(name))[1]=(select auth.uid())::text)
with check (bucket_id='heritage-media' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "Delete own media" on storage.objects for delete to authenticated
using (bucket_id='heritage-media' and (storage.foldername(name))[1]=(select auth.uid())::text);

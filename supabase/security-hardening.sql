-- Owner-only migration. Run after schema.sql in Supabase SQL Editor.
-- No user rows are deleted. Validation applies to subsequent writes.
begin;
alter table public.profiles enable row level security;
alter table public.user_libraries enable row level security;
revoke all on public.profiles, public.user_libraries from anon;
revoke create on schema public from anon, authenticated;

create or replace function public.kaal_safe_url(value text, allow_local boolean default false)
returns boolean language sql immutable security invoker set search_path = '' as $$
 select value is not null and length(value)<=2048 and
 (value='' or value ~ '^https?://[^[:space:]<>]+$' or
 (allow_local and value ~ '^/heritage/[a-z0-9-]+[.]jpg$'));
$$;

create or replace function public.kaal_validate_profile()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
 if length(new.display_name)>100 or cardinality(new.saved_places)>500 or cardinality(new.visited_places)>500
 or exists(select 1 from unnest(new.saved_places||new.visited_places) id where id is null or id !~ '^[a-zA-Z0-9_-]{1,100}$')
 then raise exception 'Invalid profile data' using errcode='22023'; end if;
 new.updated_at=now();
 return new;
end;
$$;
drop trigger if exists kaal_profile_validation on public.profiles;
create trigger kaal_profile_validation before insert or update on public.profiles
for each row execute function public.kaal_validate_profile();

create or replace function public.kaal_validate_library()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare p jsonb; e jsonb; item jsonb; pair record; pid text; field text; ids text[]='{}';
begin
 if octet_length(new.content::text)>2097152 or jsonb_typeof(new.content) is distinct from 'object'
 or jsonb_typeof(new.content->'places') is distinct from 'array'
 or jsonb_typeof(new.content->'timelines') is distinct from 'object'
 or jsonb_typeof(new.content->'media') is distinct from 'object'
 then raise exception 'Invalid library data' using errcode='22023'; end if;
 if jsonb_array_length(new.content->'places') not between 1 and 100 then raise exception 'Invalid library size' using errcode='22023'; end if;
 for p in select value from jsonb_array_elements(new.content->'places') loop
  pid=p->>'id';
  if pid is null or pid !~ '^[a-zA-Z0-9_-]{1,100}$' or pid=any(ids) or coalesce(length(p->>'name'),0) not between 1 and 200
  then raise exception 'Invalid place data' using errcode='22023'; end if;
  ids=array_append(ids,pid);
  foreach field in array array['name','region','era','dynasty','image','alt','credit','imageSource','source','summary','history','damage'] loop
   if jsonb_typeof(p->field) is distinct from 'string' or length(p->>field)>20000 then raise exception 'Invalid place field' using errcode='22023'; end if;
  end loop;
  if not public.kaal_safe_url(p->>'image',true) or not public.kaal_safe_url(p->>'source') or not public.kaal_safe_url(p->>'imageSource') then raise exception 'Invalid source URL' using errcode='22023'; end if;
  if jsonb_typeof(new.content->'timelines'->pid) is distinct from 'array' then raise exception 'Missing timeline' using errcode='22023'; end if;
  if jsonb_array_length(new.content->'timelines'->pid)<>4 then raise exception 'Invalid timeline size' using errcode='22023'; end if;
  for e in select value from jsonb_array_elements(new.content->'timelines'->pid) loop
   if e->>'monument_id' is distinct from pid or coalesce(e->>'evidence_type','') not in ('documented','inferred','disputed')
   or coalesce(length(e->>'description'),0) not between 1 and 10000 or coalesce(length(e->>'year_range'),0) not between 1 and 200
   or not public.kaal_safe_url(e->>'source_url') then raise exception 'Invalid timeline event' using errcode='22023'; end if;
  end loop;
 end loop;
 for pair in select * from jsonb_each(new.content->'media') loop
  if not(pair.key=any(ids)) or jsonb_typeof(pair.value) is distinct from 'array' then raise exception 'Invalid media data' using errcode='22023'; end if;
  if jsonb_array_length(pair.value)>30 then raise exception 'Too many media files' using errcode='22023'; end if;
  for item in select value from jsonb_array_elements(pair.value) loop
   if coalesce(item->>'id','') !~ '^[a-zA-Z0-9_-]{1,100}$' or coalesce(item->>'type','') not in ('image','video','model') or coalesce(length(item->>'name'),0) not between 1 and 255
   then raise exception 'Invalid media item' using errcode='22023'; end if;
   if item ? 'storagePath' and item->>'storagePath' is distinct from new.user_id::text||'/'||pair.key||'/'||(item->>'id') then raise exception 'Invalid media ownership' using errcode='22023'; end if;
   if item ? 'url' and not public.kaal_safe_url(item->>'url') then raise exception 'Invalid media URL' using errcode='22023'; end if;
  end loop;
 end loop;
 new.updated_at=now();
 return new;
end;
$$;
drop trigger if exists kaal_library_validation on public.user_libraries;
create trigger kaal_library_validation before insert or update on public.user_libraries
for each row execute function public.kaal_validate_library();

update storage.buckets set public=false,file_size_limit=26214400,
 allowed_mime_types=array['image/jpeg','image/png','image/webp','video/mp4','video/webm','model/gltf-binary']
where id='heritage-media';
drop policy if exists "Upload own media" on storage.objects;
drop policy if exists "Update own media" on storage.objects;
create policy "Upload own media" on storage.objects for insert to authenticated
with check (bucket_id='heritage-media' and (storage.foldername(name))[1]=(select auth.uid())::text
 and name ~ '^[a-zA-Z0-9_-]+/[a-zA-Z0-9_-]+/[a-zA-Z0-9_-]+$');
create policy "Update own media" on storage.objects for update to authenticated
using (bucket_id='heritage-media' and (storage.foldername(name))[1]=(select auth.uid())::text)
with check (bucket_id='heritage-media' and (storage.foldername(name))[1]=(select auth.uid())::text
 and name ~ '^[a-zA-Z0-9_-]+/[a-zA-Z0-9_-]+/[a-zA-Z0-9_-]+$');
commit;

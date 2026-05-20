
-- Fix search_path on touch_updated_at + handle_new_user already had it; redefine to be safe
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Revoke EXECUTE on SECURITY DEFINER funcs from public/anon/authenticated; they're only used internally by RLS/triggers
revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;

-- Restrict avatar listing to authenticated users
drop policy if exists "Avatar images are publicly accessible" on storage.objects;

create policy "Authenticated users can view avatars"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'avatars');

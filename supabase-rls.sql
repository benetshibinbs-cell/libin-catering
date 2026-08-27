-- Security-hardened Supabase access policies for Libin Catering.
-- Run this only after the initial administrator has a confirmed Supabase Auth account.

begin;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
revoke all on table public.admin_users from anon, authenticated;
grant select on table public.admin_users to authenticated;

-- Seed the confirmed initial administrator. Add later admins directly with an
-- elevated database connection; never expose an admin-management UI to the public.
insert into public.admin_users (user_id)
select id from auth.users where email = 'admin@libincatering.com'
on conflict (user_id) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "Admin can read own membership" on public.admin_users;
create policy "Admin can read own membership"
on public.admin_users for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Allow reading categories" on public.categories;
drop policy if exists "Allow managing categories" on public.categories;
drop policy if exists "Allow reading menu items" on public.menu_items;
drop policy if exists "Allow managing menu items" on public.menu_items;
drop policy if exists "Allow reading events" on public.events;
drop policy if exists "Allow managing events" on public.events;
drop policy if exists "Allow inserting enquiries" on public.enquiries;
drop policy if exists "Allow reading enquiries" on public.enquiries;
drop policy if exists "Allow updating enquiries" on public.enquiries;
drop policy if exists "Allow deleting enquiries" on public.enquiries;
drop policy if exists "Allow reading gallery" on public.gallery;
drop policy if exists "Allow managing gallery" on public.gallery;
drop policy if exists "Allow reading contact information" on public.contact_information;
drop policy if exists "Allow managing contact information" on public.contact_information;
drop policy if exists "Allow reading services" on public.services;
drop policy if exists "Allow managing services" on public.services;
drop policy if exists "Allow reading hero_slides" on public.hero_slides;
drop policy if exists "Allow managing hero_slides" on public.hero_slides;
drop policy if exists "Allow reading site_settings" on public.site_settings;
drop policy if exists "Allow managing site_settings" on public.site_settings;

create policy "Public reads active categories" on public.categories for select to anon, authenticated using (is_active = true);
create policy "Admins manage categories" on public.categories for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Public reads available menu items" on public.menu_items for select to anon, authenticated using (is_available = true);
create policy "Admins manage menu items" on public.menu_items for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Public reads published events" on public.events for select to anon, authenticated using (is_published = true);
create policy "Admins manage events" on public.events for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Public submits enquiries" on public.enquiries for insert to anon, authenticated with check (true);
create policy "Admins read enquiries" on public.enquiries for select to authenticated using ((select public.is_admin()));
create policy "Admins update enquiries" on public.enquiries for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete enquiries" on public.enquiries for delete to authenticated using ((select public.is_admin()));
create policy "Public reads published gallery" on public.gallery for select to anon, authenticated using (is_published = true);
create policy "Admins manage gallery" on public.gallery for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Public reads contact information" on public.contact_information for select to anon, authenticated using (true);
create policy "Admins manage contact information" on public.contact_information for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Public reads active services" on public.services for select to anon, authenticated using (is_active = true);
create policy "Admins manage services" on public.services for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Public reads active hero slides" on public.hero_slides for select to anon, authenticated using (is_active = true);
create policy "Admins manage hero slides" on public.hero_slides for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Public reads site settings" on public.site_settings for select to anon, authenticated using (true);
create policy "Admins manage site settings" on public.site_settings for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "Public media access" on storage.objects;
drop policy if exists "Authenticated media upload" on storage.objects;
drop policy if exists "Authenticated media update" on storage.objects;
drop policy if exists "Authenticated media delete" on storage.objects;
drop policy if exists "Media bucket upload access" on storage.objects;
drop policy if exists "Media bucket update access" on storage.objects;
drop policy if exists "Media bucket delete access" on storage.objects;

create policy "Public reads media" on storage.objects for select to anon, authenticated using (bucket_id = 'media');
create policy "Admins upload media" on storage.objects for insert to authenticated with check (bucket_id = 'media' and (select public.is_admin()));
create policy "Admins update media" on storage.objects for update to authenticated using (bucket_id = 'media' and (select public.is_admin())) with check (bucket_id = 'media' and (select public.is_admin()));
create policy "Admins delete media" on storage.objects for delete to authenticated using (bucket_id = 'media' and (select public.is_admin()));

alter function public.rls_auto_enable() set search_path = pg_catalog;
revoke execute on function public.rls_auto_enable() from public;
alter function public.set_updated_at_column() set search_path = pg_catalog;

commit;
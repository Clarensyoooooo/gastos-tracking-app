-- Fix RLS for profiles to allow insert
create policy "Users can insert own profile"
on profiles for insert
with check ( auth.uid() = id );

-- Create avatars bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Allow public access to avatars
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Allow authenticated users to upload avatars
create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

-- Allow users to update their own avatars
create policy "Users can update own avatars"
  on storage.objects for update
  using ( auth.uid() = owner )
  with check ( bucket_id = 'avatars' );

-- Allow users to delete their own avatars
create policy "Users can delete own avatars"
  on storage.objects for delete
  using ( auth.uid() = owner and bucket_id = 'avatars' );

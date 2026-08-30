# My Memories

My Memories is a private memory library built for Supabase Auth and PostgreSQL Row Level Security. Each signed-in account has an isolated workspace: media, albums, and playlists are stored with the authenticated user's ID and the database only permits rows where `user_id = auth.uid()`.

## Local development

Copy `.env.example` to `.env`, keep the supplied Supabase URL, and set the publishable key from the Supabase project. Then run `pnpm install`, `pnpm dev`, and open the URL printed by Vite.

## Database security

Apply `supabase/migrations/202608310001_account_isolation.sql` to the Memories Supabase project. The migration enables RLS, adds per-user indexes, and creates select/insert/update/delete policies for `media`, `albums`, and `playlists`. Never place a Supabase service-role key in this frontend.

## Current source support

The first working release supports email/password authentication and direct image URLs. Google Photos, iCloud, and other providers can be added as source adapters later; their metadata should continue to be written with the authenticated user's ID and protected by the same RLS policies.

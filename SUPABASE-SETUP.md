# Owner setup: connect Kaal-Darshan to Supabase

Only the project owner needs a Supabase dashboard account. Visitors create ordinary
Kaal-Darshan accounts through the website. Do not invite visitors to your Supabase organization.

## 1. Create the project

Open https://supabase.com/dashboard and create a project in your organization.
Choose a nearby region and keep the database password private.

## 2. Create tables and storage rules

Open **SQL Editor**, create a new query, and run the contents of `supabase/schema.sql`.
The script creates `profiles`, `user_libraries` and a private `heritage-media` bucket.
It enables row-level security so one user cannot read or edit another user's records or files.
Run this script in a fresh project, or review the named tables/policies before applying to an existing project.

## 3. Provide two public values

In the project's **Connect** dialog or **Settings / API Keys**, locate:

- Project URL, such as `https://your-project.supabase.co`.
- Publishable key, normally starting with `sb_publishable_`, or the legacy `anon` key.

These are the only values Codex needs to connect the application.
The public key is intentionally available to the browser. It does not grant dashboard
or administrative access; authenticated database access is limited by the SQL policies.

Do not send the service-role key, `sb_secret_` key, database password, personal access token,
or your Supabase account password. Administrative keys bypass access rules.

Put the public values in `.env.local` at the project root, or provide them to Codex:

```dotenv
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_public_key
```

## 4. Configure authentication

Under **Authentication / URL Configuration**:

- Site URL: `http://localhost:5173`
- Allowed redirect: `http://localhost:5173/`
- Allowed redirect: `http://localhost:5173/login?recovery=1`

Enable Email authentication. Decide whether users must confirm their email.
For a public launch, configure your own email sender and replace localhost with your domain.

For Google login, enable **Google** under the authentication providers. Create a Google OAuth
web client in your own Google Cloud account, then put its client ID and client secret into the
Supabase provider settings only. Add the callback URL shown by Supabase to Google's authorized
redirect URIs. You do not need to give that secret to Codex or put it in this project.

Google setup: https://supabase.com/docs/guides/auth/social-login/auth-google

## 5. Restart and verify

Restart `start-local.cmd`, open http://localhost:5173/login and create a test account.
After confirming email if requested, sign in. The home overview should open.
Save a place, reload and confirm it remains saved. In your dashboard, inspect `profiles`.
Edit a place and upload a small image; inspect `user_libraries` and the private bucket.
Create a second test user and verify they cannot see the first user's saved places or uploads.
Sign out and confirm the site returns to the login page.

You retain owner access to the dashboard. Users never receive it.

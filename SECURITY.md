# Security status and owner actions

## Implemented in the application

- Only public Supabase publishable/anon keys are accepted by build configuration.
  Browser keys identify the project; they are not administrative secrets.
- `.env*` is ignored by Git (except `.env.example`) and denied over HTTP.
- Account API routes verify the bearer token using Supabase `getUser`, derive
  ownership from the verified user, and still operate under database RLS.
- No service-role key is used. No client-supplied user ID grants permission.
- Library and preferences APIs validate input with Zod and bound request size.
  Responses use generic errors. React renders user notes as escaped text.
- Database access uses Supabase's structured queries, not concatenated SQL.
- Upload API authenticates users, derives their object path, limits files to
  25 MB, identifies supported signatures and rejects SVG/HTML and GLB external
  resources. Signature checks are not malware scanning or complete media parsing.
- No application admin routes exist. `/admin` and `/api/admin` return 404.
  Manage places edits only the signed-in user's private collection.
- Same-origin API policy, CSP, frame restrictions, nosniff, referrer policy,
  permissions policy and HTTPS-only HSTS are configured. Third-party videos
  are confined to YouTube's privacy-enhanced iframe origin.
- Local mock authentication and development preview metadata are disabled.
  The localhost launcher binds to loopback, not the public network.

## Required in your Supabase owner dashboard

Run `supabase/security-hardening.sql` after `supabase/schema.sql`.
It adds database-side validation for direct API writes and restricts the private
storage bucket's MIME types, size and object paths. Code changes do not apply SQL
to your hosted project automatically. Back up and review existing data first.

Review all existing policies on `profiles`, `user_libraries` and `storage.objects`.
Permissive policies are OR-combined; an unrelated broad policy can undermine
ownership restrictions. Do not grant public or anonymous access to these tables.
Review older uploads created before this migration, particularly SVG/HTML files.

Keep email confirmation enabled. Configure Site URL `http://localhost:5173` and
allow the local confirmation/reset redirects documented in SUPABASE-SETUP.md.
Use your production domain instead when deploying publicly.

Supabase enforces authentication endpoint rate limits on its servers, including
direct SDK calls. Review Authentication > Rate Limits for token/sign-in, signup,
email and verification limits. Do not rely on browser cooldowns for protection.
Configure custom SMTP before public signups. If enabling CAPTCHA in Supabase,
integrate the CAPTCHA token into this app before enabling it for users.
Enable owner MFA and keep all admin credentials out of the app.

## Known boundaries

- Live two-account isolation and storage uploads require owner-created test users;
  mocked browser tests cannot prove live RLS deployment or user email confirmation.
- Authenticated users can call Supabase directly. RLS and database triggers are
  therefore required even though the application uses verified server routes.
- The upload API checks signatures, but a direct Supabase upload can bypass these
  application checks while still being subject to bucket size/MIME rules and RLS.
  Before accepting public/shared media, use a quarantined bucket, malware scanning
  and a deployed server-only upload service; do not claim full malware protection.
- Session tokens are stored by the Supabase browser SDK. There is no custom cookie
  session or service-role proxy. CSP still permits framework inline scripts/styles;
  moving to nonce-based scripts is a production hardening follow-up.
- The dev server is for localhost only. For production run a production build
  behind HTTPS, keep debug output private, disable source maps, restrict Google
  browser API keys by origin/API, and configure edge abuse limits/monitoring.
- No product can guarantee zero errors or absolute security. External auth,
  maps and videos depend on their providers and internet availability.

## Verification commands

`node scripts/security-database.test.mjs` runs both SQL scripts in a disposable
local PostgreSQL engine, including an idempotency check, two-user RLS, forged
ownership, malicious URLs and private storage policies. These tests passed;
they do not apply or verify the migration on your hosted Supabase project.

`node --experimental-strip-types scripts/security.test.mjs` checks malicious
inputs, forged user IDs, unauthenticated API access, cross-origin writes, headers
and private paths against localhost. It makes no account or data changes.

`node scripts/security-history.mjs` scans all reachable Git blobs for recognized
secret patterns and environment files, without printing matching values.
This is a heuristic scan, not proof that no unknown secret ever existed.

`node scripts/qa-supabase.cjs` exercises login, dashboard, cloud API mocks,
data-load recovery, photos, videos, globe and 3D views at desktop/mobile sizes.

References:
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/auth/rate-limits
- https://supabase.com/docs/guides/storage/uploads/file-limits

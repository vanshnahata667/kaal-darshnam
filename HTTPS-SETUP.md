# HTTPS Hosting

The hosted site uses a managed HTTPS certificate. Local development remains at
http://localhost:5173; localhost is only reachable on the computer running it.
Use the deployment URL for access from another device. Do not expose the Vite
development server to the public internet.

The existing Sites project is owner-private. Its sharing settings are separate
from Supabase login. Public visitor access requires deliberately changing the
site audience; it does not require sharing database administration access.

## Supabase Owner Configuration

After publication, open Supabase > Authentication > URL Configuration:

1. Set Site URL to the deployed HTTPS origin.
2. Add that origin and its `/login` and `/login?recovery=1` URLs to Redirect URLs.
3. Keep the localhost URLs while developing locally.
4. Test signup confirmation and password reset using your own email account.

Production `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` are configured in the
hosting environment, not committed environment files. Never use a service-role
key in the browser. Apply `supabase/security-hardening.sql` through the owner's
SQL editor if not already applied; local policy tests do not change the hosted
database.

The image gallery includes credited original-source and license links. Each
place has its overview and two additional views. The 3D models are illustrative
reconstructions, not measured scans. Verified 360-degree films remain pending.

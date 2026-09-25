# Firebase Hosting Without Blaze

The static React frontend is deployed to https://kaal-darshanam.web.app.
The existing HTTPS Sites backend still handles authenticated APIs, input
validation and uploads. Its hostname is visible in browser network requests,
but is not the frontend's address. Keep that backend running and public.
Supabase remains the account and private storage provider. Firestore supplies
only published editorial content. No Cloud Run, Functions or billing upgrade
is configured by these deployment commands. Hosting and database quotas apply.

## Deploy

From D:\INTEMPLE after Firebase CLI owner login:

```powershell
npm run build:firebase
npm run deploy:firebase
```

Deploy only Hosting. Do not run an unrestricted Firebase init/deploy, overwrite
Firestore rules or upload the project root. Only dist-firebase is published.
The original npm run build still builds the secure Sites backend. Changes to
shared code or APIs require deploying both targets.

## Supabase Owner Settings

Set Authentication > URL Configuration > Site URL to:
https://kaal-darshanam.web.app

Add these exact Redirect URLs and retain localhost entries for development:

- https://kaal-darshanam.web.app/
- https://kaal-darshanam.web.app/login
- https://kaal-darshanam.web.app/login?recovery=1

Use the web.app address as the primary address. Browser sessions from the old
hostname do not transfer: sign in again. This does not delete account data.
Apply and verify the existing Supabase RLS hardening separately; deployment
does not grant database admin access or modify hosted SQL policies.

The API permits CORS only for the two exact Firebase Hosting origins. It still
verifies Supabase bearer tokens server-side and never trusts frontend user IDs.

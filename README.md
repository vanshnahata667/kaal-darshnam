# Kaal Darshanam

Kaal Darshanam: a browser-based heritage explorer with login, sourced histories,
photographs, video embeds, timelines, an interactive globe and illustrative 3D.

## Local setup

Requires Node.js 22.13+ and npm. Run `npm ci`, then follow
[SUPABASE-SETUP.md](SUPABASE-SETUP.md). Put only the project URL and public key in
`.env.local`, using `.env.example` as a template. Run `npm run dev` or
`start-local.cmd` and open http://localhost:5173/login.

Login opens the home overview. Supabase stores each user's saved places,
explored places, private catalogue edits and uploaded media. Only the project
owner needs the Supabase dashboard. Apply `supabase/schema.sql` before testing.
No payments or membership checkout are included.

On Windows, double-click `start-local.cmd` whenever you need the site. It checks
for an existing server, installs missing dependencies, starts a hidden local
server and opens the login page. The server continues after the launcher closes.
After a reboot, run the launcher again. This is not an always-online deployment;
Supabase login, cloud data, map tiles and externally hosted media need internet.

Email confirmation is required by the connected Supabase project's current
settings. After signup, confirm your email and return to sign in. Use **Resend
confirmation email** if needed. Password-manager values are read from the form
on submission. Google sign-in is shown only when enabled in Supabase.

## Places and media

Four places only: Shanti Stupa in Leh, Konark Temple, ancient Nalanda,
and Kandariya Mahadev Temple in Khajuraho. Sources and photo licensing
links are attached to entries. Shanti Stupa is a modern living monument, not a ruin.
Videos are external publisher embeds; their availability is outside this app's control.
Third-party media retain their original licenses and are not relicensed by this repository.
The four curated photographs are included in `public/heritage` for reliable
local display. Their authors, original file pages and licenses remain in each
place's photo credits. `scripts/cache-heritage-images.mjs` restores missing copies.

## Limits

Three.js models are simplified educational interpretations, not measured scans.
The default Cesium globe uses OpenStreetMap. Photorealistic Google tiles require
the owner's restricted browser API key, enabled service and Google billing.
Coverage is provider-dependent. Image search opens Google Lens, not a local AI model.
The history guide uses curated answers, not a live LLM.

## Checks and GitHub

`npx tsc --noEmit` checks types; `npm run build` builds the app.
With the development server running and Microsoft Edge installed,
`node scripts/qa-supabase.cjs` runs browser checks with mocked Supabase responses.
These do not replace live authentication, storage and two-user RLS tests.

See [GITHUB-SETUP.md](GITHUB-SETUP.md) for publishing the source repository.
See [SECURITY.md](SECURITY.md) for security checks and the required owner-only
Supabase hardening migration.

## Kaal Darshanam updates

The product is now named Kaal Darshanam. Location search, map zoom/top-view
controls, clearer historical sections and improved schematic 3D materials are
included. These remain illustrative models, not photogrammetric scans.

Videos include an optional spherical player for your own equirectangular uploads.
Dedicated verified 360 videos for these monuments are not yet in this dataset.
Ordinary films remain labelled separately. Sources retain their rights.

Firestore can supply an optional published catalogue; Supabase remains the
private account database. Follow [FIREBASE-SETUP.md](FIREBASE-SETUP.md).
Firebase project configuration and hosted rules deployment are still required.

## Four-place editorial update

Historical sources now come from Odisha government and tourism, MP Tourism,
District Nalanda, PIB's ASI excavation reporting, and District Leh. No historical
citations or publisher films from UNESCO remain in the active catalogue.
Wikimedia photographs retain their original author and license credits.

All four places have procedural 3D models. Konark and Nalanda include clearly
hypothetical upper structures; Shanti Stupa and Kandariya remain standing across
timeline states. Models are not measured scans, and fine sculptural detail is
not reproduced as archaeological evidence.

Older saved collections are filtered to these four IDs. Old UNESCO-derived
editorial snapshots are replaced in the displayed collection. Existing remote
uploads are not permanently deleted; removed-site uploads are hidden. Optional
Firestore content cannot reintroduce other places. New-place creation is disabled
for this focused edition. Hosted Supabase hardening still requires owner action.

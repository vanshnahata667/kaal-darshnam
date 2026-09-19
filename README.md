# kaal-darshnam

Kaal-Darshan: a browser-based heritage explorer with login, sourced histories,
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

## Places and media

Eight places: Hampi, Konark, Sanchi, Shore Temple, Khajuraho, Modhera Sun Temple,
ancient Nalanda Mahavihara and Shanti Stupa in Leh. Sources and photo licensing
links are attached to entries. Shanti Stupa is a modern living monument, not a ruin.
Videos are external publisher embeds; their availability is outside this app's control.
Third-party media retain their original licenses and are not relicensed by this repository.

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

# Firestore and Supabase

Supabase remains the only account database: authentication, private libraries,
saved places and uploads stay behind Supabase RLS. Firestore is an optional
published editorial catalogue, not a second copy of account data or a backup.
Two databases do not inherently make an application more secure.

1. Create a Firebase project and a Cloud Firestore **Standard / Native mode**
   `(default)` database in production mode. Keep owner MFA enabled.
2. Review and publish `firestore.rules` in Firestore's Rules tab. These rules
   intentionally allow public GET of only `heritage_catalogue/current` when
   `published` is true. All client writes and other reads are denied. Review
   existing rules/data first; replacing rules can affect other apps.
3. Add `FIREBASE_PROJECT_ID=your-project-id` to ignored `.env.local` and restart
   localhost. No Firebase service-account key is needed or accepted by this feature.
4. As owner, create collection `heritage_catalogue`, document `current`, with
   `published` (boolean) and `contentJSON` (string). The string is a JSON object
   with `places`, `timelines`, and empty `media: {}`, matching `lib/validation.ts`.
   Use the seed entries in `app/heritage.ts` as the content format. Every place
   needs exactly four source-linked timeline events. Keep the document below
   Firestore's 1 MiB limit. Publish only content licensed for public sharing.
5. Sign in and inspect `/api/catalogue` using the app's authenticated request:
   status is `connected`, `not-configured`, or `unavailable`. Ordinary browser
   navigation without the bearer token returns 401. The existing local catalogue
   remains available if Firestore is missing or unavailable; private Supabase
   failures are not bypassed. Saved personal edits take precedence over published
   catalogue entries. The focused edition displays only Shanti Stupa, Konark,
   Nalanda and Kandariya Mahadev; other document entries are ignored. Old
   UNESCO-derived editorial snapshots fall back to the updated local sources.

**Public means public:** anyone can read that published Firestore document
directly. Never include user IDs, email, private notes, signed upload URLs or
credentials. Supabase tokens are never forwarded to Google. Firebase console
owner access is controlled by Google IAM, not these client rules.

Owner acceptance tests: published document GET succeeds; unpublished GET,
collection listing, arbitrary document reads and all client writes fail. These
rules still require deployment and Firebase-side testing; local mock tests do
not establish live security. Configure usage alerts and billing budgets.

References: https://firebase.google.com/docs/firestore/use-rest-api and
https://firebase.google.com/docs/firestore/security/rules-conditions

# DAJJAL ID — Darkwar Account Linking

## Accepted product decisions
- One DAJJAL ID website user may link multiple Darkwar game accounts.
- A game profile is not active until verified by a trusted authorization result.
- A single game identity (provider + player ID + server) can belong to only one website user at a time.
- Users may unlink their own game accounts.
- Darkwar credentials, raw authorization tokens, and passwords must never be exposed to the browser or stored in plaintext.

## Database
Migration: `202611250001_dajjal_id_game_account_linking.sql`

- `game_accounts`: canonical provider identity and verified profile fields.
- `user_game_accounts`: many game accounts per website user; one owner per game identity.
- `game_link_transactions`: short-lived, server-created authorization attempts. Only a hash of the state value is stored.

RLS permits users to read their own linked identities and delete their own link rows. Client-side insert/update is intentionally denied. A trusted server must verify the provider response before creating a game identity and link.

## Authentication protocol status
The Darkwar in-game approval experience has been observed by the project owner, and community services document account-linking flows. However, this repository does not yet contain an authorized Darkwar developer protocol, documented launch URL, callback contract, signature verification method, or partner credentials.

Therefore this implementation deliberately does **not** fabricate a Darkwar deep link, QR payload, callback, or verified identity. No user-entered Player ID can be marked verified.

## Required provider contract before enabling live linking
1. Written permission for third-party account linking.
2. Official launch/QR initiation format and supported Android/iOS behavior.
3. Callback or polling contract, including signed response validation.
4. Exact identity fields and permitted scopes.
5. Expiry, replay protection, revocation, and token-handling requirements.

Once the provider contract is obtained, implement server-only transaction creation, callback verification, and atomic linking. Keep any provider secret in Vercel server environment variables, never `NEXT_PUBLIC_*`.

## Security invariants
- The raw state is random and one-time; only its SHA-256 hash is stored.
- A transaction expires after five minutes by default.
- A callback must be authenticated and bound to the initiating website user.
- Only provider-confirmed identities can be inserted into `game_accounts`.
- A game identity cannot be linked to a second website user while linked.
- Never store game passwords. Store provider tokens only if the provider explicitly permits it, encrypted server-side, with least privilege and documented retention.

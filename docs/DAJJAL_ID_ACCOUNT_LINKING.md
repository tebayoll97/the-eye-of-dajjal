# DAJJAL ID — Darkwar Account Linking

## Accepted product decisions
- One DAJJAL ID website user may link multiple Darkwar game accounts.
- A game profile is not active until verified by a trusted authorization result.
- A single game identity (provider + player ID + server) can belong to only one website user at a time.
- Users may unlink their own game accounts.
- Darkwar credentials, raw authorization tokens, and passwords must never be exposed to the browser or stored in plaintext.

## Database
Migration: `20261125113053_dajjal_id_game_account_linking.sql`

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


## Public research findings (25 November 2026)

### Game publisher / official support route
- The Google Play listing for package `com.readygo.dark.gp` identifies **OMNILOJO PTE. LTD.** as the developer and lists `support@darkwar-survival.com` as the support email.
- The listing's developer response directs players to in-game **Profile → Settings → Customer Service** for support.
- The official Dark War Survival terms identify OMNILOJO PTE. LTD. as the contracting company. The terms grant a limited personal, non-transferable and non-sublicensable license and prohibit reverse engineering or circumventing security features. This makes written approval and a documented integration contract especially important before implementing a third-party authorization client.
- Official references:
  - Google Play listing: https://play.google.com/store/apps/details?id=com.readygo.dark.gp
  - Official terms: https://darkwar-survival.com/terms/en/tos.html
  - Official privacy policy: https://darkwar-survival.com/terms/en/privacy.html

### Observed third-party QR flow (not an official developer specification)
- Vantera publicly states that it uses the game's QR login and is not affiliated with or endorsed by the publisher.
- Dark War Rewards publicly documents a QR flow: a five-minute handshake window; in the game, open Avatar Frame → Settings → Scan QR code; scan the website QR and wait for confirmation. It also describes a one-phone tap-to-authorize path.
- These pages demonstrate that an in-game QR authorization experience exists in third-party products. They do **not** publish the underlying QR payload schema, API endpoints, cryptographic signature rules, callback/polling contract, scopes, token rules, or developer permission. Their flow must not be copied as if it were an official API.
- References:
  - Vantera player pages: https://vantera.app/features/player-pages
  - Vantera terms: https://vantera.app/terms
  - Dark War Rewards linking guide: https://www.darkwarrewards.com/help/link-account
  - Dark War Rewards link page: https://www.darkwarrewards.com/link-game

### Formal questions to send to OMNILOJO
1. Does OMNILOJO permit DAJJAL FAMILY / THE EYE OF DAJJAL to offer third-party Dark War account linking for player identity verification?
2. Is there an official partner API, OAuth-like flow, QR-login SDK, or documented deep-link authorization flow?
3. What are the exact QR payload format, initiation endpoint, callback or polling endpoint, and response-signature verification requirements?
4. Which immutable identity fields are returned (Player ID, state/server number, region, provider/account ID), and can one user authorize multiple game accounts?
5. What are the permitted data scopes, token lifetime, refresh/revocation behavior, rate limits, and retention requirements?
6. Is there a sandbox/test environment and a technical contact for integration review?

Until OMNILOJO confirms the integration and supplies the contract, keep live linking disabled. Do not reverse engineer the mobile app, extract session credentials, reuse third-party tokens, or ask players for passwords.

## Security invariants
- The raw state is random and one-time; only its SHA-256 hash is stored.
- A transaction expires after five minutes by default.
- A callback must be authenticated and bound to the initiating website user.
- Only provider-confirmed identities can be inserted into `game_accounts`.
- A game identity cannot be linked to a second website user while linked.
- Never store game passwords. Store provider tokens only if the provider explicitly permits it, encrypted server-side, with least privilege and documented retention.

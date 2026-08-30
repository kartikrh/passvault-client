# PassVault Client Panel

Customer-facing sign-up/sign-in panel for PassVault, built with Next.js (App
Router) and the visual language of the Upzet `Starterkit` theme
(`D:\Theam\Upzet_React_v1.3.0\Starterkit`). Talks to the existing
`PassVaultapi` backend (`/vault/auth/*`), not its own database.

## Running it

```
npm install
npm run dev      # http://localhost:3001 (webpack, not Turbopack -- see below)
```

Requires `PassVaultapi` running locally on the URL set in `.env.local`
(`NEXT_PUBLIC_API_BASE_URL`, defaults to `http://localhost:5896`).

## Why `--webpack`

This Next.js version (16.3.3) defaults `next dev`/`next build` to Turbopack,
which fails to compile the ported theme's Sass: Bootstrap 5.3's own
`_variables.scss` does `@import "variables-dark"` internally, and Turbopack's
Sass integration can't resolve that sibling file ("Can't find stylesheet to
import"), even though the same import works fine under webpack. `dev`/`build`
in `package.json` pass `--webpack` to route around it. Safe to drop once
that's fixed upstream -- try removing it and running `npm run build` first.

## Google sign-in / sign-up, and reCAPTCHA -- config comes from White Label

Neither is hardcoded here. `src/lib/whitelabel.js` calls the existing,
unauthenticated `POST /admin/whitelabel/all` and picks the entry whose
`domain` matches the page's own origin (falling back to whichever entry has
`isDefault: true`, then the first one). That's the same `tblWhitelabel` row
an operator edits in PassVaultpanel's **White Label** admin screen:

| White Label field | Used for |
|---|---|
| `isGoogleLogin` / `googleKey` | Shows/hides the Google button; `googleKey` is the OAuth client ID passed to `GoogleOAuthProvider` |
| `isRecatchEnable` / `recatchKey` | Shows/hides the reCAPTCHA widget on Login/Register; `recatchKey` is the site key |

If nothing is configured for the current origin, both features simply don't
render -- there's no separate `.env` toggle to keep in sync.

## What's live

The full email/password chain is implemented in PassVaultapi and wired up
end to end -- tested manually via curl (register → verifyEmail → setPassword
→ login, plus forgotPassword/resetPassword and the error paths: wrong
password, duplicate email, unverified email, Google-only account trying
password login).

| Page | Calls | Status |
|---|---|---|
| `/login` — Google button | `POST /vault/auth/google { idToken }` | **Live** |
| `/register` — Google button | same endpoint (find-or-create) | **Live** |
| `/register` — name+email | `POST /vault/auth/register` | **Live** -- sends a verification email via Mail Settings |
| `/verify-email?token=…` | `POST /vault/auth/verifyEmail`, then `POST /vault/auth/setPassword` (authenticated) | **Live** |
| `/login` — email/password | `POST /vault/auth/login` | **Live** |
| `/forgot-password` | `POST /vault/auth/forgotPassword` | **Live** -- always responds the same way whether or not the email exists |
| `/reset-password?token=…` | `POST /vault/auth/resetPassword` | **Live** |

Registration only collects name+email; no password exists until the client
clicks the emailed verification link and lands on `/verify-email`, which
shows the "Set Password" form. That same `POST /vault/auth/setPassword` also
works from an already-authenticated session generally, so it can double as a
self-service "add a password" action for a Google-only account later --
there's just no Settings page yet to expose that from.

**Still pending:** the Google button's own upgrade -- requesting Drive
consent in the same auth-code exchange, per the project plan -- so today's
button uses the plain ID-token flow against `POST /vault/auth/google`, which
doesn't yet request or store Drive access.

**Requires a default Mail Settings row** (PassVaultpanel → Mail Settings,
marked Active + Default) for the verification/reset emails to actually send
-- `sendMail()` throws if none exists. Set `VAULT_CLIENT_APP_URL` in
PassVaultapi's env (defaults used here: `http://localhost:3001`) so the
emailed links point at this app instead of nowhere.

## Structure

- `src/app/{login,register,forgot-password,verify-email,reset-password,dashboard}`
  -- pages (all Client Components; Bootstrap/reactstrap forms need the DOM)
- `src/lib/api.js` -- axios instance; unwraps PassVaultapi's
  `{success,status,result}` envelope, stores the client JWT in
  `localStorage` under `passvault.clientToken`, attaches it as
  `Authorization: Bearer …`
- `src/lib/whitelabel.js`, `useWhitelabel.js` -- White Label config fetch +
  hook
- `src/assets/scss` -- ported as-is from the theme; `theme.scss` is imported
  once, globally, in `src/app/layout.js`

`/dashboard` is a placeholder that just proves the token round-trip works --
the real post-login vault UI is a separate design pass.

// How long a signed-in client can go without mouse/keyboard/touch/scroll
// activity before useIdleLogout signs them out -- set via
// NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES in .env.local (must be NEXT_PUBLIC_-
// prefixed for Next.js to expose it to the browser bundle; read at build
// time, not runtime). Falls back to 15 minutes if unset or invalid.
const DEFAULT_IDLE_TIMEOUT_MINUTES = 15;

const parsedMinutes = Number(process.env.NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES);
export const IDLE_TIMEOUT_MINUTES = parsedMinutes > 0 ? parsedMinutes : DEFAULT_IDLE_TIMEOUT_MINUTES;
export const IDLE_TIMEOUT_MS = IDLE_TIMEOUT_MINUTES * 60 * 1000;

// Simple, dependency-free strength check -- length plus how many of the
// four character classes are present. Good enough for a client-side
// "is this reasonable" gate; PassVaultapi still only enforces the 8-char
// minimum server-side (see MIN_PASSWORD_LENGTH in services/vaultAuth.js),
// so this is advisory/UX, not the actual security boundary.
const CLASS_PATTERNS = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/];

export const STRENGTH = {
  TOO_SHORT: "too_short",
  WEAK: "weak",
  MEDIUM: "medium",
  STRONG: "strong",
};

export const STRENGTH_LABEL = {
  [STRENGTH.TOO_SHORT]: "Too short",
  [STRENGTH.WEAK]: "Weak",
  [STRENGTH.MEDIUM]: "Medium",
  [STRENGTH.STRONG]: "Strong",
};

export function getPasswordStrength(password) {
  if (!password || password.length < 8) return STRENGTH.TOO_SHORT;

  const classCount = CLASS_PATTERNS.filter((pattern) => pattern.test(password)).length;
  const isLong = password.length >= 12;

  if (classCount >= 3 && isLong) return STRENGTH.STRONG;
  if (classCount >= 3 || (classCount >= 2 && isLong)) return STRENGTH.MEDIUM;
  return STRENGTH.WEAK;
}

export const isPasswordStrongEnough = (password) => getPasswordStrength(password) === STRENGTH.STRONG;

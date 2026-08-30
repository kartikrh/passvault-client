"use client";

import { getPasswordStrength, STRENGTH, STRENGTH_LABEL } from "@/utils/passwordStrength";

const STEP_COLOR = {
  [STRENGTH.TOO_SHORT]: "#dc3545",
  [STRENGTH.WEAK]: "#dc3545",
  [STRENGTH.MEDIUM]: "#fd7e14",
  [STRENGTH.STRONG]: "#198754",
};

const STEP_COUNT = {
  [STRENGTH.TOO_SHORT]: 1,
  [STRENGTH.WEAK]: 1,
  [STRENGTH.MEDIUM]: 2,
  [STRENGTH.STRONG]: 3,
};

export default function PasswordStrengthMeter({ password }) {
  if (!password) return null;

  const strength = getPasswordStrength(password);
  const color = STEP_COLOR[strength];
  const filled = STEP_COUNT[strength];

  return (
    <div className="mt-1">
      <div className="d-flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              height: 4,
              flex: 1,
              borderRadius: 2,
              backgroundColor: i < filled ? color : "#e9ecef",
            }}
          />
        ))}
      </div>
      <div className="form-text mt-1" style={{ color }}>
        {STRENGTH_LABEL[strength]}
        {strength !== STRENGTH.STRONG
          ? " -- use 12+ characters with a mix of upper/lowercase, numbers, and symbols"
          : ""}
      </div>
    </div>
  );
}

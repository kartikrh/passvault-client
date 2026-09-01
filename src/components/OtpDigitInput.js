"use client";

import { useRef } from "react";

// Controlled N-digit code entry: auto-advances focus as you type, handles
// backspace/arrow-key navigation and paste-spreading across boxes, and
// fires onComplete(code) the instant every box has a digit (via the last
// box's keyup, or immediately on a completing paste) -- so a full code
// never has to wait on a separate manual submit. Shared by
// TwoFactorChallenge (login/enrollment) and StepUpOtpPrompt (re-verify an
// already-signed-in session) -- both just supply what happens with the
// completed code.
export default function OtpDigitInput({ length = 6, digits, onDigitsChange, disabled, onComplete }) {
  const inputRefs = useRef([]);

  const setDigitAt = (index, value) => {
    const next = [...digits];
    next[index] = value;
    onDigitsChange(next);
  };

  const handleChange = (index, rawValue) => {
    const value = rawValue.replace(/\D/g, "");
    if (!value) {
      setDigitAt(index, "");
      return;
    }
    // Handles a paste/autofill landing in one box by spreading every digit
    // across the remaining boxes from here, not just the first character.
    const chars = value.split("");
    const next = [...digits];
    chars.forEach((char, offset) => {
      if (index + offset < length) next[index + offset] = char;
    });
    onDigitsChange(next);
    const nextIndex = Math.min(index + chars.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
    // A paste can fill every box in one go, well past the single-digit
    // typing path handleKeyUp watches -- complete immediately instead of
    // waiting on a keyup event that may not land on the right box.
    if (chars.length > 1 && next.every((digit) => digit !== "") && !disabled) {
      onComplete(next.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setDigitAt(index - 1, "");
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Auto-completes the moment the last box is filled, so a full code never
  // has to wait on a manual submit click.
  const handleKeyUp = (index, e) => {
    if (disabled) return;
    if (index !== length - 1) return;
    if (e.key === "Backspace" || e.key === "Delete") return;
    const next = [...digits];
    next[index] = e.target.value.replace(/\D/g, "").slice(-1) || next[index];
    if (next.every((digit) => digit !== "")) {
      onComplete(next.join(""));
    }
  };

  return (
    <div className="d-flex justify-content-center gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={index === 0 ? length : 1}
          className="form-control text-center fw-semibold fs-4 rounded-3"
          style={{ width: 48, height: 56 }}
          value={digit}
          disabled={disabled}
          autoFocus={index === 0}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onKeyUp={(e) => handleKeyUp(index, e)}
          aria-label={`Digit ${index + 1} of ${length}`}
        />
      ))}
    </div>
  );
}

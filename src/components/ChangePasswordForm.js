"use client";

import { useState } from "react";
import { Alert, FormGroup, Input, Label } from "reactstrap";
import { changePassword, setPassword } from "@/lib/profile";
import { isPasswordStrongEnough } from "@/utils/passwordStrength";
import PasswordStrengthMeter from "@/components/PasswordStrengthMeter";

// hasPassword picks the endpoint: a Google-only account with no password
// yet has nothing to verify against, so it goes through PassVaultapi's
// setPassword instead of changePassword (which requires the current one).
export default function ChangePasswordForm({ hasPassword, onChanged }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // The 8-char minimum is PassVaultapi's actual enforced floor
    // (services/vaultAuth.js); requiring "strong" here is a stricter,
    // client-side-only bar so people don't casually set a weak-but-valid one.
    if (!isPasswordStrongEnough(newPassword)) {
      setError("Please choose a stronger password (see the strength meter below).");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setIsSaving(true);
    try {
      if (hasPassword) {
        await changePassword({ currentPassword, newPassword });
      } else {
        await setPassword({ newPassword });
      }
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onChanged?.();
    } catch (err) {
      setError(err?.message || "Could not save your password. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error ? <Alert color="danger" className="py-2 px-3">{error}</Alert> : null}
      {success ? <Alert color="success" className="py-2 px-3">Password saved.</Alert> : null}

      {hasPassword ? (
        <FormGroup>
          <Label className="form-label">Current password</Label>
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </FormGroup>
      ) : (
        <p className="text-muted small">
          Your account signs in with Google and has no password yet -- set one below to also allow email/password sign-in.
        </p>
      )}

      <FormGroup>
        <Label className="form-label">New password</Label>
        <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        <PasswordStrengthMeter password={newPassword} />
      </FormGroup>

      <FormGroup>
        <Label className="form-label">Confirm new password</Label>
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </FormGroup>

      <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving}>
        {isSaving ? "Saving..." : hasPassword ? "Change password" : "Set password"}
      </button>
    </form>
  );
}

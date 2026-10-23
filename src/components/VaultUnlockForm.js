"use client";

import { useState } from "react";
import { Alert, Card, CardBody, FormGroup, Label } from "reactstrap";
import PasswordInput from "@/components/PasswordInput";
import CrystalIcon from "@/components/CrystalIcon";

// Shown by the vault pages while useVault reports vaultLocked: the vault key
// only ever exists in this tab's memory (see lib/vaultKey.js), so each new
// tab / reload asks for the vault password once.
export default function VaultUnlockForm({ onUnlock }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [unlocking, setUnlocking] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setUnlocking(true);
    try {
      await onUnlock(password);
      setPassword("");
    } catch (err) {
      setError(err?.message || "Could not unlock your vault.");
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <Card className="mb-3" style={{ maxWidth: 480 }}>
      <CardBody className="p-4">
        <div className="d-flex align-items-center gap-3 mb-2">
          <CrystalIcon icon="bx-lock-alt" size={48} />
          <h5 className="mb-0">Unlock your vault</h5>
        </div>
        <p className="text-muted small">
          Enter your vault password. It never leaves this device -- PassVault can&apos;t see it or reset it.
        </p>

        {error ? (
          <Alert color="danger" className="py-2 px-3">
            {error}
          </Alert>
        ) : null}

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label className="form-label">Vault password</Label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              autoFocus
              required
            />
          </FormGroup>
          <button type="submit" className="btn btn-primary btn-sm" disabled={unlocking || !password}>
            {unlocking ? "Unlocking..." : "Unlock"}
          </button>
        </form>
      </CardBody>
    </Card>
  );
}

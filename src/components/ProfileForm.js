"use client";

import { useState } from "react";
import { Alert, FormGroup, Input, Label } from "reactstrap";
import { updateProfile } from "@/lib/profile";

// Username uniqueness (case-insensitive, across every client -- see
// sql/vault/003_client_username.sql's index on tblClient) is enforced
// server-side; this form just surfaces whatever PUT /vault/auth/profile
// says, success or the "already taken" error. Once a username is set it's
// permanent -- PassVaultapi's updateProfileService rejects any further
// change to it -- so the input is disabled here the moment client.username
// is non-null, rather than letting someone type a new value and only
// discover it's locked after submitting.
export default function ProfileForm({ client, onUpdated }) {
  const [name, setName] = useState(client?.name || "");
  const [username, setUsername] = useState(client?.username || "");
  const [mobileNo, setMobileNo] = useState(client?.mobileNo || "");
  const [address, setAddress] = useState(client?.address || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const usernameLocked = !!client?.username;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSaving(true);
    try {
      const updatedClient = await updateProfile({ name, username, mobileNo, address });
      onUpdated?.(updatedClient);
      setSuccess(true);
    } catch (err) {
      setError(err?.message || "Could not update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error ? <Alert color="danger" className="py-2 px-3">{error}</Alert> : null}
      {success ? <Alert color="success" className="py-2 px-3">Profile updated.</Alert> : null}

      <FormGroup>
        <Label className="form-label">Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          disabled={usernameLocked}
        />
      </FormGroup>

      <FormGroup>
        <Label className="form-label">Username</Label>
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Choose a unique username"
          disabled={usernameLocked}
        />
        <div className="form-text">
          {usernameLocked
            ? "Your username is permanent and can't be changed."
            : "3-30 characters -- letters, numbers, underscores, and periods only. Must be unique. Can only be set once."}
        </div>
      </FormGroup>

      <FormGroup>
        <Label className="form-label">Mobile number</Label>
        <Input
          value={mobileNo}
          onChange={(e) => setMobileNo(e.target.value)}
          placeholder="e.g. +1 555 123 4567"
        />
      </FormGroup>

      <FormGroup>
        <Label className="form-label">Address</Label>
        <Input
          type="textarea"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Street, city, state, country"
        />
      </FormGroup>

      <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}

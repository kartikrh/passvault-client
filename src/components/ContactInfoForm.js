"use client";

import { useState } from "react";
import { Alert, FormGroup, Input, Label } from "reactstrap";
import { updateProfile } from "@/lib/profile";

// Mobile number + Address, split out from ProfileForm into their own card
// (see profile/page.js) with their own independent save -- unlike Name/
// Username, these are plain optional contact details with no uniqueness or
// permanence rules, so there's no reason a change here should touch the
// username form's state or be blocked by it.
export default function ContactInfoForm({ client, onUpdated }) {
  const [mobileNo, setMobileNo] = useState(client?.mobileNo || "");
  const [address, setAddress] = useState(client?.address || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSaving(true);
    try {
      const updatedClient = await updateProfile({ mobileNo, address });
      onUpdated?.(updatedClient);
      setSuccess(true);
    } catch (err) {
      setError(err?.message || "Could not update contact info. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error ? <Alert color="danger" className="py-2 px-3">{error}</Alert> : null}
      {success ? <Alert color="success" className="py-2 px-3">Contact info updated.</Alert> : null}

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

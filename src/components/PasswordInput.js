"use client";

import { useState } from "react";
import { Input } from "reactstrap";

// Controlled password input with a visibility toggle -- masked (type=
// "password") by default, same as this app's Login/VaultKeySetup/
// ChangePasswordForm password fields already are. Shared by
// AddAccountForm/EditAccountForm, which previously rendered a plain
// text Input for the password field (no type set), showing it in
// plaintext while typing.
export default function PasswordInput({ value, onChange, ...inputProps }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="d-flex align-items-center gap-2">
      <Input type={visible ? "text" : "password"} value={value} onChange={onChange} {...inputProps} />
      <button
        type="button"
        className="btn btn-light btn-sm border flex-shrink-0"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        <i className={`bx ${visible ? "bx-hide" : "bx-show"}`} />
      </button>
    </div>
  );
}

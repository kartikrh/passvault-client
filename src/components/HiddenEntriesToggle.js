"use client";

import { useState } from "react";
import StepUpGateModal from "@/components/StepUpGateModal";

// Icon-only control for entries saved with Hide=true (see
// AddAccountForm/AddNoteForm/EditAccountForm/NoteCard) -- lives in the page
// header, right after the Add button, rather than as a labeled button below
// the list. Renders nothing when there's nothing hidden to reveal.
// revealed: whether hidden entries are currently shown (state lives in the
// caller, since the caller's own entries list already has the .hidden
// flags -- see accounts/page.js and notes/page.js). Showing them requires a
// fresh 2FA code through the same step-up gate RevealAccountModal uses.
export default function HiddenEntriesToggle({ count, revealed, otpEnabled, onReveal, onHideAgain, label = "items" }) {
  const [verifying, setVerifying] = useState(false);

  if (!count) return null;

  return (
    <>
      <button
        type="button"
        className="btn btn-light btn-sm border"
        onClick={() => (revealed ? onHideAgain() : setVerifying(true))}
        aria-label={revealed ? `Hide hidden ${label} again` : `Show ${count} hidden ${label}`}
        title={revealed ? `Hide hidden ${label} again` : `Show ${count} hidden ${label}`}
      >
        <i className={`bx ${revealed ? "bx-hide" : "bx-show"}`} />
      </button>

      {verifying ? (
        <StepUpGateModal
          description={`Enter your authenticator code to show your hidden ${label}.`}
          otpEnabled={otpEnabled}
          onVerified={() => {
            setVerifying(false);
            onReveal();
          }}
          onCancel={() => setVerifying(false)}
        />
      ) : null}
    </>
  );
}

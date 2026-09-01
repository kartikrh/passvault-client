"use client";

import { useEffect, useState } from "react";
import { Modal, ModalBody, Badge } from "reactstrap";
import StepUpOtpPrompt from "@/components/StepUpOtpPrompt";
import CopyButton from "@/components/CopyButton";
import { formatActivityDate } from "@/lib/activity";

const DEFAULT_POPUP_INTERVAL_SECONDS = 10;

// Password stays masked even after the 2FA step-up succeeds -- reaching
// this modal already proved it's you, but showing the plaintext still
// takes one more deliberate click (matches how AccountTableRow's old
// inline eye toggle behaved before the reveal flow existed). Copy always
// copies the real value regardless of whether it's currently shown.
function PasswordRow({ password }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="d-flex align-items-center gap-2">
      <code className="small">{visible ? password : "••••••••"}</code>
      <button
        type="button"
        className="btn btn-light btn-sm border"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        <i className={`bx ${visible ? "bx-hide" : "bx-show"}`} />
      </button>
      <CopyButton value={password} label="password" />
    </div>
  );
}

// Two-phase: phase 1 re-verifies a fresh 2FA code (StepUpOtpPrompt, backed
// by POST /vault/auth/2fa/verify); phase 2 shows the entry's sensitive
// fields -- already sitting decrypted in this page's own state (see
// useVault) since the whole vault is one client-decrypted blob, there's no
// separate "detail" endpoint to call -- for a countdown before auto-
// closing. popupIntervalSeconds comes from the caller's own profile fetch
// (client.popupIntervalSeconds, server-configured via tblConfigs key
// CLIENTACCOUNTMODELPOPUPINTERVAL -- see getProfileService) rather than
// this component fetching it itself, since a fresh GET on every eye-icon
// click was the whole problem being fixed here.
export default function RevealAccountModal({
  entry,
  otpEnabled = true,
  onClose,
  popupIntervalSeconds = DEFAULT_POPUP_INTERVAL_SECONDS,
}) {
  const [verified, setVerified] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [lastViewedAt, setLastViewedAt] = useState(null);

  // Seeded directly from the verification event itself, not synced via a
  // separate effect keyed off `verified` -- there's nothing external to
  // subscribe to here, just a value to set the moment the user verifies.
  // result.lastViewedAt (see StepUpOtpPrompt/verifyStepUpOtpService) is
  // when this same entry was last revealed *before* now, if ever.
  const handleVerified = (result) => {
    setVerified(true);
    setSecondsLeft(popupIntervalSeconds);
    setLastViewedAt(result?.lastViewedAt || null);
  };

  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      onClose();
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, onClose]);

  return (
    <Modal isOpen backdrop="static" toggle={onClose} centered>
      <ModalBody className="p-4">
        {!verified ? (
          <StepUpOtpPrompt
            description="Enter your authenticator code to view this account's details."
            entryId={entry.id}
            otpEnabled={otpEnabled}
            onVerified={handleVerified}
            onCancel={onClose}
          />
        ) : (
          <div>
            <div className="d-flex justify-content-between align-items-start mb-3 gap-2">
              <h5 className="mb-0">{entry.title}</h5>
              {secondsLeft !== null ? (
                <Badge color="light" className="text-dark border flex-shrink-0">
                  Closing in {secondsLeft}s
                </Badge>
              ) : null}
            </div>

            <div className="d-flex flex-wrap gap-3 mb-3 small text-muted">
              {entry.createdAt ? <span>Created {formatActivityDate(entry.createdAt)}</span> : null}
              {entry.updatedAt ? <span>Updated {formatActivityDate(entry.updatedAt)}</span> : null}
              <span>{lastViewedAt ? `Password last viewed ${formatActivityDate(lastViewedAt)}` : "Password not viewed before"}</span>
            </div>

            <dl className="mb-0">
              <dt className="small text-muted">Username</dt>
              <dd className="d-flex align-items-center gap-2">
                <span>{entry.username || "—"}</span>
                {entry.username ? <CopyButton value={entry.username} label="username" /> : null}
              </dd>

              <dt className="small text-muted">Password</dt>
              <dd>
                <PasswordRow password={entry.password} />
              </dd>

              {entry.url ? (
                <>
                  <dt className="small text-muted">Website</dt>
                  <dd className="text-break">
                    {/* noopener/noreferrer: opening a saved third-party URL
                        shouldn't hand it a handle back to this window. */}
                    <a href={entry.url} target="_blank" rel="noopener noreferrer">
                      {entry.url}
                    </a>
                  </dd>
                </>
              ) : null}

              {entry.securityQuestions?.length ? (
                <>
                  <dt className="small text-muted">Security questions</dt>
                  <dd>
                    {entry.securityQuestions.map((q, index) => (
                      <div key={index} className="mb-2">
                        <div className="small text-muted">{q.question}</div>
                        <div>{q.answer}</div>
                      </div>
                    ))}
                  </dd>
                </>
              ) : null}
            </dl>

            <div className="d-grid mt-3">
              <button type="button" className="btn btn-light btn-sm border" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        )}
      </ModalBody>
    </Modal>
  );
}

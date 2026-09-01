"use client";

import { Modal, ModalBody } from "reactstrap";
import StepUpOtpPrompt from "@/components/StepUpOtpPrompt";

// Thin modal wrapper around StepUpOtpPrompt for actions that just need a
// pass/fail gate (e.g. editing an account) -- no entryId, so no
// ACCOUNT_PASSWORD_VIEWED log fires (that's specifically for the reveal
// flow, see RevealAccountModal); the edit itself is already logged
// separately as ACCOUNT_UPDATED once it's saved (putVaultDataService).
//
// otpEnabled: forwarded to StepUpOtpPrompt -- see its own comment. Default
// true so an accidental missing prop fails safe (still asks) rather than
// silently skipping 2FA for every caller that forgets to pass it.
export default function StepUpGateModal({ description, otpEnabled = true, onVerified, onCancel }) {
  return (
    <Modal isOpen backdrop="static" toggle={onCancel} centered>
      <ModalBody className="p-4">
        <StepUpOtpPrompt description={description} otpEnabled={otpEnabled} onVerified={onVerified} onCancel={onCancel} />
      </ModalBody>
    </Modal>
  );
}

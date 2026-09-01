"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Alert, FormGroup, Label, Input, Modal, ModalHeader, ModalBody } from "reactstrap";
import axiosInstance, { setStoredToken } from "@/lib/api";
import OtpDigitInput from "@/components/OtpDigitInput";

const CODE_LENGTH = 6;
const EMPTY_DIGITS = Array(CODE_LENGTH).fill("");

// Profile > danger zone. Both actions require a fresh Google Authenticator
// code -- verified inline by the endpoint itself (PassVaultapi's
// suspendAccountService/deleteAccountService), not a separate "verify then
// act" round trip (there's no proof token to carry between the two): typing
// the completed code straight into OtpDigitInput here IS the action.
//
// otpEnabled: the client's own client.otpEnabled (WrOTPEnable) -- when
// false there's no code to check (verifyOwnTotpCode on the backend skips
// its own check the same way), so Continue skips straight to submitSuspend/
// submitDelete with no code instead of opening the OTP-entry modal at all.
//
// mode: null | "confirmSuspend" | "otpSuspend" | "confirmDelete" | "otpDelete"
export default function AccountDangerZone({ otpEnabled = true }) {
  const router = useRouter();
  const [mode, setMode] = useState(null);
  const [reason, setReason] = useState("");
  const [digits, setDigits] = useState(EMPTY_DIGITS);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeAll = () => {
    setMode(null);
    setDigits(EMPTY_DIGITS);
    setErrorMessage(null);
  };

  const submitSuspend = async (code) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await axiosInstance.post("/vault/auth/suspendAccount", { code });
      setStoredToken(null);
      router.push("/login?reason=suspended");
    } catch (err) {
      setErrorMessage(err?.message || "Could not suspend your account. Please try again.");
      setDigits(EMPTY_DIGITS);
      setIsSubmitting(false);
    }
  };

  const submitDelete = async (code) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await axiosInstance.post("/vault/auth/deleteAccount", { code, reason });
      setStoredToken(null);
      router.push("/login?reason=deleted");
    } catch (err) {
      setErrorMessage(err?.message || "Could not delete your account. Please try again.");
      setDigits(EMPTY_DIGITS);
      setIsSubmitting(false);
    }
  };

  const handleOtpComplete = (code) => {
    if (mode === "otpSuspend") submitSuspend(code);
    else if (mode === "otpDelete") submitDelete(code);
  };

  return (
    <>
      <div className="d-flex flex-wrap gap-2">
        <Button color="warning" outline onClick={() => setMode("confirmSuspend")}>
          Suspend Account
        </Button>
        <Button color="danger" outline onClick={() => setMode("confirmDelete")}>
          Delete Account
        </Button>
      </div>

      <Modal isOpen={mode === "confirmSuspend"} toggle={closeAll} centered>
        <ModalHeader toggle={closeAll}>Suspend your account?</ModalHeader>
        <ModalBody>
          {/* Only reachable here when otpEnabled is false -- submitSuspend
              is called directly from Continue below with no OTP modal in
              between, so this is the only place its error would show. */}
          {errorMessage ? <Alert color="danger">{errorMessage}</Alert> : null}
          <p className="mb-4">
            Your account will be paused immediately and you&apos;ll be signed out. Simply signing back
            in again, any time, automatically reactivates it -- there&apos;s nothing else to do.
          </p>
          <div className="d-flex justify-content-end gap-2">
            <Button color="light" onClick={closeAll}>
              Cancel
            </Button>
            <Button
              color="warning"
              disabled={isSubmitting}
              onClick={() => (otpEnabled ? setMode("otpSuspend") : submitSuspend(null))}
            >
              {isSubmitting ? "Suspending..." : "Continue"}
            </Button>
          </div>
        </ModalBody>
      </Modal>

      <Modal isOpen={mode === "otpSuspend"} toggle={closeAll} centered>
        <ModalHeader toggle={closeAll}>Confirm with your authenticator app</ModalHeader>
        <ModalBody>
          <p className="text-muted small mb-3">Enter the 6-digit code to suspend your account.</p>
          {errorMessage ? <Alert color="danger">{errorMessage}</Alert> : null}
          <div className="d-flex justify-content-center mb-2">
            <OtpDigitInput
              digits={digits}
              onDigitsChange={setDigits}
              disabled={isSubmitting}
              onComplete={handleOtpComplete}
            />
          </div>
        </ModalBody>
      </Modal>

      <Modal isOpen={mode === "confirmDelete"} toggle={closeAll} centered>
        <ModalHeader toggle={closeAll}>Delete your account?</ModalHeader>
        <ModalBody>
          {/* Only reachable here when otpEnabled is false -- submitDelete is
              called directly from Continue below with no OTP modal in
              between, so this is the only place its error would show. */}
          {errorMessage ? <Alert color="danger">{errorMessage}</Alert> : null}
          <Alert color="danger" className="py-2 px-3">
            This permanently deletes your saved accounts and notes -- both files are removed from
            your Google Drive too -- and cannot be undone.
          </Alert>
          <FormGroup>
            <Label>Please tell us why you&apos;re deleting your account</Label>
            <Input
              type="textarea"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Optional, but it helps us improve"
            />
          </FormGroup>
          <div className="d-flex justify-content-end gap-2">
            <Button color="light" onClick={closeAll}>
              Cancel
            </Button>
            <Button
              color="danger"
              disabled={!reason.trim() || isSubmitting}
              onClick={() => (otpEnabled ? setMode("otpDelete") : submitDelete(null))}
            >
              {isSubmitting ? "Deleting..." : "Continue"}
            </Button>
          </div>
        </ModalBody>
      </Modal>

      <Modal isOpen={mode === "otpDelete"} toggle={closeAll} centered>
        <ModalHeader toggle={closeAll}>Confirm with your authenticator app</ModalHeader>
        <ModalBody>
          <p className="text-muted small mb-3">Enter the 6-digit code to permanently delete your account.</p>
          {errorMessage ? <Alert color="danger">{errorMessage}</Alert> : null}
          <div className="d-flex justify-content-center mb-2">
            <OtpDigitInput
              digits={digits}
              onDigitsChange={setDigits}
              disabled={isSubmitting}
              onComplete={handleOtpComplete}
            />
          </div>
        </ModalBody>
      </Modal>
    </>
  );
}

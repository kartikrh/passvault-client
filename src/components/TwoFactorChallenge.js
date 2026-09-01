"use client";

import { useState } from "react";
import { Alert, Form } from "reactstrap";
import axiosInstance from "@/lib/api";
import { OTPType } from "@/lib/otpConstants";
import OtpDigitInput from "@/components/OtpDigitInput";

const CODE_LENGTH = 6;
const EMPTY_DIGITS = Array(CODE_LENGTH).fill("");

// Shared "enter your Google Authenticator / emailed code" step, used both
// mid-login (LoginForm, when POST /vault/auth/login or /google responds
// with otpRequired instead of a token) and for first-time enrollment right
// after set-password (verify-email/page.js). Both callers already have the
// pendingToken and (for a brand-new Google Authenticator secret) the QR
// code from their own POST -- this component's only job is to collect the
// 6-digit code and confirm it against POST /vault/auth/verifyOtp.
export default function TwoFactorChallenge({ pendingToken, qrCode, otpType, onVerified, onCancel }) {
  const [digits, setDigits] = useState(EMPTY_DIGITS);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isComplete = digits.every((digit) => digit !== "");

  const verify = async (submittedCode) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const { result } = await axiosInstance.post("/vault/auth/verifyOtp", { pendingToken, code: submittedCode });
      onVerified(result.client);
    } catch (err) {
      setErrorMessage(err?.message || "Invalid or expired code. Please try again.");
      setDigits(EMPTY_DIGITS);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isComplete) {
      setErrorMessage("Please enter the 6-digit code");
      return;
    }
    await verify(digits.join(""));
  };

  return (
    <>
      <h4 className="font-size-18 text-muted mt-2 text-center">Two-factor authentication</h4>
      <p className="mb-4 text-center">
        {qrCode
          ? "Scan this QR code with Google Authenticator, then enter the 6-digit code below."
          : otpType === OTPType.MAIL
            ? "Enter the code we emailed you."
            : "Enter the 6-digit code from your authenticator app."}
      </p>

      {qrCode ? (
        <div className="text-center mb-4">
          <img src={qrCode} alt="Scan with Google Authenticator" width={200} height={200} />
        </div>
      ) : null}

      <Form
        className="form-horizontal"
        onSubmit={handleSubmit}
      >
        {errorMessage && <Alert color="danger">{errorMessage}</Alert>}

        <div className="mb-4">
          <OtpDigitInput digits={digits} onDigitsChange={setDigits} disabled={isSubmitting} onComplete={verify} />
        </div>

        <div className="d-grid mt-3">
          <button
            className="btn btn-primary waves-effect waves-light d-flex align-items-center justify-content-center gap-2"
            type="submit"
            disabled={isSubmitting || !isComplete}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </button>
        </div>

        {onCancel ? (
          <div className="d-grid mt-2">
            <button className="btn btn-link waves-effect" type="button" onClick={onCancel}>
              Back to sign in
            </button>
          </div>
        ) : null}
      </Form>
    </>
  );
}

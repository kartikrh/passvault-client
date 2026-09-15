"use client";

import { useEffect, useState } from "react";
import { Modal, ModalBody, Alert, Badge } from "reactstrap";
import CopyButton from "@/components/CopyButton";
import { fetchAvailablePlans, fetchDefaultPaymentMethod, submitPlanUpgrade } from "@/lib/plan";

const INTERVAL_LABELS = { 1: "day", 2: "month", 3: "year" };

const formatPrice = (price, currency, intervalType, intervalCount) => {
  const amount = Number(price) || 0;
  const unit = INTERVAL_LABELS[intervalType] || null;
  const perLabel = unit ? `/ ${intervalCount > 1 ? `${intervalCount} ${unit}s` : unit}` : "";
  return `${currency || ""} ${amount.toFixed(2)} ${perLabel}`.trim();
};

// Three-step flow: pick a plan -> pay via the admin's default QR/bank method
// and give the unique transfer/reference code -> confirmation. Mirrors
// RevealAccountModal's structure (static-backdrop Modal, local useState,
// no Redux) since it's the closest existing modal in this app.
export default function UpgradePlanModal({ currentPackageId, onClose, onSubmitted }) {
  const [step, setStep] = useState("select-plan");
  const [plans, setPlans] = useState(null);
  const [plansError, setPlansError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [transferCode, setTransferCode] = useState("");
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAvailablePlans()
      .then((result) => setPlans(result))
      .catch((err) => setPlansError(err?.message || "Could not load plans."));
  }, []);

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setStep("pay");
    setPaymentError(null);
    fetchDefaultPaymentMethod()
      .then((result) => setPaymentMethod(result))
      .catch((err) => setPaymentError(err?.message || "Could not load a payment method."));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await submitPlanUpgrade({ packageId: selectedPlan.id, transferCode: transferCode.trim() });
      setStep("submitted");
      onSubmitted?.();
    } catch (err) {
      setSubmitError(err?.message || "Could not submit your upgrade request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen backdrop="static" toggle={onClose} centered>
      <ModalBody className="p-4">
        {step === "select-plan" ? (
          <div>
            <h5 className="mb-3">Upgrade plan</h5>
            {plansError ? <Alert color="danger" className="py-2 px-3">{plansError}</Alert> : null}
            {!plans ? (
              <div className="text-muted small">Loading plans...</div>
            ) : plans.filter((p) => p.id !== currentPackageId).length === 0 ? (
              <div className="text-muted small">No other plans are available right now.</div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {plans
                  .filter((p) => p.id !== currentPackageId)
                  .map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      className="btn btn-outline-primary d-flex justify-content-between align-items-center text-start"
                      onClick={() => handleSelectPlan(plan)}
                    >
                      <span>{plan.name}</span>
                      <Badge color="primary" pill>
                        {formatPrice(plan.price, plan.currency, plan.intervalType, plan.intervalCount)}
                      </Badge>
                    </button>
                  ))}
              </div>
            )}
            <div className="d-grid mt-3">
              <button type="button" className="btn btn-light btn-sm border" onClick={onClose}>
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        {step === "pay" ? (
          <form onSubmit={handleSubmit}>
            <div className="d-flex justify-content-between align-items-start mb-3 gap-2">
              <h5 className="mb-0">Pay for {selectedPlan.name}</h5>
              <Badge color="primary" className="flex-shrink-0">
                {formatPrice(selectedPlan.price, selectedPlan.currency, selectedPlan.intervalType, selectedPlan.intervalCount)}
              </Badge>
            </div>

            {paymentError ? <Alert color="danger" className="py-2 px-3">{paymentError}</Alert> : null}

            {!paymentMethod && !paymentError ? (
              <div className="text-muted small mb-3">Loading payment details...</div>
            ) : null}

            {paymentMethod?.type === "QR" ? (
              <div className="text-center mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin-supplied external URL, not a local/optimizable asset */}
                <img
                  src={paymentMethod.qrImageUrl}
                  alt={paymentMethod.label}
                  style={{ maxWidth: 220, width: "100%" }}
                  className="border rounded p-2 mb-2"
                />
                {paymentMethod.upiId ? (
                  <div className="d-flex align-items-center justify-content-center gap-2 small">
                    <code>{paymentMethod.upiId}</code>
                    <CopyButton value={paymentMethod.upiId} label="UPI ID" />
                  </div>
                ) : null}
              </div>
            ) : null}

            {paymentMethod?.type === "BANK" ? (
              <dl className="mb-3">
                <dt className="small text-muted">Bank</dt>
                <dd>{paymentMethod.bankName}</dd>
                {paymentMethod.accountHolderName ? (
                  <>
                    <dt className="small text-muted">Account holder</dt>
                    <dd>{paymentMethod.accountHolderName}</dd>
                  </>
                ) : null}
                <dt className="small text-muted">Account number</dt>
                <dd className="d-flex align-items-center gap-2">
                  <span>{paymentMethod.accountNumber}</span>
                  <CopyButton value={paymentMethod.accountNumber} label="account number" />
                </dd>
                {paymentMethod.ifscCode ? (
                  <>
                    <dt className="small text-muted">IFSC / SWIFT</dt>
                    <dd>{paymentMethod.ifscCode}</dd>
                  </>
                ) : null}
                {paymentMethod.branch ? (
                  <>
                    <dt className="small text-muted">Branch</dt>
                    <dd>{paymentMethod.branch}</dd>
                  </>
                ) : null}
              </dl>
            ) : null}

            {paymentMethod?.instructions ? (
              <div className="text-muted small mb-3">{paymentMethod.instructions}</div>
            ) : null}

            {paymentMethod ? (
              <>
                {submitError ? <Alert color="danger" className="py-2 px-3">{submitError}</Alert> : null}
                <label className="form-label small text-muted mb-1" htmlFor="transferCode">
                  Transfer / reference code
                </label>
                <input
                  id="transferCode"
                  type="text"
                  className="form-control mb-3"
                  placeholder="e.g. the UPI/bank transaction ID"
                  value={transferCode}
                  onChange={(e) => setTransferCode(e.target.value)}
                  required
                />
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-light btn-sm border flex-grow-1" onClick={onClose}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm flex-grow-1" disabled={isSubmitting || !transferCode.trim()}>
                    {isSubmitting ? "Submitting..." : "Submit for review"}
                  </button>
                </div>
              </>
            ) : null}
          </form>
        ) : null}

        {step === "submitted" ? (
          <div className="text-center">
            <h5 className="mb-2">Request submitted</h5>
            <p className="text-muted small mb-3">
              Your upgrade to <strong>{selectedPlan.name}</strong> is pending review. You&apos;ll be moved onto the new
              plan once an admin confirms your payment.
            </p>
            <div className="d-grid">
              <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        ) : null}
      </ModalBody>
    </Modal>
  );
}

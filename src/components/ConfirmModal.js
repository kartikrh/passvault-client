"use client";

import { Modal, ModalBody } from "reactstrap";

// Generic yes/cancel confirmation dialog -- title/body/confirmLabel are
// just copy, the caller owns all the state (isOpen implied by mounting
// this at all, matching every other modal in this app).
export default function ConfirmModal({
  title = "Are you sure?",
  body,
  confirmLabel = "Confirm",
  isConfirming,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal isOpen backdrop="static" toggle={onCancel} centered>
      <ModalBody className="p-4">
        <h5 className="mb-2">{title}</h5>
        {body ? <p className="text-muted small mb-4">{body}</p> : null}
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-light btn-sm border" onClick={onCancel} disabled={isConfirming}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger btn-sm" onClick={onConfirm} disabled={isConfirming}>
            {isConfirming ? "Working..." : confirmLabel}
          </button>
        </div>
      </ModalBody>
    </Modal>
  );
}

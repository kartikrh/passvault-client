"use client";

import { Modal, ModalBody, ModalHeader, Button } from "reactstrap";

// Shown over LoginForm whenever useGeolocation's status isn't "granted" --
// non-dismissable (no onClosed/backdrop-close/Escape wired up) since
// location is mandatory to sign in or sign up, not optional. The "Enable
// Location" button is the required user gesture: clicking it calls
// request() -> navigator.geolocation.getCurrentPosition(), which is what
// actually makes the browser show its own native permission popup.
export default function LocationRequiredModal({ isOpen, status, error, onEnableLocation }) {
  return (
    <Modal isOpen={isOpen} centered backdrop="static" keyboard={false}>
      <ModalHeader>Location access required</ModalHeader>
      <ModalBody>
        <p>
          PassVault requires your device&apos;s location to help protect your account -- every sign-in
          is recorded with where it came from, so you can spot anything that isn&apos;t you.
        </p>
        {error ? <p className="text-danger small mb-3">{error}</p> : null}
        <div className="d-grid">
          <Button color="primary" onClick={onEnableLocation} disabled={status === "requesting"}>
            {status === "requesting" ? "Waiting for permission..." : "Enable Location"}
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
}

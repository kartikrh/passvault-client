"use client";

import { useState } from "react";
import { Alert, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import PasswordStrengthMeter from "@/components/PasswordStrengthMeter";
import PasswordInput from "@/components/PasswordInput";
import SecurityQuestionsEditor from "@/components/SecurityQuestionsEditor";
import TagsEditor from "@/components/TagsEditor";

// onAdd: async ({ title, username, password, url, securityQuestions, tags }) => void,
// thrown errors (including PassVaultapi's plan-quota message) are shown inline below.
export default function AddAccountForm({ onAdd }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");
  const [securityQuestions, setSecurityQuestions] = useState([]);
  const [tags, setTags] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const reset = () => {
    setTitle("");
    setUsername("");
    setPassword("");
    setUrl("");
    setSecurityQuestions([]);
    setTags([]);
  };

  const closeForm = () => {
    setIsOpen(false);
    setError(null);
    reset();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !password) {
      setError("Name and password are required.");
      return;
    }

    const trimmedQuestions = securityQuestions.map((q) => ({
      question: q.question.trim(),
      answer: q.answer.trim(),
    }));
    if (trimmedQuestions.some((q) => (q.question && !q.answer) || (!q.question && q.answer))) {
      setError("Fill in both the question and answer, or remove that security question.");
      return;
    }

    setIsSaving(true);
    try {
      await onAdd({
        title: title.trim(),
        username: username.trim(),
        password,
        url: url.trim(),
        securityQuestions: trimmedQuestions.filter((q) => q.question && q.answer),
        tags,
      });
      closeForm();
    } catch (err) {
      setError(err?.message || "Could not save this account. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button type="button" className="btn btn-primary btn-sm" onClick={() => setIsOpen(true)}>
        <i className="bx bx-plus me-1" />
        Add account
      </button>

      <Modal isOpen={isOpen} toggle={closeForm}>
        <ModalHeader toggle={closeForm}>Add account</ModalHeader>
        <form onSubmit={handleSubmit}>
          <ModalBody>
            {error ? (
              <Alert color="danger" className="py-2 px-3">
                {error}
              </Alert>
            ) : null}

            <FormGroup>
              <Label className="form-label">Name</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Gmail" required />
            </FormGroup>

            <FormGroup>
              <Label className="form-label">Username / email</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} />
            </FormGroup>

            <FormGroup>
              <Label className="form-label">Password</Label>
              <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} required />
              <PasswordStrengthMeter password={password} />
            </FormGroup>

            <FormGroup>
              <Label className="form-label">Website (optional)</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" />
            </FormGroup>

            <TagsEditor value={tags} onChange={setTags} />

            <SecurityQuestionsEditor value={securityQuestions} onChange={setSecurityQuestions} />
          </ModalBody>
          <ModalFooter>
            <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save account"}
            </button>
            <button type="button" className="btn btn-light btn-sm border" onClick={closeForm}>
              Cancel
            </button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}

"use client";

import { useState } from "react";
import { Alert, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import PasswordStrengthMeter from "@/components/PasswordStrengthMeter";
import SecurityQuestionsEditor from "@/components/SecurityQuestionsEditor";
import TagsEditor from "@/components/TagsEditor";

// entry: the existing decrypted vault entry being edited (already
// plaintext in memory -- see useVault/vaultData.js). Mounted only while
// the row's edit modal is open (see VaultAccountList.js) -- unmounting on
// cancel/save is what gives every re-open a fresh copy of entry's fields.
// onSave: async ({ title, username, password, url, securityQuestions, tags }) => void
export default function EditAccountForm({ entry, onSave, onCancel }) {
  const [title, setTitle] = useState(entry.title || "");
  const [username, setUsername] = useState(entry.username || "");
  const [password, setPassword] = useState(entry.password || "");
  const [url, setUrl] = useState(entry.url || "");
  const [securityQuestions, setSecurityQuestions] = useState(entry.securityQuestions || []);
  const [tags, setTags] = useState(entry.tags || []);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

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
      await onSave({
        title: title.trim(),
        username: username.trim(),
        password,
        url: url.trim(),
        securityQuestions: trimmedQuestions.filter((q) => q.question && q.answer),
        tags,
      });
    } catch (err) {
      setError(err?.message || "Could not save this account. Please try again.");
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen toggle={onCancel}>
      <ModalHeader toggle={onCancel}>Edit account</ModalHeader>
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
            <Input value={password} onChange={(e) => setPassword(e.target.value)} required />
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
            {isSaving ? "Saving..." : "Save changes"}
          </button>
          <button type="button" className="btn btn-light btn-sm border" onClick={onCancel} disabled={isSaving}>
            Cancel
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

"use client";

import { FormGroup, Input, Label } from "reactstrap";

function SecurityQuestionRow({ index, question, answer, onChange, onRemove }) {
  return (
    <div className="d-flex align-items-start gap-2 mb-2">
      <Input
        value={question}
        onChange={(e) => onChange(index, "question", e.target.value)}
        placeholder="Security question"
      />
      <Input value={answer} onChange={(e) => onChange(index, "answer", e.target.value)} placeholder="Answer" />
      <button
        type="button"
        className="btn btn-light btn-sm border flex-shrink-0"
        onClick={() => onRemove(index)}
        aria-label="Remove security question"
      >
        <i className="bx bx-trash" />
      </button>
    </div>
  );
}

// value: [{ question, answer }], onChange: (next) => void -- fully
// controlled, shared by AddAccountForm and EditAccountForm so the dynamic
// add/remove list behaves identically in both places.
export default function SecurityQuestionsEditor({ value, onChange }) {
  const add = () => onChange([...value, { question: "", answer: "" }]);
  const remove = (index) => onChange(value.filter((_, i) => i !== index));
  const update = (index, field, val) =>
    onChange(value.map((q, i) => (i === index ? { ...q, [field]: val } : q)));

  return (
    <FormGroup className="mb-2">
      <Label className="form-label">Security questions (optional)</Label>
      {value.map((q, index) => (
        <SecurityQuestionRow
          key={index}
          index={index}
          question={q.question}
          answer={q.answer}
          onChange={update}
          onRemove={remove}
        />
      ))}
      <button type="button" className="btn btn-light btn-sm border" onClick={add}>
        <i className="bx bx-plus me-1" />
        Add security question
      </button>
    </FormGroup>
  );
}

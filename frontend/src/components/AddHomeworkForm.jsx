import { useState } from "react";
import { formatApiError } from "../utils/errors";
import { validateHomeworkForm } from "../utils/validation";

const EMPTY_FIELD_ERRORS = {
  assignmentName: "",
  course: "",
  dueDate: "",
};

export default function AddHomeworkForm({ userId, onCreate }) {
  const [assignmentName, setAssignmentName] = useState("");
  const [course, setCourse] = useState("");
  const [dueDate, setDueDate] = useState(""); // yyyy-mm-ddThh:mm (local)
  const [fieldErrors, setFieldErrors] = useState(EMPTY_FIELD_ERRORS);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  function clearFieldError(field) {
    setFieldErrors((prev) =>
      prev[field] ? { ...prev, [field]: "" } : prev
    );
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");

    const { errors, values } = validateHomeworkForm({
      assignmentName,
      course,
      dueDate,
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors({ ...EMPTY_FIELD_ERRORS, ...errors });
      return;
    }

    setFieldErrors(EMPTY_FIELD_ERRORS);
    setSaving(true);

    try {
      await onCreate({
        user_id: userId,
        assignment_name: values.assignmentName,
        course: values.course,
        // FastAPI expects an ISO string. datetime-local lacks seconds/timezone.
        due_date: `${values.dueDate}:00`,
      });

      setAssignmentName("");
      setCourse("");
      setDueDate("");
    } catch (e2) {
      setErr(formatApiError(e2));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="homework-form" onSubmit={submit} noValidate>
      <div className="homework-form__fields">
        <div className="homework-form__field homework-form__field--wide">
          <label className="homework-form__label" htmlFor="assignment-name">
            Assignment name
          </label>
          <input
            id="assignment-name"
            placeholder="e.g. Math Worksheet"
            value={assignmentName}
            onChange={(e) => {
              setAssignmentName(e.target.value);
              clearFieldError("assignmentName");
            }}
            aria-invalid={Boolean(fieldErrors.assignmentName)}
            aria-describedby={
              fieldErrors.assignmentName ? "assignment-name-error" : undefined
            }
          />
          {fieldErrors.assignmentName && (
            <p
              id="assignment-name-error"
              className="field-error"
              role="alert"
            >
              {fieldErrors.assignmentName}
            </p>
          )}
        </div>

        <div className="homework-form__field">
          <label className="homework-form__label" htmlFor="course">
            Course <span className="homework-form__optional">(optional)</span>
          </label>
          <input
            id="course"
            placeholder="e.g. Biology"
            value={course}
            onChange={(e) => {
              setCourse(e.target.value);
              clearFieldError("course");
            }}
            aria-invalid={Boolean(fieldErrors.course)}
            aria-describedby={fieldErrors.course ? "course-error" : undefined}
          />
          {fieldErrors.course && (
            <p id="course-error" className="field-error" role="alert">
              {fieldErrors.course}
            </p>
          )}
        </div>

        <div className="homework-form__field">
          <label className="homework-form__label" htmlFor="due-date">
            Due date
          </label>
          <input
            id="due-date"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => {
              setDueDate(e.target.value);
              clearFieldError("dueDate");
            }}
            aria-invalid={Boolean(fieldErrors.dueDate)}
            aria-describedby={fieldErrors.dueDate ? "due-date-error" : undefined}
          />
          {fieldErrors.dueDate && (
            <p id="due-date-error" className="field-error" role="alert">
              {fieldErrors.dueDate}
            </p>
          )}
        </div>
      </div>

      <div className="homework-form__actions">
        <button
          className="homework-form__submit"
          type="submit"
          disabled={saving}
        >
          {saving ? "Adding…" : "Add assignment"}
        </button>
      </div>

      {err && <p className="status-message status-message--error">{err}</p>}
    </form>
  );
}

import { useState } from "react";
import { formatApiError } from "../utils/errors";

export default function AddHomeworkForm({ userId, onCreate }) {
  const [assignmentName, setAssignmentName] = useState("");
  const [course, setCourse] = useState("");
  const [dueDate, setDueDate] = useState(""); // yyyy-mm-ddThh:mm (local)
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setSaving(true);

    try {
      await onCreate({
        user_id: userId,
        assignment_name: assignmentName,
        course: course || null,
        // FastAPI expects an ISO string. datetime-local is *almost* ISO but lacks seconds/timezone.
        // Add ":00" seconds to be safe.
        due_date: dueDate ? `${dueDate}:00` : new Date().toISOString(),
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
    <form className="homework-form" onSubmit={submit}>
      <div className="homework-form__fields">
        <div className="homework-form__field homework-form__field--wide">
          <label className="homework-form__label" htmlFor="assignment-name">
            Assignment name
          </label>
          <input
            id="assignment-name"
            placeholder="e.g. Math Worksheet"
            value={assignmentName}
            onChange={(e) => setAssignmentName(e.target.value)}
            required
          />
        </div>

        <div className="homework-form__field">
          <label className="homework-form__label" htmlFor="course">
            Course <span className="homework-form__optional">(optional)</span>
          </label>
          <input
            id="course"
            placeholder="e.g. Biology"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
          />
        </div>

        <div className="homework-form__field">
          <label className="homework-form__label" htmlFor="due-date">
            Due date
          </label>
          <input
            id="due-date"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
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

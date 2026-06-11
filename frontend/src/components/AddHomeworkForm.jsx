import { useState } from "react";

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
      setErr(String(e2.message || e2));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      style={{ marginBottom: 16 }}
    >
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          placeholder="Assignment name"
          value={assignmentName}
          onChange={(e) => setAssignmentName(e.target.value)}
          required
        />
        <input
          placeholder="Course (optional)"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
        />
        <input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={saving}
        >
          {saving ? "Adding…" : "Add"}
        </button>
      </div>

      {err && <p style={{ color: "crimson" }}>{err}</p>}
    </form>
  );
}

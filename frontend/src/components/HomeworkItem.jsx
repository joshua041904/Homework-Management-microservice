export default function HomeworkItem({ hw }) {
  const due = hw.due_date ? new Date(hw.due_date) : null;

  return (
    <li>
      <strong>{hw.assignment_name}</strong>
      {hw.course ? ` (${hw.course})` : ""}
      {due ? ` — due ${due.toLocaleString()}` : ""}
    </li>
  );
}

import { formatDueDate } from "../utils/dates";

export default function HomeworkItem({ hw }) {
  const dueLabel = formatDueDate(hw.due_date);

  return (
    <li className="homework-item">
      <div className="homework-item__main">
        <span className="homework-item__title">{hw.assignment_name}</span>
        {hw.course && (
          <span className="homework-item__course">{hw.course}</span>
        )}
      </div>
      <span className="homework-item__due">Due {dueLabel}</span>
    </li>
  );
}

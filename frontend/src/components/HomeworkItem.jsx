import { Link } from "react-router-dom";
import { formatDueDate } from "../utils/dates";
import { homeworkPath } from "../utils/routes";

export default function HomeworkItem({ hw, userId }) {
  const dueLabel = formatDueDate(hw.due_date);

  return (
    <li className="homework-item">
      <div className="homework-item__row">
        <div className="homework-item__main">
          <Link
            className="homework-item__title homework-item__title-link"
            to={homeworkPath(hw.id, userId)}
          >
            {hw.assignment_name}
          </Link>
          {hw.course && (
            <span className="homework-item__course">{hw.course}</span>
          )}
        </div>
        <div className="homework-item__meta">
          <span className="homework-item__due">Due {dueLabel}</span>
        </div>
      </div>
    </li>
  );
}

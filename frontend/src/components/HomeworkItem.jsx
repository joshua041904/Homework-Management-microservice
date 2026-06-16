import { formatDueDate } from "../utils/dates";
import HomeworkForm from "./HomeworkForm";

export default function HomeworkItem({
  hw,
  userId,
  isEditing,
  onEdit,
  onCancelEdit,
  onUpdate,
}) {
  const dueLabel = formatDueDate(hw.due_date);

  return (
    <li className={`homework-item${isEditing ? " homework-item--editing" : ""}`}>
      <div className="homework-item__row">
        <div className="homework-item__main">
          <span className="homework-item__title">{hw.assignment_name}</span>
          {hw.course && (
            <span className="homework-item__course">{hw.course}</span>
          )}
        </div>
        <div className="homework-item__meta">
          <span className="homework-item__due">Due {dueLabel}</span>
          {!isEditing && (
            <button
              className="homework-item__edit"
              type="button"
              onClick={() => onEdit(hw.id)}
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="homework-item__edit-panel">
          <HomeworkForm
            key={hw.id}
            mode="edit"
            userId={userId}
            initialValues={hw}
            idPrefix={`edit-${hw.id}-`}
            onSubmit={(payload) => onUpdate(hw.id, payload)}
            onCancel={onCancelEdit}
          />
        </div>
      )}
    </li>
  );
}

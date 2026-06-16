import { useState } from "react";
import { formatDueDate } from "../utils/dates";
import { formatApiError } from "../utils/errors";
import HomeworkForm from "./HomeworkForm";

const DELETE_CONFIRM_MESSAGE =
  "Delete this assignment? This cannot be undone.";

export default function HomeworkItem({
  hw,
  userId,
  isEditing,
  onEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
}) {
  const [deleteErr, setDeleteErr] = useState("");
  const [deleting, setDeleting] = useState(false);
  const dueLabel = formatDueDate(hw.due_date);

  async function handleDeleteClick() {
    if (!window.confirm(DELETE_CONFIRM_MESSAGE)) {
      return;
    }

    setDeleteErr("");
    setDeleting(true);

    try {
      await onDelete(hw.id);
    } catch (e) {
      setDeleteErr(formatApiError(e));
    } finally {
      setDeleting(false);
    }
  }

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
            <div className="homework-item__actions">
              <button
                className="homework-item__edit"
                type="button"
                onClick={() => onEdit(hw.id)}
              >
                Edit
              </button>
              <button
                className="homework-item__delete"
                type="button"
                onClick={handleDeleteClick}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          )}
        </div>
      </div>

      {deleteErr && (
        <p className="status-message status-message--error homework-item__delete-error">
          {deleteErr}
        </p>
      )}

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

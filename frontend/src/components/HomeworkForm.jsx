import { useState } from "react";
import { formatApiError } from "../utils/errors";
import { toApiDateTime, toDateTimeLocal } from "../utils/dates";
import { allowedFileAccept, validateHomeworkFile } from "../utils/files";
import { validateHomeworkForm } from "../utils/validation";

const EMPTY_FIELD_ERRORS = {
  assignmentName: "",
  course: "",
  dueDate: "",
  attachment: "",
};

function buildInitialFields(mode, initialValues) {
  if (mode === "edit" && initialValues) {
    return {
      assignmentName: initialValues.assignment_name ?? "",
      course: initialValues.course ?? "",
      dueDate: toDateTimeLocal(initialValues.due_date),
    };
  }

  return {
    assignmentName: "",
    course: "",
    dueDate: "",
  };
}

export default function HomeworkForm({
  mode = "create",
  userId,
  initialValues,
  idPrefix = "",
  onSubmit,
  onCancel,
}) {
  const isEdit = mode === "edit";
  const assignmentId = `${idPrefix}assignment-name`;
  const courseId = `${idPrefix}course`;
  const dueDateId = `${idPrefix}due-date`;
  const attachmentId = `${idPrefix}attachment`;

  const initialFields = buildInitialFields(mode, initialValues);
  const [assignmentName, setAssignmentName] = useState(
    () => initialFields.assignmentName
  );
  const [course, setCourse] = useState(() => initialFields.course);
  const [dueDate, setDueDate] = useState(() => initialFields.dueDate);
  const [selectedFile, setSelectedFile] = useState(null);
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
      mode,
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors({ ...EMPTY_FIELD_ERRORS, ...errors });
      return;
    }

    if (!isEdit && selectedFile) {
      const fileError = validateHomeworkFile(selectedFile);
      if (fileError) {
        setFieldErrors({ ...EMPTY_FIELD_ERRORS, attachment: fileError });
        return;
      }
    }

    setFieldErrors(EMPTY_FIELD_ERRORS);
    setSaving(true);

    try {
      const payload = {
        assignment_name: values.assignmentName,
        course: values.course,
        due_date: toApiDateTime(values.dueDate),
      };

      if (isEdit) {
        await onSubmit(payload);
      } else {
        await onSubmit(
          {
            user_id: userId,
            ...payload,
          },
          selectedFile
        );
        setAssignmentName("");
        setCourse("");
        setDueDate("");
        setSelectedFile(null);
      }
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
          <label className="homework-form__label" htmlFor={assignmentId}>
            Assignment name
          </label>
          <input
            id={assignmentId}
            placeholder="e.g. Math Worksheet"
            value={assignmentName}
            onChange={(e) => {
              setAssignmentName(e.target.value);
              clearFieldError("assignmentName");
            }}
            aria-invalid={Boolean(fieldErrors.assignmentName)}
            aria-describedby={
              fieldErrors.assignmentName ? `${assignmentId}-error` : undefined
            }
          />
          {fieldErrors.assignmentName && (
            <p
              id={`${assignmentId}-error`}
              className="field-error"
              role="alert"
            >
              {fieldErrors.assignmentName}
            </p>
          )}
        </div>

        <div className="homework-form__field">
          <label className="homework-form__label" htmlFor={courseId}>
            Course <span className="homework-form__optional">(optional)</span>
          </label>
          <input
            id={courseId}
            placeholder="e.g. Biology"
            value={course}
            onChange={(e) => {
              setCourse(e.target.value);
              clearFieldError("course");
            }}
            aria-invalid={Boolean(fieldErrors.course)}
            aria-describedby={fieldErrors.course ? `${courseId}-error` : undefined}
          />
          {fieldErrors.course && (
            <p id={`${courseId}-error`} className="field-error" role="alert">
              {fieldErrors.course}
            </p>
          )}
        </div>

        <div className="homework-form__field">
          <label className="homework-form__label" htmlFor={dueDateId}>
            Due date
          </label>
          <input
            id={dueDateId}
            type="datetime-local"
            value={dueDate}
            onChange={(e) => {
              setDueDate(e.target.value);
              clearFieldError("dueDate");
            }}
            aria-invalid={Boolean(fieldErrors.dueDate)}
            aria-describedby={
              fieldErrors.dueDate ? `${dueDateId}-error` : undefined
            }
          />
          {fieldErrors.dueDate && (
            <p id={`${dueDateId}-error`} className="field-error" role="alert">
              {fieldErrors.dueDate}
            </p>
          )}
        </div>

        {!isEdit && (
          <div className="homework-form__field homework-form__field--wide">
            <label className="homework-form__label" htmlFor={attachmentId}>
              Attachment{" "}
              <span className="homework-form__optional">(optional)</span>
            </label>
            <input
              id={attachmentId}
              type="file"
              accept={allowedFileAccept()}
              onChange={(e) => {
                setSelectedFile(e.target.files?.[0] ?? null);
                clearFieldError("attachment");
              }}
              aria-invalid={Boolean(fieldErrors.attachment)}
              aria-describedby={
                fieldErrors.attachment ? `${attachmentId}-error` : undefined
              }
            />
            {fieldErrors.attachment && (
              <p
                id={`${attachmentId}-error`}
                className="field-error"
                role="alert"
              >
                {fieldErrors.attachment}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="homework-form__actions">
        {isEdit && onCancel && (
          <button
            className="homework-form__cancel"
            type="button"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
        )}
        <button
          className="homework-form__submit"
          type="submit"
          disabled={saving}
        >
          {saving
            ? isEdit
              ? "Saving…"
              : selectedFile
                ? "Adding & uploading…"
                : "Adding…"
            : isEdit
              ? "Save changes"
              : "Add assignment"}
        </button>
      </div>

      {err && <p className="status-message status-message--error">{err}</p>}
    </form>
  );
}

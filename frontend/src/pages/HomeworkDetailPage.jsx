import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  deleteHomework,
  deleteHomeworkFile,
  getHomework,
  homeworkFileDownloadUrl,
  updateHomework,
  uploadHomeworkFile,
} from "../api";
import HomeworkForm from "../components/HomeworkForm";
import {
  HomeworkListError,
  HomeworkListLoading,
  HomeworkNotFound,
} from "../components/HomeworkListStatus";
import { ApiError, formatApiError } from "../utils/errors";
import { formatCreatedAt, formatDueDate } from "../utils/dates";
import {
  allowedFileAccept,
  formatFileSize,
  validateHomeworkFile,
} from "../utils/files";
import { homePath } from "../utils/routes";

const DELETE_CONFIRM_MESSAGE =
  "Delete this assignment? This cannot be undone.";
const REMOVE_FILE_CONFIRM_MESSAGE =
  "Remove this attachment? The file will be deleted from the server.";

export default function HomeworkDetailPage({ userId }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const homeworkId = Number(id);

  const [hw, setHw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteErr, setDeleteErr] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [attachErr, setAttachErr] = useState("");
  const [attaching, setAttaching] = useState(false);
  const [removingFile, setRemovingFile] = useState(false);

  const loadHomework = useCallback(async () => {
    if (!Number.isInteger(homeworkId) || homeworkId < 1) {
      setHw(null);
      setNotFound(true);
      setError("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setNotFound(false);

    try {
      const data = await getHomework(homeworkId);
      setHw(data);
    } catch (e) {
      setHw(null);
      if (e instanceof ApiError && e.status === 404) {
        setNotFound(true);
      } else {
        setError(formatApiError(e));
      }
    } finally {
      setLoading(false);
    }
  }, [homeworkId]);

  useEffect(() => {
    setIsEditing(false);
    setDeleteErr("");
    setAttachErr("");
    loadHomework();
  }, [loadHomework, userId]);

  async function handleUpdate(payload) {
    await updateHomework(homeworkId, userId, payload);
    setIsEditing(false);
    await loadHomework();
  }

  async function handleDelete() {
    if (!window.confirm(DELETE_CONFIRM_MESSAGE)) {
      return;
    }

    setDeleteErr("");
    setDeleting(true);

    try {
      await deleteHomework(homeworkId, userId);
      navigate(homePath(userId));
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        navigate(homePath(userId));
        return;
      }
      setDeleteErr(formatApiError(e));
    } finally {
      setDeleting(false);
    }
  }

  async function handleFileSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateHomeworkFile(file);
    if (validationError) {
      setAttachErr(validationError);
      e.target.value = "";
      return;
    }

    setAttachErr("");
    setAttaching(true);

    try {
      await uploadHomeworkFile(homeworkId, userId, file);
      await loadHomework();
    } catch (err) {
      setAttachErr(formatApiError(err));
    } finally {
      setAttaching(false);
      e.target.value = "";
    }
  }

  async function handleRemoveAttachment() {
    if (!window.confirm(REMOVE_FILE_CONFIRM_MESSAGE)) {
      return;
    }

    setAttachErr("");
    setRemovingFile(true);

    try {
      await deleteHomeworkFile(homeworkId, userId);
      await loadHomework();
    } catch (err) {
      setAttachErr(formatApiError(err));
    } finally {
      setRemovingFile(false);
    }
  }

  const isOwner = hw?.user_id === userId;
  const backPath = homePath(userId);
  const hasAttachment = Boolean(hw?.file_original_name);

  return (
    <section className="panel homework-detail">
      <div className="homework-detail__header">
        <Link className="homework-detail__back" to={backPath}>
          ← Back to list
        </Link>
      </div>

      {loading ? (
        <HomeworkListLoading message="Loading assignment…" />
      ) : notFound ? (
        <HomeworkNotFound homePath={backPath} />
      ) : error ? (
        <HomeworkListError message={error} onRetry={loadHomework} />
      ) : hw ? (
        <>
          {!isOwner && (
            <p className="status-message status-message--muted homework-detail__owner-note">
              This assignment belongs to user {hw.user_id}. Switch the user ID
              above to edit or delete it.
            </p>
          )}

          {isEditing ? (
            <HomeworkForm
              key={hw.id}
              mode="edit"
              userId={userId}
              initialValues={hw}
              idPrefix={`detail-${hw.id}-`}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <>
              <h2 className="homework-detail__title">{hw.assignment_name}</h2>

              <dl className="homework-detail__fields">
                <div className="homework-detail__field">
                  <dt>Assignment ID</dt>
                  <dd>{hw.id}</dd>
                </div>
                <div className="homework-detail__field">
                  <dt>Course</dt>
                  <dd>{hw.course || "—"}</dd>
                </div>
                <div className="homework-detail__field">
                  <dt>Due date</dt>
                  <dd>{formatDueDate(hw.due_date)}</dd>
                </div>
                <div className="homework-detail__field">
                  <dt>Created</dt>
                  <dd>{formatCreatedAt(hw.created_at)}</dd>
                </div>
                <div className="homework-detail__field">
                  <dt>User ID</dt>
                  <dd>{hw.user_id}</dd>
                </div>
                <div className="homework-detail__field">
                  <dt>Attachment</dt>
                  <dd>
                    {hasAttachment ? (
                      <div className="homework-detail__attachment">
                        <span>
                          {hw.file_original_name} ({formatFileSize(hw.file_size_bytes)})
                        </span>
                        <div className="homework-detail__attachment-actions">
                          <a
                            className="homework-detail__download"
                            href={homeworkFileDownloadUrl(hw.id, userId)}
                            download={hw.file_original_name}
                          >
                            Download
                          </a>
                          {isOwner && (
                            <button
                              type="button"
                              className="homework-detail__remove-file"
                              onClick={handleRemoveAttachment}
                              disabled={removingFile}
                            >
                              {removingFile ? "Removing…" : "Remove"}
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
              </dl>

              {isOwner && (
                <div className="homework-detail__upload">
                  <label
                    className="homework-form__label"
                    htmlFor={`detail-upload-${hw.id}`}
                  >
                    {hasAttachment ? "Replace attachment" : "Attach file"}
                  </label>
                  <input
                    id={`detail-upload-${hw.id}`}
                    type="file"
                    accept={allowedFileAccept()}
                    onChange={handleFileSelected}
                    disabled={attaching}
                  />
                  {attaching && (
                    <p className="status-message status-message--muted">
                      Uploading…
                    </p>
                  )}
                </div>
              )}

              {attachErr && (
                <p className="status-message status-message--error">
                  {attachErr}
                </p>
              )}

              <div className="homework-detail__actions">
                <button
                  type="button"
                  className="homework-detail__edit"
                  onClick={() => setIsEditing(true)}
                  disabled={!isOwner}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="homework-detail__delete"
                  onClick={handleDelete}
                  disabled={!isOwner || deleting}
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>

              {deleteErr && (
                <p className="status-message status-message--error">
                  {deleteErr}
                </p>
              )}
            </>
          )}
        </>
      ) : null}
    </section>
  );
}

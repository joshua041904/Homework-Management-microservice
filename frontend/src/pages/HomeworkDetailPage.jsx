import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  deleteHomework,
  getHomework,
  updateHomework,
} from "../api";
import HomeworkForm from "../components/HomeworkForm";
import {
  HomeworkListError,
  HomeworkListLoading,
  HomeworkNotFound,
} from "../components/HomeworkListStatus";
import { ApiError, formatApiError } from "../utils/errors";
import { formatCreatedAt, formatDueDate } from "../utils/dates";
import { homePath } from "../utils/routes";

const DELETE_CONFIRM_MESSAGE =
  "Delete this assignment? This cannot be undone.";

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

  const isOwner = hw?.user_id === userId;
  const backPath = homePath(userId);

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
              </dl>

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

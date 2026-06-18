import { Link } from "react-router-dom";

export function HomeworkListLoading({ message = "Loading homework…" }) {
  return (
    <div className="list-status list-status--loading" role="status" aria-live="polite">
      <span className="list-status__spinner" aria-hidden="true" />
      <p className="list-status__message">{message}</p>
    </div>
  );
}

export function HomeworkListError({ message, onRetry }) {
  return (
    <div className="list-status list-status--error" role="alert">
      <p className="list-status__message status-message--error">{message}</p>
      {onRetry && (
        <button type="button" className="list-status__retry" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export function HomeworkNotFound({ homePath = "/" }) {
  return (
    <div className="empty-state" role="alert">
      <p className="empty-state__title">Assignment not found</p>
      <p className="empty-state__hint">
        It may have been deleted or the link is invalid.
      </p>
      <Link className="empty-state__link" to={homePath}>
        Back to list
      </Link>
    </div>
  );
}

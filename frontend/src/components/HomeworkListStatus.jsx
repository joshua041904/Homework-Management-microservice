export function HomeworkListLoading() {
  return (
    <div className="list-status list-status--loading" role="status" aria-live="polite">
      <span className="list-status__spinner" aria-hidden="true" />
      <p className="list-status__message">Loading homework…</p>
    </div>
  );
}

export function HomeworkListError({ message, onRetry }) {
  return (
    <div className="list-status list-status--error" role="alert">
      <p className="list-status__message status-message--error">{message}</p>
      <button type="button" className="list-status__retry" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}

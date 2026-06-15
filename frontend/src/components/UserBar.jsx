import { useEffect, useState } from "react";

export default function UserBar({ userId, onUserChange }) {
  const [inputValue, setInputValue] = useState(String(userId));
  const [inputErr, setInputErr] = useState("");

  useEffect(() => {
    setInputValue(String(userId));
    setInputErr("");
  }, [userId]);

  function applyUserId() {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setInputErr("Enter a user ID.");
      return;
    }

    const parsed = Number(trimmed);
    if (!Number.isInteger(parsed) || parsed < 1) {
      setInputErr("User ID must be a positive whole number.");
      return;
    }

    setInputErr("");
    if (parsed !== userId) {
      onUserChange(parsed);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    applyUserId();
  }

  return (
    <div className="user-bar">
      <p className="user-bar__subtitle">
        Showing homework for user <strong>{userId}</strong>
      </p>
      <form className="user-bar__form" onSubmit={handleSubmit}>
        <label className="user-bar__label" htmlFor="user-id">
          User ID
        </label>
        <input
          id="user-id"
          className="user-bar__input"
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (inputErr) setInputErr("");
          }}
          aria-invalid={Boolean(inputErr)}
          aria-describedby={inputErr ? "user-id-error" : undefined}
        />
        <button className="user-bar__load" type="submit">
          Load
        </button>
      </form>
      {inputErr && (
        <p id="user-id-error" className="field-error" role="alert">
          {inputErr}
        </p>
      )}
    </div>
  );
}

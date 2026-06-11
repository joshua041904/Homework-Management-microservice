import { useEffect, useState } from "react";
import { createHomework, listHomeworkForUser } from "./api";
import HomeworkList from "./components/HomeworkList";
import AddHomeworkForm from "./components/AddHomeworkForm";
import "./App.css";

export default function App() {
  // For now: hardcode user 1 since you confirmed it works.
  // Next step after refactor: add a user selector / create user UI.
  const userId = 1;

  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setErr("");
    setLoading(true);
    try {
      const data = await listHomeworkForUser(userId);
      setItems(data);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleCreate(payload) {
    await createHomework(payload);
    await refresh();
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1>Homework Manager</h1>
        <p className="app__subtitle">Showing homework for user {userId}</p>
      </header>

      <section className="panel">
        <h2 className="panel__title">Add assignment</h2>
        <AddHomeworkForm userId={userId} onCreate={handleCreate} />
      </section>

      <section className="panel">
        <h2 className="panel__title">Your assignments</h2>
        {err && <p className="status-message status-message--error">{err}</p>}
        {loading ? (
          <p className="status-message status-message--muted">Loading…</p>
        ) : (
          <HomeworkList items={items} />
        )}
      </section>
    </div>
  );
}

import { useEffect, useState } from "react";
import { createHomework, listHomeworkForUser } from "./api";
import HomeworkList from "./components/HomeworkList";
import AddHomeworkForm from "./components/AddHomeworkForm";

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
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Homework Manager</h1>
      <p style={{ opacity: 0.7 }}>Showing homework for user {userId}</p>

      <AddHomeworkForm
        userId={userId}
        onCreate={handleCreate}
      />

      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {loading ? <p>Loading…</p> : <HomeworkList items={items} />}
    </div>
  );
}

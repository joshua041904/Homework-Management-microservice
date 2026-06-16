import { useCallback, useEffect, useState } from "react";
import { createHomework, listHomeworkForUser, updateHomework } from "./api";
import HomeworkList from "./components/HomeworkList";
import HomeworkForm from "./components/HomeworkForm";
import UserBar from "./components/UserBar";
import {
  HomeworkListError,
  HomeworkListLoading,
} from "./components/HomeworkListStatus";
import { formatListError } from "./utils/errors";
import "./App.css";

export default function App() {
  const [userId, setUserId] = useState(1);
  const [items, setItems] = useState([]);
  const [listErr, setListErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const refresh = useCallback(async (id = userId) => {
    setListErr("");
    setLoading(true);

    try {
      const data = await listHomeworkForUser(id);
      setItems(data);
    } catch (e) {
      setItems([]);
      setListErr(formatListError(e, id));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh(userId);
  }, [userId, refresh]);

  useEffect(() => {
    setEditingId(null);
  }, [userId]);

  async function handleCreate(payload) {
    await createHomework(payload);
    await refresh(userId);
  }

  async function handleUpdate(id, payload) {
    await updateHomework(id, userId, payload);
    setEditingId(null);
    await refresh(userId);
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1>Homework Manager</h1>
        <UserBar userId={userId} onUserChange={setUserId} />
      </header>

      <section className="panel">
        <h2 className="panel__title">Add assignment</h2>
        <HomeworkForm mode="create" userId={userId} onSubmit={handleCreate} />
      </section>

      <section className="panel">
        <h2 className="panel__title">Your assignments</h2>
        {loading ? (
          <HomeworkListLoading />
        ) : listErr ? (
          <HomeworkListError message={listErr} onRetry={() => refresh(userId)} />
        ) : (
          <HomeworkList
            items={items}
            userId={userId}
            editingId={editingId}
            onEdit={setEditingId}
            onCancelEdit={() => setEditingId(null)}
            onUpdate={handleUpdate}
          />
        )}
      </section>
    </div>
  );
}

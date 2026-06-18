import { useCallback, useEffect, useState } from "react";
import { createHomework, listHomeworkForUser } from "../api";
import HomeworkList from "../components/HomeworkList";
import HomeworkForm from "../components/HomeworkForm";
import {
  HomeworkListError,
  HomeworkListLoading,
} from "../components/HomeworkListStatus";
import { formatListError } from "../utils/errors";

export default function HomePage({ userId }) {
  const [items, setItems] = useState([]);
  const [listErr, setListErr] = useState("");
  const [loading, setLoading] = useState(true);

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

  async function handleCreate(payload) {
    await createHomework(payload);
    await refresh(userId);
  }

  return (
    <>
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
          <HomeworkList items={items} userId={userId} />
        )}
      </section>
    </>
  );
}

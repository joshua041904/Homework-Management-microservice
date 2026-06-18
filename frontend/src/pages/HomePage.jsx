import { useCallback, useEffect, useMemo, useState } from "react";
import { createHomework, listHomeworkForUser, uploadHomeworkFile } from "../api";
import HomeworkList from "../components/HomeworkList";
import HomeworkForm from "../components/HomeworkForm";
import HomeworkListToolbar from "../components/HomeworkListToolbar";
import {
  HomeworkListError,
  HomeworkListLoading,
} from "../components/HomeworkListStatus";
import { formatListError } from "../utils/errors";
import {
  DEFAULT_FILTER,
  DEFAULT_SORT,
  filterHomework,
  sortHomework,
} from "../utils/homeworkList";

export default function HomePage({ userId }) {
  const [items, setItems] = useState([]);
  const [listErr, setListErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState(DEFAULT_SORT);
  const [filterBy, setFilterBy] = useState(DEFAULT_FILTER);

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
    setSortBy(DEFAULT_SORT);
    setFilterBy(DEFAULT_FILTER);
  }, [userId]);

  const displayItems = useMemo(() => {
    const filtered = filterHomework(items, filterBy);
    return sortHomework(filtered, sortBy);
  }, [items, sortBy, filterBy]);

  async function handleCreate(payload, file) {
    const hw = await createHomework(payload);
    if (file) {
      await uploadHomeworkFile(hw.id, userId, file);
    }
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
          <>
            <HomeworkListToolbar
              sortBy={sortBy}
              filterBy={filterBy}
              onSortChange={setSortBy}
              onFilterChange={setFilterBy}
            />
            <HomeworkList
              items={displayItems}
              totalCount={items.length}
              userId={userId}
            />
          </>
        )}
      </section>
    </>
  );
}

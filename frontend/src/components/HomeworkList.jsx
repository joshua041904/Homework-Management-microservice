import HomeworkItem from "./HomeworkItem";

export default function HomeworkList({ items, totalCount = 0, userId }) {
  if (!items?.length) {
    if (totalCount > 0) {
      return (
        <div className="empty-state">
          <p className="empty-state__title">No assignments match this filter</p>
          <p className="empty-state__hint">Try changing the filter above.</p>
        </div>
      );
    }

    return (
      <div className="empty-state">
        <p className="empty-state__title">No assignments yet</p>
        <p className="empty-state__hint">Add your first assignment above.</p>
      </div>
    );
  }

  return (
    <ul className="homework-list">
      {items.map((hw) => (
        <HomeworkItem key={hw.id} hw={hw} userId={userId} />
      ))}
    </ul>
  );
}

import HomeworkItem from "./HomeworkItem";

export default function HomeworkList({
  items,
  userId,
  editingId,
  onEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
}) {
  if (!items?.length) {
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
        <HomeworkItem
          key={hw.id}
          hw={hw}
          userId={userId}
          isEditing={editingId === hw.id}
          onEdit={onEdit}
          onCancelEdit={onCancelEdit}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

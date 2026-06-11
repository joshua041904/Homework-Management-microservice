import HomeworkItem from "./HomeworkItem";

export default function HomeworkList({ items }) {
  if (!items?.length) {
    return <p className="status-message status-message--muted">No homework yet.</p>;
  }

  return (
    <ul className="homework-list">
      {items.map((hw) => (
        <HomeworkItem key={hw.id} hw={hw} />
      ))}
    </ul>
  );
}

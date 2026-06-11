import HomeworkItem from "./HomeworkItem";

export default function HomeworkList({ items }) {
  if (!items?.length) return <p>No homework yet.</p>;

  return (
    <ul>
      {items.map((hw) => (
        <HomeworkItem
          key={hw.id}
          hw={hw}
        />
      ))}
    </ul>
  );
}

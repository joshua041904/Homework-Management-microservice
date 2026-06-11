export default function HomeworkItem({ hw }) {
  const due = hw.due_date ? new Date(hw.due_date) : null;

  return (
    <li className="homework-item">
      <div className="homework-item__main">
        <span className="homework-item__title">{hw.assignment_name}</span>
        {hw.course && (
          <span className="homework-item__course">{hw.course}</span>
        )}
      </div>
      {due && (
        <span className="homework-item__due">Due {due.toLocaleString()}</span>
      )}
    </li>
  );
}

import { FILTER_OPTIONS, SORT_OPTIONS } from "../utils/homeworkList";

export default function HomeworkListToolbar({
  sortBy,
  filterBy,
  onSortChange,
  onFilterChange,
  disabled = false,
}) {
  return (
    <div className="homework-list-toolbar">
      <div className="homework-list-toolbar__field">
        <label className="homework-list-toolbar__label" htmlFor="homework-sort">
          Sort
        </label>
        <select
          id="homework-sort"
          className="homework-list-toolbar__select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          disabled={disabled}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="homework-list-toolbar__field">
        <label className="homework-list-toolbar__label" htmlFor="homework-filter">
          Filter
        </label>
        <select
          id="homework-filter"
          className="homework-list-toolbar__select"
          value={filterBy}
          onChange={(e) => onFilterChange(e.target.value)}
          disabled={disabled}
        >
          {FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

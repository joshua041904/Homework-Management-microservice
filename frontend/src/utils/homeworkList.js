import { parseApiDateTime } from "./dates";

export const SORT_OPTIONS = [
  { value: "due_date_asc", label: "Due date (soonest)" },
  { value: "created_at_desc", label: "Created date (newest)" },
  { value: "name_asc", label: "Assignment name (A–Z)" },
];

export const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "overdue", label: "Overdue" },
  { value: "due_this_week", label: "Due this week" },
];

export const DEFAULT_SORT = "due_date_asc";
export const DEFAULT_FILTER = "all";

/**
 * Current local calendar week: Monday 00:00:00 through Sunday 23:59:59.999.
 */
export function getLocalWeekBounds(now = new Date()) {
  const daysSinceMonday = (now.getDay() + 6) % 7;

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - daysSinceMonday);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function dueDateTime(hw) {
  const date = parseApiDateTime(hw.due_date);
  return date ? date.getTime() : null;
}

function createdDateTime(hw) {
  const date = parseApiDateTime(hw.created_at);
  return date ? date.getTime() : null;
}

export function filterHomework(items, filterBy = DEFAULT_FILTER) {
  if (!items?.length || filterBy === "all") {
    return items ?? [];
  }

  const now = new Date();

  if (filterBy === "overdue") {
    return items.filter((hw) => {
      const due = dueDateTime(hw);
      return due !== null && due < now.getTime();
    });
  }

  if (filterBy === "due_this_week") {
    const { start, end } = getLocalWeekBounds(now);
    return items.filter((hw) => {
      const due = dueDateTime(hw);
      return due !== null && due >= start.getTime() && due <= end.getTime();
    });
  }

  return items;
}

function compareDueDateAsc(a, b) {
  const aDue = dueDateTime(a);
  const bDue = dueDateTime(b);

  if (aDue === null && bDue === null) return 0;
  if (aDue === null) return 1;
  if (bDue === null) return -1;
  return aDue - bDue;
}

function compareCreatedAtDesc(a, b) {
  const aCreated = createdDateTime(a);
  const bCreated = createdDateTime(b);

  if (aCreated === null && bCreated === null) return 0;
  if (aCreated === null) return 1;
  if (bCreated === null) return -1;
  return bCreated - aCreated;
}

function compareNameAsc(a, b) {
  return (a.assignment_name ?? "").localeCompare(b.assignment_name ?? "", undefined, {
    sensitivity: "base",
  });
}

export function sortHomework(items, sortBy = DEFAULT_SORT) {
  if (!items?.length) {
    return items ?? [];
  }

  const sorted = [...items];

  switch (sortBy) {
    case "created_at_desc":
      sorted.sort(compareCreatedAtDesc);
      break;
    case "name_asc":
      sorted.sort(compareNameAsc);
      break;
    case "due_date_asc":
    default:
      sorted.sort(compareDueDateAsc);
      break;
  }

  return sorted;
}

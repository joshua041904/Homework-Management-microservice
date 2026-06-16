/**
 * Date helpers for homework due dates.
 *
 * Timezone assumptions:
 * - datetime-local inputs represent the user's local wall-clock time.
 * - API submission uses naive ISO strings (no Z offset), e.g. 2025-06-15T14:30:00,
 *   matching existing FastAPI/Pydantic handling and avoiding UTC shift on create.
 * - API responses are parsed with Date and displayed in the user's local timezone
 *   via Intl.DateTimeFormat.
 */

const DUE_DATE_DISPLAY = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

const DATE_TIME_LOCAL_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const DATE_TIME_LOCAL_WITH_SECONDS_RE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;

function padTwo(value) {
  return String(value).padStart(2, "0");
}

function formatNaiveLocalIso(date) {
  return `${date.getFullYear()}-${padTwo(date.getMonth() + 1)}-${padTwo(date.getDate())}T${padTwo(date.getHours())}:${padTwo(date.getMinutes())}:${padTwo(date.getSeconds())}`;
}

/**
 * Parse a datetime-local input value (YYYY-MM-DDTHH:mm) as local time.
 */
export function parseDateTimeLocal(value) {
  if (!value?.trim()) return null;

  const trimmed = value.trim();
  const normalized = DATE_TIME_LOCAL_RE.test(trimmed) ? `${trimmed}:00` : trimmed;
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) return null;
  return date;
}

/**
 * Parse an API ISO datetime string for display.
 */
export function parseApiDateTime(isoString) {
  if (!isoString?.trim()) return null;

  const date = new Date(isoString.trim());
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

/**
 * Convert datetime-local value to naive ISO string for FastAPI.
 * Preserves the wall-clock time the user selected.
 */
export function toApiDateTime(datetimeLocalValue) {
  if (!datetimeLocalValue?.trim()) return null;

  const trimmed = datetimeLocalValue.trim();

  if (DATE_TIME_LOCAL_RE.test(trimmed)) {
    return `${trimmed}:00`;
  }

  if (DATE_TIME_LOCAL_WITH_SECONDS_RE.test(trimmed)) {
    return trimmed;
  }

  const parsed = parseDateTimeLocal(trimmed);
  if (!parsed) return null;

  return formatNaiveLocalIso(parsed);
}

/**
 * Convert an API ISO datetime to a datetime-local input value (local wall-clock).
 */
export function toDateTimeLocal(isoString) {
  const date = parseApiDateTime(isoString);
  if (!date) return "";

  return `${date.getFullYear()}-${padTwo(date.getMonth() + 1)}-${padTwo(date.getDate())}T${padTwo(date.getHours())}:${padTwo(date.getMinutes())}`;
}

/**
 * Format an API due_date for UI display.
 */
export function formatDueDate(isoString) {
  const date = parseApiDateTime(isoString);
  if (!date) return isoString ? "Invalid date" : "—";
  return DUE_DATE_DISPLAY.format(date);
}
